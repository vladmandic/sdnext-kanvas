import Konva from 'konva';
import type Kanvas from './Kanvas';

interface WandCache {
  width: number;
  height: number;
  l: Float32Array;
  a: Float32Array;
  b: Float32Array;
  alpha: Uint8Array;
}

function hexToGrayscale(hex: string) {
  const hexval = hex.replace('#', '');
  const r = parseInt(hexval.substring(0, 2), 16);
  const g = parseInt(hexval.substring(2, 4), 16);
  const b = parseInt(hexval.substring(4, 6), 16);
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const grayHex = gray.toString(16).padStart(2, '0');
  return `#${grayHex}${grayHex}${grayHex}`;
}

function hexToRgb(hex: string) {
  const hexval = hex.replace('#', '');
  return {
    r: parseInt(hexval.substring(0, 2), 16),
    g: parseInt(hexval.substring(2, 4), 16),
    b: parseInt(hexval.substring(4, 6), 16),
  };
}

function srgbToLinear(v: number) {
  const n = v / 255;
  if (n <= 0.04045) return n / 12.92;
  return ((n + 0.055) / 1.055) ** 2.4;
}

function rgbToOklab(r: number, g: number, b: number) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l3 = Math.cbrt(Math.max(l, 0));
  const m3 = Math.cbrt(Math.max(m, 0));
  const s3 = Math.cbrt(Math.max(s, 0));
  return {
    l: 0.2104542553 * l3 + 0.7936177850 * m3 - 0.0040720468 * s3,
    a: 1.9779984951 * l3 - 2.4285922050 * m3 + 0.4505937099 * s3,
    b: 0.0259040371 * l3 + 0.7827717662 * m3 - 0.8086757660 * s3,
  };
}

export default class Paint {
  k: Kanvas;
  brushSize: number;
  brushOpacity = 1;
  brushMode = 'source-over';
  brushColor = '#ffffff';
  textFont = 'Calibri';
  textValue = 'Hello World';
  isPainting = false;
  isWanding = false;
  wandTolerance = 18;
  wandSampleMerged = false;
  readonly wandThrottleMs = 50;
  readonly wandFeatherPx = 1;
  wandLastAt = 0;
  wandCapturePending = false;
  wandCache: WandCache | null = null;
  wandDragCanvas: HTMLCanvasElement | null = null;
  wandDragCtx: CanvasRenderingContext2D | null = null;
  wandFillIndex = 0;
  lines = [] as Konva.Line[];

  constructor(k: Kanvas) {
    this.k = k;
    this.brushSize = this.k.settings.settings.brushSize;
  }

  startPaint() {
    this.k.stopActions();
    this.isPainting = true;
    this.k.stage.off('.paint');
    this.k.stage.on('mousedown.paint touchstart.paint', () => {
      if (this.k.imageMode !== 'paint') {
        this.isPainting = false;
        return;
      }
      this.isPainting = true;
      this.k.stages.syncActiveLayerRefs();
      const pos = this.k.stage.getPointerPosition();
      const brushColor = this.k.selectedLayer === 'image' ? this.k.paint.brushColor : hexToGrayscale(this.k.paint.brushColor);
      if (!pos) return;
      const x = pos.x / this.k.resize.scale;
      const y = pos.y / this.k.resize.scale;
      const newLine = new Konva.Line({
        stroke: brushColor,
        strokeWidth: 2 * this.k.paint.brushSize,
        opacity: this.k.paint.brushOpacity,
        globalCompositeOperation: this.k.paint.brushMode as CanvasRenderingContext2D['globalCompositeOperation'],
        lineCap: 'round', // round cap for smoother lines
        lineJoin: 'round',
        points: [x, y, x, y], // add point twice, so we have some drawings even on a simple click
      });
      newLine.on('click', (evt) => this.k.selectNode(evt.target));
      this.lines.push(newLine);
      this.k.group.add(newLine);
    });

    this.k.stage.on('mouseup.paint touchend.paint', () => {
      if (this.isPainting) {
        this.isPainting = false;
        this.k.history.capture('Paint stroke');
      }
    });

    this.k.stage.on('mousemove.paint touchmove.paint', (e) => {
      if (this.k.imageMode !== 'paint') return;
      if (!this.isPainting) return;
      e.evt.preventDefault();
      const pos = this.k.stage.getPointerPosition();
      const lastLine = this.lines[this.lines.length - 1];
      if (!pos || !lastLine) return;
      const x = pos.x / this.k.resize.scale;
      const y = pos.y / this.k.resize.scale;
      const newPoints = lastLine.points().concat([x, y]);
      lastLine.points(newPoints);
    });
  }

  mapWandTolerance() {
    const n = Math.min(Math.max(this.wandTolerance, 0), 100) / 100;
    return 0.008 + ((n ** 2.2) * 0.48); // nonlinear, weighted for low-range precision
  }

  buildWandCache() {
    this.k.stages.syncActiveLayerRefs();
    const sourceCanvas = this.wandSampleMerged
      ? this.k.stage.toCanvas({ x: 0, y: 0, width: this.k.stage.width(), height: this.k.stage.height() })
      : this.k.layer.toCanvas({ x: 0, y: 0, width: this.k.layer.width(), height: this.k.layer.height() });
    const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      this.wandCache = null;
      return;
    }
    const width = Math.round(sourceCanvas.width);
    const height = Math.round(sourceCanvas.height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;
    const pixels = width * height;
    const l = new Float32Array(pixels);
    const a = new Float32Array(pixels);
    const b = new Float32Array(pixels);
    const alpha = new Uint8Array(pixels);
    for (let i = 0; i < pixels; i++) {
      const p = i * 4;
      const lab = rgbToOklab(data[p], data[p + 1], data[p + 2]);
      l[i] = lab.l;
      a[i] = lab.a;
      b[i] = lab.b;
      alpha[i] = data[p + 3];
    }
    this.wandCache = { width, height, l, a, b, alpha };
  }

  ensureWandDragCanvas() {
    const width = Math.max(1, Math.round(this.k.stage.width()));
    const height = Math.max(1, Math.round(this.k.stage.height()));
    this.wandDragCanvas = document.createElement('canvas');
    this.wandDragCanvas.width = width;
    this.wandDragCanvas.height = height;
    this.wandDragCtx = this.wandDragCanvas.getContext('2d', { willReadFrequently: true });
  }

  applyWandAt(x: number, y: number) {
    if (!this.wandCache || !this.wandDragCtx) return false;
    const { width, height, l, a, b, alpha } = this.wandCache;
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    const seed = (y * width) + x;
    const tolerance = this.mapWandTolerance();
    const tolerance2 = tolerance * tolerance;
    const targetL = l[seed];
    const targetA = a[seed];
    const targetB = b[seed];
    const targetAlpha = alpha[seed];
    const visited = new Uint8Array(width * height);
    const included = new Uint8Array(width * height);
    const stack = [seed];
    const region: number[] = [];
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    while (stack.length > 0) {
      const idx = stack.pop() as number;
      if (visited[idx]) continue;
      visited[idx] = 1;
      const dL = l[idx] - targetL;
      const dA = a[idx] - targetA;
      const dB = b[idx] - targetB;
      const d2 = (dL * dL) + (dA * dA) + (dB * dB);
      if (d2 > tolerance2) continue;
      if (Math.abs(alpha[idx] - targetAlpha) > 64) continue;
      included[idx] = 1;
      region.push(idx);
      const px = idx % width;
      const py = Math.floor(idx / width);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      if (px > 0) stack.push(idx - 1);
      if (px < (width - 1)) stack.push(idx + 1);
      if (py > 0) stack.push(idx - width);
      if (py < (height - 1)) stack.push(idx + width);
    }

    if (region.length === 0) return false;
    const bw = (maxX - minX) + 1;
    const bh = (maxY - minY) + 1;
    const imageData = new ImageData(bw, bh);
    const fillColor = this.k.selectedLayer === 'image' ? this.brushColor : hexToGrayscale(this.brushColor);
    const rgb = hexToRgb(fillColor);
    const opacity = Math.round(Math.min(Math.max(this.brushOpacity, 0), 1) * 255);

    for (const idx of region) {
      const px = idx % width;
      const py = Math.floor(idx / width);
      const lx = px - minX;
      const ly = py - minY;
      const out = ((ly * bw) + lx) * 4;
      let edgeAlpha = opacity;
      if (this.wandFeatherPx > 0) {
        const left = px > 0 ? included[idx - 1] : 0;
        const right = px < (width - 1) ? included[idx + 1] : 0;
        const top = py > 0 ? included[idx - width] : 0;
        const bottom = py < (height - 1) ? included[idx + width] : 0;
        if (!left || !right || !top || !bottom) edgeAlpha = Math.round(opacity * 0.7);
      }
      imageData.data[out] = rgb.r;
      imageData.data[out + 1] = rgb.g;
      imageData.data[out + 2] = rgb.b;
      imageData.data[out + 3] = edgeAlpha;
    }

    this.wandDragCtx.putImageData(imageData, minX, minY);
    return true;
  }

  applyWandFromPointer(force = false) {
    if (!this.wandCache) return;
    const now = Date.now();
    if (!force && (now - this.wandLastAt) < this.wandThrottleMs) return;
    const pos = this.k.stage.getPointerPosition();
    if (!pos) return;
    const x = Math.round(pos.x / this.k.resize.scale);
    const y = Math.round(pos.y / this.k.resize.scale);
    if (this.applyWandAt(x, y)) this.wandCapturePending = true;
    this.wandLastAt = now;
  }

  commitWandDrag() {
    if (!this.wandCapturePending || !this.wandDragCanvas) return;
    const snapshot = document.createElement('canvas');
    snapshot.width = this.wandDragCanvas.width;
    snapshot.height = this.wandDragCanvas.height;
    const ctx = snapshot.getContext('2d');
    if (ctx) ctx.drawImage(this.wandDragCanvas, 0, 0);

    const image = new Konva.Image({
      image: snapshot,
      x: 0,
      y: 0,
      draggable: false,
      opacity: 1,
      globalCompositeOperation: this.brushMode as CanvasRenderingContext2D['globalCompositeOperation'],
    });
    this.wandFillIndex += 1;
    image.name(`wand-fill-${this.wandFillIndex}`);
    image.on('click', () => this.k.selectNode(image));
    this.k.group.add(image);
    this.k.layer.batchDraw();
    this.k.history.capture('Wand fill');
  }

  startWand() {
    this.k.stopActions();
    this.k.stage.off('.wand');
    this.k.stage.on('mousedown.wand touchstart.wand', () => {
      if (this.k.imageMode !== 'wand') {
        this.isWanding = false;
        return;
      }
      this.isWanding = true;
      this.wandCapturePending = false;
      this.wandLastAt = 0;
      this.buildWandCache();
      this.ensureWandDragCanvas();
      this.applyWandFromPointer(true);
    });
    this.k.stage.on('mousemove.wand touchmove.wand', (e) => {
      if (this.k.imageMode !== 'wand' || !this.isWanding) return;
      e.evt.preventDefault();
      this.applyWandFromPointer(false);
    });
    this.k.stage.on('mouseup.wand touchend.wand', () => {
      if (!this.isWanding) return;
      this.isWanding = false;
      this.commitWandDrag();
      this.wandCache = null;
      this.wandDragCanvas = null;
      this.wandDragCtx = null;
    });
  }

  stopPaint() {
    this.isPainting = false;
    this.isWanding = false;
    this.k.stage.off('.paint');
    this.k.stage.off('.wand');
    this.k.stage.off('.text');
    this.wandCache = null;
    this.wandDragCanvas = null;
    this.wandDragCtx = null;
    this.k.layer.batchDraw();
  }

  startText() {
    this.k.stopActions();
    this.k.stage.off('.text');
    let isText = true;
    let pos0: Konva.Vector2d | null;
    let pos1: Konva.Vector2d | null;
    this.k.stage.on('mousedown.text touchstart.text', () => {
      if (!isText) return;
      pos0 = this.k.stage.getPointerPosition();
      pos1 = null;
    });
    this.k.stage.on('mouseup.text touchend.text', () => {
      if (!isText) return;
      const textVal = this.k.paint.textValue + ' ';
      if (!textVal || textVal.trim() === '') return;
      pos1 = this.k.stage.getPointerPosition();
      if (!pos0 || !pos1) return;
      this.k.toolbar.resetButtons();
      let fontSize = 4;
      const maxFontSize = 500;
      while (fontSize < maxFontSize) {
        const x0 = Math.min(pos0.x, pos1.x) / this.k.resize.scale;
        const y0 = Math.min(pos0.y, pos1.y) / this.k.resize.scale;
        const x1 = Math.max(pos0.x, pos1.x) / this.k.resize.scale;
        const y1 = Math.max(pos0.y, pos1.y) / this.k.resize.scale;
        const text = new Konva.Text({
          x: x0,
          y: y0,
          width: x1 - x0,
          height: y1 - y0,
          text: textVal,
          fontSize,
          fontFamily: this.k.paint.textFont,
          fill: this.k.paint.brushColor,
          wrap: 'word',
          opacity: this.k.paint.brushOpacity,
          globalCompositeOperation: this.k.paint.brushMode as CanvasRenderingContext2D['globalCompositeOperation'],
          draggable: true,
        });
        const textSize = text.measureSize(textVal);
        if (textSize.height >= (y1 - y0) || textSize.width >= (x1 - x0)) {
          this.k.helpers.showMessage(`Text: "${textVal}" size=${fontSize}`);
          this.k.group.add(text);
          text.on('click', () => this.k.selectNode(text));
          this.k.history.capture('Add text');
          break;
        } else {
          text.destroy();
        }
        fontSize += 1;
      }
      this.k.layer.batchDraw();
      isText = false;
      this.k.stage.off('.text');
    });
  }
}

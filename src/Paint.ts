import Konva from 'konva';
import type Kanvas from './Kanvas';

function hexToGrayscale(hex: string) {
  const hexval = hex.replace('#', '');
  const r = parseInt(hexval.substring(0, 2), 16);
  const g = parseInt(hexval.substring(2, 4), 16);
  const b = parseInt(hexval.substring(4, 6), 16);
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const grayHex = gray.toString(16).padStart(2, '0');
  return `#${grayHex}${grayHex}${grayHex}`;
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

  constructor(k: Kanvas) {
    this.k = k;
    this.brushSize = this.k.settings.settings.brushSize;
  }

  startPaint() {
    this.k.stopActions();
    this.isPainting = true;
    let lastLine;

    this.k.stage.on('mousedown touchstart', () => {
      if (this.k.imageMode !== 'paint') {
        this.isPainting = false;
        return;
      }
      this.isPainting = true;
      this.k.layer = this.k.selectedLayer === 'image' ? this.k.imageLayer : this.k.maskLayer;
      this.k.group = this.k.selectedLayer === 'image' ? this.k.imageGroup : this.k.maskGroup;
      const pos = this.k.stage.getPointerPosition();
      const brushColor = this.k.selectedLayer === 'image' ? this.k.paint.brushColor : hexToGrayscale(this.k.paint.brushColor);
      if (!pos) return;
      const x = pos.x / this.k.resize.scale;
      const y = pos.y / this.k.resize.scale;
      lastLine = new Konva.Line({
        stroke: brushColor,
        strokeWidth: 2 * this.k.paint.brushSize,
        opacity: this.k.paint.brushOpacity,
        globalCompositeOperation: this.k.paint.brushMode as CanvasRenderingContext2D['globalCompositeOperation'],
        lineCap: 'round', // round cap for smoother lines
        lineJoin: 'round',
        points: [x, y, x, y], // add point twice, so we have some drawings even on a simple click
      });
      lastLine.on('click', () => this.k.selectNode(lastLine));
      this.k.group.add(lastLine);
    });

    this.k.stage.on('mouseup touchend', () => {
      if (this.isPainting) {
        this.isPainting = false;
        lastLine = null;
      }
    });

    this.k.stage.on('mousemove touchmove', (e) => {
      if (this.k.imageMode !== 'paint') return;
      if (!this.isPainting) return;
      e.evt.preventDefault();
      const pos = this.k.stage.getPointerPosition();
      if (!pos || !lastLine) return;
      const x = pos.x / this.k.resize.scale;
      const y = pos.y / this.k.resize.scale;
      const newPoints = lastLine.points().concat([x, y]);
      lastLine.points(newPoints);
    });
  }

  stopPaint() {
    this.isPainting = false;
    this.k.layer.batchDraw();
  }

  startText() {
    this.k.stopActions();
    let isText = true;
    let pos0: Konva.Vector2d | null;
    let pos1: Konva.Vector2d | null;
    this.k.stage.on('mousedown touchstart', () => {
      if (!isText) return;
      pos0 = this.k.stage.getPointerPosition();
      pos1 = null;
    });
    this.k.stage.on('mouseup touchend', () => {
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
          break;
        } else {
          text.destroy();
        }
        fontSize += 1;
      }
      this.k.layer.batchDraw();
      isText = false;
    });
  }
}

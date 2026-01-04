import Konva from 'konva';
import Kanvas from './Kanvas';

export default class Resize {
  k: Kanvas;
  clipBox: Konva.Rect | undefined;
  debounce: number = 200;
  debounceFit: number = 0;
  debounceResize: number = 0;
  scale: number = 1;

  constructor(k: Kanvas) {
    this.k = k;
  }

  async initSettings() {
    this.fitStage();
  }

  async _fitStage(el: HTMLElement) {
    if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
    if (this.k.helpers.isEmpty()) {
      this.k.wrapper.style.overflow = 'hidden';
    }
    if (this.k.settings.settings.zoomLock) {
      this.k.wrapper.style.overflow = 'auto';
      this.scale = 1;
    } else {
      this.k.wrapper.style.overflow = 'hidden';
      this.scale = Math.min(
        (el.clientWidth - 0) / this.k.stage.width(),
        (el.clientHeight - 32) / this.k.stage.height(), // adjust for toolbar
      );
    }
    el.querySelectorAll('canvas').forEach((canvas) => {
      (canvas as HTMLCanvasElement).style.width = `${this.k.stage.width() * this.scale}px`; // eslint-disable-line no-param-reassign
      (canvas as HTMLCanvasElement).style.height = `${this.k.stage.height() * this.scale}px`; // eslint-disable-line no-param-reassign
    });
    const kanvasEl = document.getElementById(`${this.k.containerId}-kanvas`);
    if (kanvasEl && !this.k.helpers.isEmpty()) {
      if (el.clientWidth > this.k.stage.width() * this.scale) {
        kanvasEl.style.marginLeft = `${(el.clientWidth - this.k.stage.width() * this.scale) / 2}px`;
      } else {
        kanvasEl.style.marginLeft = '0px';
      }
    }
    if (!this.k.helpers.isEmpty()) this.k.helpers.showMessage(`Zoom: ${Math.round(this.scale * 100)}%`);
  }

  async fitStage(el: HTMLElement = this.k.wrapper) {
    // this._fitStage(el);
    clearTimeout(this.debounceFit);
    this.debounceFit = window.setTimeout(() => this._fitStage(el), this.debounce);
  }

  async updateSizeInputs() {
    const widthInput = document.getElementById(`${this.k.containerId}-image-width`) as HTMLInputElement;
    const heightInput = document.getElementById(`${this.k.containerId}-image-height`) as HTMLInputElement;
    if (widthInput && heightInput) {
      widthInput.value = String(Math.round(this.k.stage.width()));
      heightInput.value = String(Math.round(this.k.stage.height()));
    }
  }

  async _resizeStage(el: Konva.Image | Konva.Group, force: boolean = false) {
    const box = el.getClientRect();
    const width = this.k.stage.width();
    const height = this.k.stage.height();
    // resizing stage
    if (force) {
      this.k.stage.width(box.x + box.width);
      this.k.stage.height(box.y + box.height);
    }
    if (el === this.k.group) {
      if (box.x > 0) this.k.stage.width(width - box.x);
      if (box.y > 0) this.k.stage.height(height - box.y);
      if (box.width < width) this.k.stage.width(box.width);
      if (box.height < height) this.k.stage.height(box.height);
      for (const child of el.getChildren()) child.setPosition({ x: 0, y: 0 });
      this.k.helpers.showMessage(`Resize group: x=${Math.round(box.x)} y=${Math.round(box.y)} width=${Math.round(box.width)} height=${Math.round(box.height)}`);
    } else {
      if (box.x + box.width > this.k.stage.width()) this.k.stage.width(box.x + box.width);
      if (box.y + box.height > this.k.stage.height()) this.k.stage.height(box.y + box.height);
      this.k.helpers.showMessage(`Resize image: x=${Math.round(box.x)} y=${Math.round(box.y)} width=${Math.round(box.width)} height=${Math.round(box.height)}`);
    }
    // resizing layers and toolbar
    if (width !== this.k.stage.width() || height !== this.k.stage.height()) {
      const primary = document.querySelector('.konvajs-content canvas:first-of-type') as HTMLCanvasElement;
      if (primary) primary.style.background = 'black';
      this.k.imageLayer.size({ width: this.k.stage.width(), height: this.k.stage.height() });
      this.k.maskLayer.size({ width: this.k.stage.width(), height: this.k.stage.height() });
      this.k.toolbar.el.style.maxWidth = `${this.k.stage.width()}px`;
      this.updateSizeInputs();
      this.fitStage();
    }
    // limit max size
    if ((this.k.stage.width() > this.k.settings.settings.maxSize) || (this.k.stage.height() > this.k.settings.settings.maxSize)) {
      const rescale = Math.min((this.k.settings.settings.maxSize / this.k.stage.width()), (this.k.settings.settings.maxSize / this.k.stage.height()));
      const x = Math.round(this.k.stage.width() * rescale);
      const y = Math.round(this.k.stage.height() * rescale);
      this.k.stage.size({ width: x, height: y });
      this.k.helpers.showMessage(`Stage: width=${width} height=${height} max=${this.k.settings.settings.maxSize}`);
      this.updateSizeInputs();
    }
  }

  async resizeStageToFit(el: Konva.Image | Konva.Group, force: boolean = false) {
    clearTimeout(this.debounceResize);
    this.debounceResize = window.setTimeout(() => this._resizeStage(el, force), this.debounce);
  }

  async resizeStage(width: number, height: number) {
    this.k.stage.width(width);
    this.k.stage.height(height);
    this.k.imageLayer.size({ width: this.k.stage.width(), height: this.k.stage.height() });
    this.k.maskLayer.size({ width: this.k.stage.width(), height: this.k.stage.height() });
    this.k.toolbar.el.style.maxWidth = `${this.k.stage.width()}px`;
    this.k.helpers.showMessage(`Stage width=${width} height=${height} resized`);
    this.k.resize.fitStage();
  }

  startResize() {
    this.k.stopActions();
    const images = this.k.stage.find('Image');
    images.forEach((image) => {
      image.draggable(true);
      const transformer = new Konva.Transformer({
        nodes: [image],
        borderStroke: '#298',
        borderStrokeWidth: 3,
        anchorFill: '#298',
        anchorStroke: '#298',
        anchorStrokeWidth: 2,
        anchorSize: 10,
        anchorCornerRadius: 2,
      });
      this.k.layer.add(transformer);
      image.on('transform', () => this.resizeStageToFit(image as Konva.Image));
      image.on('dragmove', () => this.resizeStageToFit(image as Konva.Image));
    });
  }

  stopResize() {
    const images = this.k.stage.find('Image');
    images.forEach((image) => image.draggable(false));
    this.k.layer.find('Transformer').forEach((t) => t.destroy());
    this.k.layer.batchDraw();
  }

  async applyClip(clipBox: Konva.Rect) {
    const box = clipBox.getClientRect();
    this.k.group.clip({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    });
    this.k.layer.batchDraw();
  }

  startClip() {
    this.k.stopActions();
    const box = this.k.group.getClientRect();
    this.clipBox = new Konva.Rect({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      stroke: '#923',
      draggable: true,
    });
    this.k.group.add(this.clipBox);
    const clipTransformer = new Konva.Transformer({
      nodes: [this.clipBox],
      rotateEnabled: false,
      borderStroke: '#923',
      borderStrokeWidth: 3,
      anchorFill: '#923',
      anchorStroke: '#923',
      anchorStrokeWidth: 2,
      anchorSize: 10,
      anchorCornerRadius: 2,
    });
    this.k.layer.add(clipTransformer);
    this.clipBox.on('transformend dragend', () => this.applyClip(this.clipBox as Konva.Rect));
  }

  stopClip() {
    if (this.clipBox) this.clipBox.destroy();
    this.k.layer.find('Transformer').forEach((t) => t.destroy());
    // this.k.group.clip(null);
    this.k.layer.batchDraw();
  }
}

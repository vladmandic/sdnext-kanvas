import Konva from 'konva';
import type Kanvas from './Kanvas';

export default class Upload {
  k: Kanvas;
  constructor(k: Kanvas) {
    this.k = k;
  }

  async pasteImage(e: ClipboardEvent) {
    const items = e.clipboardData?.items || [];
    if (!items) return;
    for (const i in items) {
      const item = items[i];
      if (!item?.type?.startsWith('image/')) continue;
      const file = item.getAsFile();
      if (!file) continue;
      const url = URL.createObjectURL(file);
      const dropImage = new Image();
      dropImage.onload = () => {
        if (!this.k.stage) return;
        const image = new Konva.Image({
          image: dropImage,
          x: 0,
          y: 0,
          draggable: false,
          opacity: this.k.opacity,
        });
        image.name(file.name);
        this.k.controls.style.display = 'contents';
        this.k.helpers.showMessage(`Pasted ${this.k.selectedLayer}: ${file.name} ${image.width()} x ${image.height()}`);
        URL.revokeObjectURL(url);
        if (this.k.helpers.isEmpty()) {
          this.k.stage.size({ width: 0, height: 0 });
          this.k.resize.resizeStageToFit(image);
        }
        this.k.group.add(image);
        if (this.k.selectedLayer === 'mask') {
          image.cache();
          image.filters([Konva.Filters.Grayscale]);
          image.opacity(0.5);
        }
        image.on('transform', () => this.k.resize.resizeStageToFit(image));
        image.on('dragmove', () => this.k.resize.resizeStageToFit(image));
        image.on('click', () => this.k.selectNode(image));
        this.k.stage.batchDraw();
        this.k.resize.resizeStageToFit(image);
        if (this.k.helpers.isEmpty()) this.k.onchange();
      };
      dropImage.onerror = () => URL.revokeObjectURL(url);
      dropImage.crossOrigin = 'Anonymous';
      dropImage.src = url;
    }
  }

  async uploadImage(e) {
    e.preventDefault();
    this.k.stopActions();
    this.k.toolbar.resetButtons();
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    const rect = this.k.stage.container().getBoundingClientRect();
    const dropX = this.k.helpers.isEmpty() ? 0 : (e.clientX || 0) - rect.left;
    const dropY = this.k.helpers.isEmpty() ? 0 : (e.clientY || 0) - rect.top;
    const shouldNotify = !this.k.imageGroup.hasChildren();
    for (const file of files as File[]) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      const dropImage = new Image();
      this.k.layer = this.k.selectedLayer === 'image' ? this.k.imageLayer : this.k.maskLayer;
      this.k.group = this.k.selectedLayer === 'image' ? this.k.imageGroup : this.k.maskGroup;
      dropImage.onload = () => {
        if (!this.k.stage) return;
        const image = new Konva.Image({
          image: dropImage,
          x: dropX,
          y: dropY,
          draggable: false,
          opacity: this.k.opacity,
        });
        image.name(file.name);
        this.k.controls.style.display = 'contents';
        this.k.helpers.showMessage(`Loaded ${this.k.selectedLayer}: ${file.name} ${image.width()} x ${image.height()}`);
        URL.revokeObjectURL(url);
        if (this.k.helpers.isEmpty()) {
          this.k.stage.size({ width: 0, height: 0 });
          this.k.resize.resizeStageToFit(image);
        }
        this.k.group.add(image);
        if (this.k.selectedLayer === 'mask') {
          image.cache();
          image.filters([Konva.Filters.Grayscale]);
          image.opacity(0.5);
        }
        image.on('transform', () => this.k.resize.resizeStageToFit(image));
        image.on('dragmove', () => this.k.resize.resizeStageToFit(image));
        image.on('click', () => this.k.selectNode(image));
        this.k.stage.batchDraw();
        this.k.resize.resizeStageToFit(image);
        if (shouldNotify) this.k.onchange();
      };
      dropImage.onerror = () => URL.revokeObjectURL(url);
      dropImage.crossOrigin = 'Anonymous';
      dropImage.src = url;
    }
  }

  async uploadFile(checkEmpty = true) {
    if (checkEmpty && !this.k.helpers.isEmpty()) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => this.uploadImage(e);
    input.click();
  }

  async updateOpacity(opacity: number) {
    this.k.opacity = opacity;
    if (this.k.selected && this.k.selected instanceof Konva.Image) {
      this.k.selected.opacity(opacity);
      this.k.layer.batchDraw();
    }
  }
}

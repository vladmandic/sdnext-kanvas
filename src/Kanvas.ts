import Konva from 'konva';
import Settings from './Settings';
import Helpers from './Helpers';
import Toolbar from './Toolbar';
import Upload from './Upload';
import Resize from './Resize';
import Paint from './Paint';
import Outpaint from './Outpaint';
import Filter from './Filters';
import Pan from './Pan';

export default class Kanvas {
  initial: boolean = true;
  // elements
  containerId: string;
  wrapper: HTMLDivElement;
  container: HTMLDivElement;
  controls: HTMLSpanElement;
  // konva objects
  stage!: Konva.Stage;
  imageLayer!: Konva.Layer;
  maskLayer!: Konva.Layer;
  layer!: Konva.Layer; // meta
  group!: Konva.Group; // meta
  imageGroup!: Konva.Group;
  maskGroup!: Konva.Group;
  selected!: Konva.Node;
  // modes
  selectedLayer: 'image' | 'mask' = 'image';
  imageMode: 'none' | 'upload' | 'resize' | 'crop' | 'paint' | 'filters' | 'text' | 'outpaint' = 'upload';
  // variables
  opacity: number = 1;
  // class extensions
  settings: Settings;
  toolbar: Toolbar;
  helpers: Helpers;
  upload: Upload;
  resize: Resize;
  paint: Paint;
  outpaint: Outpaint;
  filter: Filter;
  pan: Pan;

  // callbacks
  onchange: () => void;

  initImage() {
    this.imageLayer = new Konva.Layer();
    this.imageGroup = new Konva.Group();
    this.imageLayer.add(this.imageGroup);
    return this.imageLayer;
  }

  initMask() {
    this.maskLayer = new Konva.Layer();
    this.maskGroup = new Konva.Group();
    this.maskLayer.add(this.maskGroup);
    this.maskLayer.opacity(0.5);
    return this.maskLayer;
  }

  destroy(): void {
    if (this.stage) {
      try { this.stage.destroy(); } catch { /* ignore */ }
    }
  }

  initialize(defaultWidth = 1024, defaultHeight = 256) {
    this.destroy();
    this.stage = new Konva.Stage({
      container: `${this.containerId}-kanvas`,
      width: defaultWidth,
      height: defaultHeight,
    });
    this.stage.add(this.initImage());
    this.stage.add(this.initMask());
    this.layer = this.selectedLayer === 'image' ? this.imageLayer : this.maskLayer;
    this.group = this.selectedLayer === 'image' ? this.imageGroup : this.maskGroup;
    if (this.controls) this.controls.style.display = 'none';
    if (this.helpers) this.helpers.bindStage();
    if (this.pan) this.pan.bindPan();
    if (this.outpaint) this.outpaint.outpaintActive = false;
  }

  constructor(containerId: string, opts: { width?: number; height?: number } = {}) {
    this.onchange = () => {};
    this.containerId = containerId;
    const wrapperEl = document.getElementById(containerId);
    if (!wrapperEl) {
      throw new Error(`Kanvas: container=${containerId} not found`);
    }
    this.wrapper = wrapperEl as HTMLDivElement;
    this.wrapper.classList.add('kanvas-wrapper');
    // create nodes with DOM APIs (safer than innerHTML)
    const toolbarEl = document.createElement('div');
    toolbarEl.id = `${this.containerId}-toolbar`;
    const canvasEl = document.createElement('div');
    canvasEl.className = 'kanvas';
    canvasEl.id = `${this.containerId}-kanvas`;
    // clear wrapper and append
    this.wrapper.textContent = '';
    this.wrapper.appendChild(toolbarEl);
    this.wrapper.appendChild(canvasEl);
    this.container = canvasEl;

    // store initial width/height from opts or defaults
    const stageWidth = opts.width ?? 1024;
    const stageHeight = opts.height ?? 256;
    this.initialize(stageWidth, stageHeight);

    // init helpers
    this.helpers = new Helpers(this);
    this.settings = new Settings(this);
    this.toolbar = new Toolbar(this);
    this.resize = new Resize(this);
    this.upload = new Upload(this);
    this.paint = new Paint(this);
    this.outpaint = new Outpaint(this);
    this.filter = new Filter(this);
    this.pan = new Pan(this);

    // log first init
    if (this.initial) this.helpers.kanvasLog(`konva=${Konva.version} width=${this.stage.width()} height=${this.stage.height()} id="${this.containerId}"`);
    this.controls = document.getElementById(`${this.containerId}-active-controls`) as HTMLSpanElement;
    this.initial = false;

    // init events
    this.helpers.bindEvents();
    this.helpers.bindStage();
    this.toolbar.bindControls();
    this.pan.bindPan();

    // initial size
    const resizeObserver = new ResizeObserver(() => this.resize.fitStage());
    resizeObserver.observe(this.wrapper);
    this.resize.fitStage();
  }

  async selectNode(node: Konva.Node) {
    this.pan.moving = false;
    this.selected = node;
    if (!this.selected) return;
    const nodeType = this.selected.getClassName();
    if (nodeType === 'Image') this.helpers.showMessage(`Selected: ${nodeType} x=${Math.round(this.selected.x())} y=${Math.round(this.selected.y())} width=${Math.round(this.selected.width())} height=${Math.round(this.selected.height())}`);
    else if (nodeType === 'Line') this.helpers.showMessage(`Selected: ${nodeType} points=${(this.selected as Konva.Line).points().length / 2}`);
    else if (nodeType === 'Text') this.helpers.showMessage(`Selected: ${nodeType} width=${Math.round(this.selected.width())} height=${Math.round(this.selected.height())}`);
    else this.helpers.showMessage(`Selected: ${nodeType}`);
  }

  async removeNode(node: Konva.Node) {
    if (!node) return;
    const nodeType = node.getClassName();
    node.destroy();
    for (const shape of this.layer.getChildren()) {
      if (shape instanceof Konva.Transformer && shape.nodes().includes(node)) shape.destroy();
    }
    this.layer.draw();
    this.helpers.showMessage(`Node removed: ${nodeType}`);
  }

  stopActions() {
    this.resize.stopClip();
    this.resize.stopResize();
    this.paint.stopPaint();
    /*
    const shapes = this.k.stage.find('Shape');
    for (const shape of shapes) {
    }
    */
  }

  addImage(url: string) {
    this.stopActions();
    const onImage = (img: Konva.Image) => {
      this.imageGroup.add(img);
      this.helpers.showMessage(`Image added: ${Math.round(img.width())}x${Math.round(img.height())}`);
      this.resize.resizeStageToFit(img, true);
    };
    const onError = () => {
      this.helpers.showMessage('Error loading image');
    };
    Konva.Image.fromURL(url, onImage, onError);
  }

  getImageData() {
    const imageCanvas = this.imageLayer.toCanvas({ x: 0, y: 0, width: this.imageLayer.width(), height: this.imageLayer.height() });
    const ctxCanvas = imageCanvas.getContext('2d') as CanvasRenderingContext2D;
    let imageData: ImageData | null = ctxCanvas.getImageData(0, 0, imageCanvas.width, imageCanvas.height); // imageData.data is Uint8ClampedArray [r,g,b,a,...]
    const maskCanvas = this.maskLayer.toCanvas({ x: 0, y: 0, width: this.maskLayer.width(), height: this.maskLayer.height() });
    const ctxMask = maskCanvas.getContext('2d') as CanvasRenderingContext2D;
    let maskData: ImageData | null = ctxMask.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const imageEmpty = imageData.data.every((value) => value === 0);
    const maskEmpty = maskData.data.every((value) => value === 0);
    if (imageEmpty) {
      imageData = null;
      this.helpers.showMessage('No image');
      return null;
    }
    if (maskEmpty) {
      maskData = null;
      this.helpers.showMessage(`Send image ${imageData.width} x ${imageData.height}`);
      return {
        kanvas: true,
        image: imageData?.data,
        imageWidth: imageData?.width,
        imageHeight: imageData?.height,
      };
    }
    this.helpers.showMessage(`Send image ${imageData.width} x ${imageData.height} mask ${maskData.width} x ${maskData.height}`);
    return {
      kanvas: true,
      image: imageData?.data,
      imageWidth: imageData?.width,
      imageHeight: imageData?.height,
      mask: maskData?.data,
      maskWidth: maskData?.width,
      maskHeight: maskData?.height,
    };
  }

  getImage() {
    let imageData: string | null = null;
    let maskData: string | null = null;
    if (this.imageGroup.hasChildren()) {
      const imageCanvas = this.imageLayer.toCanvas({ x: 0, y: 0, width: this.imageLayer.width(), height: this.imageLayer.height() }) as HTMLCanvasElement;
      imageData = imageCanvas.toDataURL('image/png');
    }
    if (this.maskGroup.hasChildren()) {
      const maskCanvas = this.maskLayer.toCanvas({ x: 0, y: 0, width: this.maskLayer.width(), height: this.maskLayer.height() }) as HTMLCanvasElement;
      maskData = maskCanvas.toDataURL('image/png');
    }
    if (!imageData) {
      return null;
    }
    const result = { kanvas: true };
    if (imageData) result['image'] = imageData;
    if (maskData) result['mask'] = maskData;
    this.helpers.showMessage(`Send image: ${imageData ? imageData.length : 0} mask: ${maskData ? maskData.length : 0}`);
    return result;
  }
}

// expose Kanvas globally
declare global {
  interface Window {
    Kanvas: typeof Kanvas;
  }
}
window.Kanvas = Kanvas;
// window.kanvas = (el: string) => new Kanvas(el);

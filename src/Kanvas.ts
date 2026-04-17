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
import Shapes from './Shapes';
import Footer from './Footer';
import Stages from './Stages';

export default class Kanvas {
  initial = true;
  log: (message: string) => void;
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
  opacity = 1;
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
  shapes: Shapes;
  stages: Stages;
  footer: Footer;

  // callbacks
  onchange: () => void;

  destroy(): void {
    if (this.stage) {
      try { this.stage.destroy(); } catch { /* ignore */ }
    }
  }

  initialize(defaultWidth = 1024, defaultHeight = 256) {
    this.destroy();
    this.stages.reset();
    this.stage = new Konva.Stage({
      container: `${this.containerId}-kanvas`,
      width: defaultWidth,
      height: defaultHeight,
    });
    this.stages.initializeLayers(defaultWidth, defaultHeight);
    this.stages.createStage('Stage 1');
    if (this.controls) this.controls.style.display = 'none';
    if (this.helpers) this.helpers.bindStage();
    if (this.pan) this.pan.bindPan();
    if (this.outpaint) this.outpaint.outpaintActive = false;
    if (this.shapes) this.shapes.drawShapes();
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
    const footerEl = document.createElement('div');
    footerEl.id = `${this.containerId}-footer`;
    // clear wrapper and append
    this.wrapper.textContent = '';
    this.wrapper.tabIndex = -1;
    this.wrapper.appendChild(toolbarEl);
    this.wrapper.appendChild(canvasEl);
    this.wrapper.appendChild(footerEl);
    this.container = canvasEl;

    this.stages = new Stages(this);

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
    this.shapes = new Shapes(this);
    this.footer = new Footer(this);
    this.log = this.helpers.kanvasLog; // expose log function

    // log first init
    if (this.initial) this.log(`konva=${Konva.version} width=${this.stage.width()} height=${this.stage.height()} id="${this.containerId}"`);
    this.controls = document.getElementById(`${this.containerId}-active-controls`) as HTMLSpanElement;
    this.initial = false;

    // init events
    this.helpers.bindEvents();
    this.helpers.bindStage();
    this.toolbar.bindControls();
    this.pan.bindPan();
    this.shapes.drawShapes();

    // register clipboard paste
    this.wrapper.focus();
    this.wrapper.addEventListener('paste', (evt) => this.upload.pasteImage(evt));

    // initial size
    const resizeObserver = new ResizeObserver(() => this.resize.fitStage());
    resizeObserver.observe(this.wrapper);
    this.resize.fitStage();
  }

  async selectRegister() {
    for (const shape of this.group.getChildren()) {
      if (shape instanceof Konva.Shape) shape.on('click', (evt) => this.selectNode(evt.target));
    }
  }

  async selectNode(node: Konva.Node) {
    if (!node) return;
    const valid = node?.parent === this.group || node?.parent === this.layer;
    if (!valid) return;
    this.pan.moving = false;
    this.selected = node;
    const nodeType = this.selected.getClassName();
    if (nodeType === 'Image') this.helpers.showMessage(`Selected: ${nodeType}/${this.selectedLayer} x=${Math.round(this.selected.x())} y=${Math.round(this.selected.y())} width=${Math.round(this.selected.width())} height=${Math.round(this.selected.height())}`);
    else if (nodeType === 'Line') this.helpers.showMessage(`Selected: ${nodeType}/${this.selectedLayer} points=${(this.selected as Konva.Line).points().length / 2}`);
    else if (nodeType === 'Text') this.helpers.showMessage(`Selected: ${nodeType}/${this.selectedLayer} width=${Math.round(this.selected.width())} height=${Math.round(this.selected.height())}`);
    else this.helpers.showMessage(`Selected: ${nodeType}`);

    this.layer.find('Transformer').forEach((t) => t.destroy());
    if (nodeType !== 'Image') {
      node.draggable(true);
      const tr = new Konva.Transformer({
        nodes: [this.selected],
        rotateEnabled: nodeType !== 'Line', // disable rotation for lines
        borderStroke: '#298',
        borderStrokeWidth: 2,
        anchorFill: '#298',
        anchorStroke: '#298',
        anchorStrokeWidth: 2,
        anchorSize: 10,
        anchorCornerRadius: 2,
      });
      this.layer.add(tr);
      this.layer.batchDraw();
    }
    this.shapes.refresh();
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
    this.shapes.refresh();
  }

  stopActions() {
    // this.imageMode = 'none';
    this.resize.stopClip();
    this.resize.stopResize();
    this.paint.stopPaint();
  }

  notifyImage() {
    const kanvasChangeButton = 'kanvas-change-button';
    const btn = document.getElementById(kanvasChangeButton);
    if (btn) {
      this.log(`Notify width=${this.stage.width()} height=${this.stage.height()}`);
      btn.click();
    }
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
      const imageCanvas = this.imageLayer.toCanvas({ x: 0, y: 0, width: this.imageLayer.width(), height: this.imageLayer.height() });
      imageData = imageCanvas.toDataURL('image/png');
    }
    if (this.maskGroup.hasChildren()) {
      const maskCanvas = this.maskLayer.toCanvas({ x: 0, y: 0, width: this.maskLayer.width(), height: this.maskLayer.height() });
      maskData = maskCanvas.toDataURL('image/png');
    }
    if (!imageData) {
      return null;
    }
    const result = { kanvas: true, image: null as string | null, mask: null as string | null };
    if (imageData) result.image = imageData;
    if (maskData) result.mask = maskData;
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

// @ts-ignore
window.Kanvas = Kanvas;
// window.kanvas = (el: string) => new Kanvas(el);

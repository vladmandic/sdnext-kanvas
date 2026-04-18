import type Kanvas from './Kanvas';

export default class Toolbar {
  k: Kanvas;
  el: HTMLElement;
  toolsTitleEl: HTMLElement | null = null;
  btnSelectImage: HTMLElement | null = null;
  btnSelectMask: HTMLElement | null = null;
  btnUpload: HTMLElement | null = null;
  btnPaste: HTMLElement | null = null;
  btnRemove: HTMLElement | null = null;
  btnUndo: HTMLElement | null = null;
  btnRedo: HTMLElement | null = null;
  btnReset: HTMLElement | null = null;
  btnRefresh: HTMLElement | null = null;
  btnResize: HTMLElement | null = null;
  btnCrop: HTMLElement | null = null;
  btnPaint: HTMLElement | null = null;
  btnWand: HTMLElement | null = null;
  btnFilters: HTMLElement | null = null;
  btnText: HTMLElement | null = null;
  btnOutpaint: HTMLElement | null = null;

  constructor(k: Kanvas) {
    this.k = k;
    this.el = document.getElementById(`${this.k.containerId}-toolbar`) as HTMLElement;
    this.el.classList.add('kanvas-toolbar');
    this.el.classList.add('active');
    this.el.innerHTML = `
      <span class="kanvas-button active" title="Select image layer as active layer" id="${this.k.containerId}-button-image">\udb82\udd76</span>
      <span class="kanvas-button" title="Select mask layer as active layer" id="${this.k.containerId}-button-mask">\udb80\udee9</span>

      <span class="kanvas-separator"> | </span>
      <span class="kanvas-button" title="Upload image to active layer" id="${this.k.containerId}-button-upload">\udb82\udc7c</span>
      <span class="kanvas-button" title="Paste image from clipboard" id="${this.k.containerId}-button-paste">\udb86\ude00</span>
      <span class="kanvas-button" title="Remove currently selected object" id="${this.k.containerId}-button-remove">\udb85\udc18</span>
      <span class="kanvas-button" title="Undo" id="${this.k.containerId}-button-undo">⟲</span>
      <span class="kanvas-button" title="Redo" id="${this.k.containerId}-button-redo">⟳</span>
      <span class="kanvas-button" title="Reset stage" id="${this.k.containerId}-button-reset">\uf1b8</span>

      <span id="${this.k.containerId}-active-controls" style="display: none;">
        <span id="${this.k.containerId}-image-controls" class="kanvas-section active">
          <input type="range" id="${this.k.containerId}-image-opacity" class="kanvas-slider" min="0" max="1" step="0.01" value="1" title="Change image opacity for currently selected image" />
        </span>

        <span class="kanvas-separator"> | </span>
        <span class="kanvas-button" title="Switch to select mode" id="${this.k.containerId}-button-refresh">\uf124</span>
        <span class="kanvas-button" title="Move or resize currently selected image" id="${this.k.containerId}-button-resize">\udb81\ude55</span>
        <span class="kanvas-button" title="Crop currently selected image" id="${this.k.containerId}-button-crop">\udb80\udd9e</span>
        <span class="kanvas-button" title="Free Paint in currently selected layer" id="${this.k.containerId}-button-paint">\uf1fc</span>
        <span class="kanvas-button" title="Magic wand paint in active layer" id="${this.k.containerId}-button-wand">\uebcf</span>
        <span class="kanvas-button" title="Outpaint" id="${this.k.containerId}-button-outpaint">\udb80\udc4c</span>
        <span class="kanvas-button" title="Apply filters on currently selected image" id="${this.k.containerId}-button-filters">\udb80\udef0</span>
        <span class="kanvas-button" title="Draw text" id="${this.k.containerId}-button-text">\udb80\ude84</span>

        <span id="${this.k.containerId}-paint-controls" class="kanvas-section">
          <input type="range" id="${this.k.containerId}-brush-size" class="kanvas-slider" min="1" max="100" step="1" value="20" title="Brush size" />
          <input type="range" id="${this.k.containerId}-wand-tolerance" class="kanvas-slider" min="0" max="100" step="1" value="18" title="Magic wand tolerance" />
          <input type="range" id="${this.k.containerId}-brush-opacity" class="kanvas-slider" min="0" max="1" step="0.01" value="1" title="Brush opacity" />
          <select id="${this.k.containerId}-brush-mode" class="kanvas-select" title="Brush mode">
            <option value="source-over">source-over</option>
            <option value="destination-out">destination-out</option>
            <option value="darken">darken</option>
            <option value="lighten">lighten</option>
            <option value="color-dodge">color-dodge</option>
            <option value="color-burn">color-burn</option>
            <option value="hard-light">hard-light</option>
            <option value="soft-light">soft-light</option>
            <option value="difference">difference</option>
            <option value="exclusion">exclusion</option>
            <option value="hue">hue</option>
            <option value="saturation">saturation</option>
            <option value="color">color</option>
            <option value="luminosity">luminosity</option>
          </select>
          <input type="color" id="${this.k.containerId}-brush-color" class="kanvas-colorpicker" value="#ffffff" title="Brush color" />
          <span class="kanvas-text" title="Sample merged image+mask for wand matching">merged</span>
          <input type="checkbox" id="${this.k.containerId}-wand-sample-merged" class="kanvas-checkbox" title="Sample merged image+mask for wand matching" />
        </span>

        <span id="${this.k.containerId}-outpaint-controls" class="kanvas-section">
          <input type="range" id="${this.k.containerId}-outpaint-blur" class="kanvas-slider" min="0" max="1" step="0.01" value="0.35" title="Outpaint edge blur" />
          <input type="range" id="${this.k.containerId}-outpaint-expand" class="kanvas-slider" min="0" max="1" step="0.01" value="0.15" title="Outpaint edge expand" />
        </span>

        <span id="${this.k.containerId}-filter-controls" class="kanvas-section">
          <input type="range" id="${this.k.containerId}-filter-value" class="kanvas-slider" min="0" max="100" step="1" value="10" title="Filter value" />
          <select id="${this.k.containerId}-filter-name" class="kanvas-select" title="Active image filter">
            <option value="blur">blur</option>
            <option value="brightness">brightness</option>
            <option value="contrast">contrast</option>
            <option value="enhance">enhance</option>
            <option value="grayscale">grayscale</option>
            <option value="invert">invert</option>
            <option value="mask">mask</option>
            <option value="noise">noise</option>
            <option value="pixelate">pixelate</option>
            <option value="threshold">threshold</option>
          </select>
        </span>

        <span id="${this.k.containerId}-text-controls" class="kanvas-section">
          <input type="text" id="${this.k.containerId}-text-font" class="kanvas-textbox" value="Calibri" title="Text font" />
          <input type="text" id="${this.k.containerId}-text-value" class="kanvas-textbox" placeholder="enter text" title="Text value" />
        </span>

        <span class="kanvas-separator"> | </span>
        <span class="kanvas-button" title="Zoom in" id="${this.k.containerId}-button-zoomin">\uf531</span>
        <span class="kanvas-button" title="Zoom lock" id="${this.k.containerId}-button-zoomlock">\udb84\ude76</span>
        <span class="kanvas-button" title="Zoom out" id="${this.k.containerId}-button-zoomout">\uf532</span>
      </span>

      <span class="kanvas-button" title="Information" id="${this.k.containerId}-button-info">\udb80\udefd</span>
    `;
  }

  async resetButtons() {
    this.k.pan.moving = false;
    document.getElementById(`${this.k.containerId}-button-resize`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-button-crop`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-button-paint`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-button-wand`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-button-filters`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-button-text`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-button-outpaint`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-paint-controls`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-filter-controls`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-text-controls`)?.classList.remove('active');
    document.getElementById(`${this.k.containerId}-outpaint-controls`)?.classList.remove('active');
    this.setToolsTitle('none');
    this.k.imageLayer.batchDraw();
    this.k.maskLayer.batchDraw();
  }

  async show() {
    this.el.classList.add('active');
  }

  async hide() {
    if (this.k.settings.settings.allowHide) this.el.classList.remove('active');
  }

  updateHistoryButtons(canUndo: boolean, canRedo: boolean) {
    this.btnUndo?.classList.toggle('disabled', !canUndo);
    this.btnRedo?.classList.toggle('disabled', !canRedo);
  }

  mountOverlayTools() {
    const toolsContainer = this.k.shapes.getToolsContainer();
    this.toolsTitleEl = this.k.shapes.getToolsTitleElement();
    if (!toolsContainer) return;
    const controlIds = ['paint-controls', 'outpaint-controls', 'filter-controls', 'text-controls'];
    controlIds.forEach((idSuffix) => {
      const control = document.getElementById(`${this.k.containerId}-${idSuffix}`);
      if (control) toolsContainer.appendChild(control);
    });
  }

  setToolsTitle(toolName: string) {
    if (!this.toolsTitleEl) return;
    this.toolsTitleEl.textContent = `Tool: ${toolName}`;
  }

  async bindControls() {
    this.mountOverlayTools();
    // toolbar
    this.el.onclick = (e) => {
      if (e.target === this.el) this.el.classList.toggle('active');
    };
    this.el.onwheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let sizePx = getComputedStyle(document.documentElement).getPropertyValue('--kanvas-size');
      let size = parseFloat(sizePx.replace('px', ''));
      size = e.deltaY > 0 ? size * 1.05 : size / 1.05;
      size = Math.min(Math.max(Math.round(10 * size) / 10, 10), 32);
      sizePx = `${size}px`;
      this.k.helpers.showMessage(`Toolbar: scale=${sizePx}`);
      document.documentElement.style.setProperty('--kanvas-size', sizePx);
    };
    // group: image,mask,opacity
    this.btnSelectImage = document.getElementById(`${this.k.containerId}-button-image`);
    this.btnSelectMask = document.getElementById(`${this.k.containerId}-button-mask`);
    this.btnSelectImage?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.selectedLayer = 'image';
      this.k.layer = this.k.imageLayer;
      this.k.group = this.k.imageGroup;
      this.btnSelectImage?.classList.add('active');
      this.btnSelectMask?.classList.remove('active');
      this.k.helpers.showMessage('Active: image layer');
      this.k.shapes.refresh();
    });
    this.btnSelectMask?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.selectedLayer = 'mask';
      this.k.layer = this.k.maskLayer;
      this.k.group = this.k.maskGroup;
      this.btnSelectImage?.classList.remove('active');
      this.btnSelectMask?.classList.add('active');
      this.k.helpers.showMessage('Active: mask layer');
      this.k.shapes.refresh();
    });
    document.getElementById(`${this.k.containerId}-image-opacity`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.upload.updateOpacity(parseFloat((e.target as HTMLInputElement).value));
    });

    // group: upload,remove,refresh,reset
    this.btnPaste = document.getElementById(`${this.k.containerId}-button-paste`);
    this.btnUpload = document.getElementById(`${this.k.containerId}-button-upload`);
    this.btnRemove = document.getElementById(`${this.k.containerId}-button-remove`);
    this.btnUndo = document.getElementById(`${this.k.containerId}-button-undo`);
    this.btnRedo = document.getElementById(`${this.k.containerId}-button-redo`);
    this.btnReset = document.getElementById(`${this.k.containerId}-button-reset`);
    this.btnRefresh = document.getElementById(`${this.k.containerId}-button-refresh`);
    this.btnUpload?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'upload';
      this.resetButtons();
      this.k.upload.uploadFile(false);
    });
    this.btnPaste?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const status = await document.execCommand('paste');
      if (!status) this.k.upload.pasteImage();
    });
    this.btnRemove?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.removeNode(this.k.selected);
    });
    this.btnUndo?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.history.undo();
    });
    this.btnRedo?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.history.redo();
    });
    this.btnReset?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.initialize();
      this.btnSelectImage?.click(); // select image layer by default after reset
      this.k.history.capture('Reset stage');
    });
    this.btnRefresh?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.stopActions();
      this.resetButtons();
      this.k.imageMode = 'none';
    });

    // group: size inputs
    const resizeFromInputs = async (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const widthInput = document.getElementById(`${this.k.containerId}-image-width`) as HTMLInputElement;
      const heightInput = document.getElementById(`${this.k.containerId}-image-height`) as HTMLInputElement;
      const width = parseInt((widthInput).value, 10);
      const height = parseInt((heightInput).value, 10);
      this.k.resize.resizeStage(width, height);
    };
    document.getElementById(`${this.k.containerId}-image-width`)?.addEventListener('input', async (e) => resizeFromInputs(e));
    document.getElementById(`${this.k.containerId}-image-height`)?.addEventListener('input', async (e) => resizeFromInputs(e));

    // group: zoomin,zoomout
    document.getElementById(`${this.k.containerId}-button-zoomin`)?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const scale = this.k.stage.scaleX() * 1.1;
      this.k.stage.scale({ x: scale, y: scale });
      this.k.helpers.showMessage(`Scale: ${Math.round(scale * 100)}%`);
    });
    document.getElementById(`${this.k.containerId}-button-zoomout`)?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const scale = this.k.stage.scaleX() / 1.1;
      this.k.stage.scale({ x: scale, y: scale });
      this.k.helpers.showMessage(`Scale: ${Math.round(scale * 100)}%`);
    });
    document.getElementById(`${this.k.containerId}-button-zoomlock`)?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.settings.settings.zoomLock = !this.k.settings.settings.zoomLock;
      document.getElementById(`${this.k.containerId}-button-zoomlock`)?.classList.toggle('active');
      this.k.resize.fitStage();
    });

    // group: settings,info
    document.getElementById(`${this.k.containerId}-button-settings`)?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById(`${this.k.containerId}-button-settings`)?.classList.toggle('active');
      this.k.settings.showSettings();
    });
    document.getElementById(`${this.k.containerId}-button-overlay-collapse`)?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const overlay = this.k.shapes.overlayEl;
      const btn = document.getElementById(`${this.k.containerId}-button-overlay-collapse`);
      const isCollapsed = overlay?.classList.toggle('overlay-collapsed');
      if (btn) btn.textContent = isCollapsed ? '\ueb70' : '\ueb6e';
      if (btn) btn.title = isCollapsed ? 'Expand overlay' : 'Collapse overlay';
    });
    document.getElementById(`${this.k.containerId}-button-info`)?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.settings.showInfo();
    });

    // group: resize,crop
    this.btnResize = document.getElementById(`${this.k.containerId}-button-resize`);
    this.btnCrop = document.getElementById(`${this.k.containerId}-button-crop`);
    this.btnResize?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'resize';
      this.k.helpers.showMessage('Image mode=resize');
      this.k.resize.startResize();
      this.resetButtons();
      this.btnResize?.classList.add('active');
    });
    this.btnCrop?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'crop';
      this.k.helpers.showMessage('Image mode=crop');
      this.k.resize.startClip();
      this.resetButtons();
      this.btnCrop?.classList.add('active');
    });

    // group: paint,text
    this.btnPaint = document.getElementById(`${this.k.containerId}-button-paint`);
    this.btnWand = document.getElementById(`${this.k.containerId}-button-wand`);
    this.btnPaint?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'paint';
      this.k.helpers.showMessage('Image mode=paint');
      this.k.paint.startPaint();
      this.resetButtons();
      this.btnPaint?.classList.add('active');
      document.getElementById(`${this.k.containerId}-paint-controls`)?.classList.add('active');
      this.setToolsTitle('paint');
    });
    this.btnWand?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'wand';
      this.k.helpers.showMessage('Image mode=wand');
      this.k.paint.startWand();
      this.resetButtons();
      this.btnWand?.classList.add('active');
      document.getElementById(`${this.k.containerId}-paint-controls`)?.classList.add('active');
      this.setToolsTitle('magic-wand');
    });
    this.btnText = document.getElementById(`${this.k.containerId}-button-text`);
    this.btnText?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'text';
      this.k.helpers.showMessage('Image mode=text');
      this.k.paint.startText();
      this.resetButtons();
      this.btnText?.classList.add('active');
      document.getElementById(`${this.k.containerId}-paint-controls`)?.classList.add('active');
      document.getElementById(`${this.k.containerId}-text-controls`)?.classList.add('active');
      this.setToolsTitle('text');
    });
    document.getElementById(`${this.k.containerId}-brush-size`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.brushSize = parseInt((e.target as HTMLInputElement).value, 10);
    });
    document.getElementById(`${this.k.containerId}-wand-tolerance`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.wandTolerance = parseInt((e.target as HTMLInputElement).value, 10);
    });
    document.getElementById(`${this.k.containerId}-brush-opacity`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.brushOpacity = parseFloat((e.target as HTMLInputElement).value);
    });
    document.getElementById(`${this.k.containerId}-brush-mode`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.brushMode = (e.target as HTMLSelectElement).value;
    });
    document.getElementById(`${this.k.containerId}-brush-color`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.brushColor = (e.target as HTMLInputElement).value;
    });
    document.getElementById(`${this.k.containerId}-wand-sample-merged`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.wandSampleMerged = (e.target as HTMLInputElement).checked;
    });
    document.getElementById(`${this.k.containerId}-text-font`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.textFont = (e.target as HTMLInputElement).value;
    });
    document.getElementById(`${this.k.containerId}-text-value`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.paint.textValue = (e.target as HTMLInputElement).value;
    });

    // group: outpaint
    this.btnOutpaint = document.getElementById(`${this.k.containerId}-button-outpaint`);
    this.btnOutpaint?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'outpaint';
      if (this.btnOutpaint?.classList.contains('active')) {
        this.btnOutpaint?.classList.remove('active');
        document.getElementById(`${this.k.containerId}-outpaint-controls`)?.classList.remove('active');
        this.setToolsTitle('none');
        this.k.outpaint.doOutpaint();
      } else {
        this.k.stopActions();
        this.resetButtons();
        this.btnOutpaint?.classList.add('active');
        document.getElementById(`${this.k.containerId}-outpaint-controls`)?.classList.add('active');
        this.setToolsTitle('outpaint');
      }
    });
    document.getElementById(`${this.k.containerId}-outpaint-expand`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.outpaint.outpaintExpand = parseFloat((e.target as HTMLInputElement).value);
      if (this.k.outpaint.outpaintExpand < 0 || this.k.outpaint.outpaintExpand > 1) this.k.outpaint.outpaintExpand = 0.1;
    });
    document.getElementById(`${this.k.containerId}-outpaint-blur`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.outpaint.outpaintBlur = parseFloat((e.target as HTMLInputElement).value);
      if (this.k.outpaint.outpaintBlur < 0 || this.k.outpaint.outpaintBlur > 1) this.k.outpaint.outpaintBlur = 0.1;
    });

    // group: filters
    this.btnFilters = document.getElementById(`${this.k.containerId}-button-filters`);
    this.btnFilters?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.imageMode = 'filters';
      this.k.helpers.showMessage('Image mode=filters');
      this.k.stopActions();
      if (this.btnFilters?.classList.contains('active')) this.k.filter.applyFilter();
      this.resetButtons();
      this.btnFilters?.classList.add('active');
      document.getElementById(`${this.k.containerId}-filter-controls`)?.classList.add('active');
      this.setToolsTitle('filters');
    });
    document.getElementById(`${this.k.containerId}-filter-value`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.filter.filterValue = parseInt((e.target as HTMLInputElement).value, 10);
    });
    document.getElementById(`${this.k.containerId}-filter-name`)?.addEventListener('input', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.k.filter.filterName = (e.target as HTMLSelectElement).value;
    });

    this.k.wrapper.addEventListener('keydown', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.k.history.undo();
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.k.history.redo();
      }
    });

    this.updateHistoryButtons(this.k.history.canUndo(), this.k.history.canRedo());
  }
}

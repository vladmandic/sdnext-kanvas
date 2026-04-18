import Konva from 'konva';
import type Kanvas from './Kanvas';

export default class Shapes {
  k: Kanvas;
  overlayEl: HTMLDivElement | null = null;
  resolutionEl: HTMLDivElement | null = null;
  panelEl: HTMLDivElement | null = null;
  toolsEl: HTMLDivElement | null = null;
  toolsTitleEl: HTMLDivElement | null = null;
  titleEl: HTMLDivElement | null = null;
  listEl: HTMLDivElement | null = null;
  boundStage: Konva.Stage | null = null;
  boundImageGroup: Konva.Group | null = null;
  boundMaskGroup: Konva.Group | null = null;
  refreshRaf = 0;
  collapsed = false;

  constructor(k: Kanvas) {
    this.k = k;
  }

  getActiveLayer() {
    return this.k.selectedLayer === 'image' ? this.k.imageLayer : this.k.maskLayer;
  }

  getActiveGroup() {
    return this.k.selectedLayer === 'image' ? this.k.imageGroup : this.k.maskGroup;
  }

  ensureOverlay() {
    if (this.overlayEl && this.panelEl && this.toolsEl && this.toolsTitleEl && this.titleEl && this.listEl) return;
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'kanvas-overlay';

    this.resolutionEl = document.createElement('div');
    this.resolutionEl.className = 'kanvas-resolution';
    this.resolutionEl.innerHTML = `
      <input type="number" id="${this.k.containerId}-image-width" class="kanvas-sizebox" min="256" max="8192" value="1024" title="Stage width" />
      <label for="${this.k.containerId}-image-height"></label>
      <input type="number" id="${this.k.containerId}-image-height" class="kanvas-sizebox" min="256" max="8192" value="1024" title="Stage height" />
      <span class="kanvas-button" title="Change stage width and height" id="${this.k.containerId}-button-size">\udb82\ude68</span>
      <span class="kanvas-button" title="Settings" id="${this.k.containerId}-button-settings"></span>
      <span class="kanvas-button" title="Collapse overlay" id="${this.k.containerId}-button-overlay-collapse">\ueb6e</span>
      <label for="${this.k.containerId}-image-width"></label>
    `;
    this.overlayEl.appendChild(this.resolutionEl);

    // Make overlay draggable via the resolution bar
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let overlayStartLeft = 0;
    let overlayStartTop = 0;

    const resetOverlayPosition = () => {
      this.overlayEl!.style.left = '';
      this.overlayEl!.style.right = '0';
      this.overlayEl!.style.top = 'calc(2.2 * var(--kanvas-size))';
    };

    this.resolutionEl.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SPAN') return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = this.overlayEl!.getBoundingClientRect();
      const parentRect = this.k.wrapper.getBoundingClientRect();
      overlayStartLeft = rect.left - parentRect.left;
      overlayStartTop = rect.top - parentRect.top;
      this.overlayEl!.style.right = 'unset';
      this.overlayEl!.style.left = `${overlayStartLeft}px`;
      this.overlayEl!.style.top = `${overlayStartTop}px`;
      this.resolutionEl!.style.cursor = 'grabbing';
      e.preventDefault();
    });

    this.resolutionEl.addEventListener('dblclick', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SPAN') return;
      resetOverlayPosition();
      e.preventDefault();
    });

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      this.overlayEl!.style.left = `${overlayStartLeft + dx}px`;
      this.overlayEl!.style.top = `${overlayStartTop + dy}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      this.resolutionEl!.style.cursor = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    this.panelEl = document.createElement('div');
    this.panelEl.className = 'kanvas-shapes';
    this.overlayEl.appendChild(this.panelEl);

    this.toolsEl = document.createElement('div');
    this.toolsEl.className = 'kanvas-tools';
    this.toolsTitleEl = document.createElement('div');
    this.toolsTitleEl.className = 'kanvas-tools-title';
    this.toolsTitleEl.textContent = 'Tool: none';
    this.toolsEl.appendChild(this.toolsTitleEl);
    this.overlayEl.appendChild(this.toolsEl);

    this.titleEl = document.createElement('div');
    this.titleEl.className = 'kanvas-shapes-titles';
    this.titleEl.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.collapsed = !this.collapsed;
      this.overlayEl?.classList.toggle('collapsed', this.collapsed);
    });
    this.panelEl.appendChild(this.titleEl);

    this.listEl = document.createElement('div');
    this.listEl.className = 'kanvas-shapes-list';
    this.panelEl.appendChild(this.listEl);

    this.k.wrapper.appendChild(this.overlayEl);
  }

  getToolsContainer() {
    this.ensureOverlay();
    return this.toolsEl;
  }

  getOverlayContainer() {
    this.ensureOverlay();
    return this.overlayEl;
  }

  getToolsTitleElement() {
    this.ensureOverlay();
    return this.toolsTitleEl;
  }

  disconnectListeners() {
    if (this.boundStage) this.boundStage.off('.shapes');
    if (this.boundImageGroup) this.boundImageGroup.off('.shapes');
    if (this.boundMaskGroup) this.boundMaskGroup.off('.shapes');
    if (this.refreshRaf) {
      window.cancelAnimationFrame(this.refreshRaf);
      this.refreshRaf = 0;
    }
    this.boundStage = null;
    this.boundImageGroup = null;
    this.boundMaskGroup = null;
  }

  scheduleRefresh() {
    if (this.refreshRaf) return;
    this.refreshRaf = window.requestAnimationFrame(() => {
      this.refreshRaf = 0;
      this.refresh();
    });
  }

  bindListeners() {
    this.disconnectListeners();
    this.boundStage = this.k.stage;
    this.boundImageGroup = this.k.imageGroup;
    this.boundMaskGroup = this.k.maskGroup;

    const refresh = () => this.refresh();
    const schedule = () => this.scheduleRefresh();
    this.boundStage.on('click.shapes tap.shapes', refresh);
    this.boundStage.on('dragmove.shapes transform.shapes transformend.shapes dragend.shapes mouseup.shapes touchend.shapes', schedule);
    this.boundImageGroup.on('add.shapes remove.shapes destroy.shapes', refresh);
    this.boundMaskGroup.on('add.shapes remove.shapes destroy.shapes', refresh);
    this.boundImageGroup.on('xChange.shapes yChange.shapes widthChange.shapes heightChange.shapes scaleXChange.shapes scaleYChange.shapes pointsChange.shapes', schedule);
    this.boundMaskGroup.on('xChange.shapes yChange.shapes widthChange.shapes heightChange.shapes scaleXChange.shapes scaleYChange.shapes pointsChange.shapes', schedule);
  }

  getLayerNodes() {
    const group = this.getActiveGroup();
    const nodes = group.getChildren((node) => node instanceof Konva.Shape);
    return nodes as Konva.Shape[];
  }

  static getNodeLabel(node: Konva.Shape) {
    const nodeType = node.getClassName();
    const nodeName = node.name();
    const width = Math.round(node.width() * node.scaleX());
    const height = Math.round(node.height() * node.scaleY());
    const labelName = nodeName ? ` ${nodeName}` : '';
    return `${nodeType}${labelName} ${width}x${height}`;
  }

  renderList() {
    if (!this.overlayEl || !this.titleEl || !this.listEl) return;
    this.k.stages.mountOverlay(this.overlayEl);
    this.k.stages.renderOverlay();
    const layer = this.getActiveLayer();
    const nodes = this.getLayerNodes();
    this.titleEl.textContent = `Layer ${this.k.selectedLayer}: ${nodes.length} shapes`;
    this.overlayEl.classList.toggle('active', nodes.length > 0);
    this.overlayEl.classList.toggle('collapsed', this.collapsed);
    this.listEl.textContent = '';

    if (nodes.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'kanvas-shapes-empty';
      emptyEl.textContent = 'No shapes in active layer';
      this.listEl.appendChild(emptyEl);
      return;
    }

    nodes.forEach((node) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'kanvas-shapes-item';
      item.textContent = Shapes.getNodeLabel(node);
      if (this.k.selected === node) item.classList.add('active');
      item.addEventListener('click', async (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const isValid = node.parent === this.getActiveGroup() || node.parent === layer;
        if (!isValid) return;
        this.k.imageMode = 'none';
        await this.k.stopActions();
        await this.k.toolbar.resetButtons();
        await this.k.selectNode(node);
        this.refresh();
      });
      this.listEl?.appendChild(item);
    });
  }

  refresh() {
    this.k.stages.syncActiveLayerRefs();
    this.k.layer = this.getActiveLayer();
    this.k.group = this.getActiveGroup();
    this.renderList();
  }

  drawShapes() {
    this.ensureOverlay();
    this.bindListeners();
    this.refresh();
  }
}

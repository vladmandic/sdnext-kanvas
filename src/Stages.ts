import Konva from 'konva';
import type Kanvas from './Kanvas';

export interface KanvasStage {
  id: string;
  label: string;
  imageGroup: Konva.Group;
  maskGroup: Konva.Group;
  width: number;
  height: number;
}

export default class Stages {
  k: Kanvas;
  list: KanvasStage[] = [];
  activeStageId = '';
  stageCounter = 1;
  readonly maxStages = 10;
  panelEl: HTMLDivElement | null = null;
  titleEl: HTMLDivElement | null = null;
  titleLabelEl: HTMLSpanElement | null = null;
  listEl: HTMLDivElement | null = null;
  btnAdd: HTMLSpanElement | null = null;
  boundImageGroup: Konva.Group | null = null;
  boundMaskGroup: Konva.Group | null = null;
  refreshRaf = 0;
  collapsed = false;

  constructor(k: Kanvas) {
    this.k = k;
  }

  initializeLayers(width: number, height: number) {
    this.k.imageLayer = new Konva.Layer();
    this.k.maskLayer = new Konva.Layer();
    this.k.maskLayer.opacity(0.5);
    this.k.imageLayer.size({ width, height });
    this.k.maskLayer.size({ width, height });
    this.k.stage.add(this.k.imageLayer);
    this.k.stage.add(this.k.maskLayer);
  }

  reset() {
    this.list = [];
    this.activeStageId = '';
    this.stageCounter = 1;
    this.collapsed = false;
    if (this.panelEl) this.panelEl.remove();
    this.panelEl = null;
    this.titleEl = null;
    this.titleLabelEl = null;
    this.listEl = null;
    this.btnAdd = null;
    this.disconnectThumbnailListeners();
    if (this.refreshRaf) {
      window.cancelAnimationFrame(this.refreshRaf);
      this.refreshRaf = 0;
    }
  }

  disconnectThumbnailListeners() {
    if (this.boundImageGroup) this.boundImageGroup.off('.stages-thumb');
    if (this.boundMaskGroup) this.boundMaskGroup.off('.stages-thumb');
    this.boundImageGroup = null;
    this.boundMaskGroup = null;
  }

  scheduleOverlayRender() {
    if (this.refreshRaf) return;
    this.refreshRaf = window.requestAnimationFrame(() => {
      this.refreshRaf = 0;
      this.renderOverlay();
    });
  }

  bindThumbnailListeners() {
    this.disconnectThumbnailListeners();
    this.boundImageGroup = this.k.imageGroup;
    this.boundMaskGroup = this.k.maskGroup;
    const schedule = () => this.scheduleOverlayRender();
    const refresh = () => this.renderOverlay();

    this.boundImageGroup.on('add.stages-thumb remove.stages-thumb destroy.stages-thumb', refresh);
    this.boundMaskGroup.on('add.stages-thumb remove.stages-thumb destroy.stages-thumb', refresh);
    this.boundImageGroup.on(
      'xChange.stages-thumb yChange.stages-thumb widthChange.stages-thumb heightChange.stages-thumb scaleXChange.stages-thumb scaleYChange.stages-thumb pointsChange.stages-thumb dragend.stages-thumb transformend.stages-thumb',
      schedule,
    );
    this.boundMaskGroup.on(
      'xChange.stages-thumb yChange.stages-thumb widthChange.stages-thumb heightChange.stages-thumb scaleXChange.stages-thumb scaleYChange.stages-thumb pointsChange.stages-thumb dragend.stages-thumb transformend.stages-thumb',
      schedule,
    );
  }

  mountOverlay(parentEl: HTMLElement) {
    if (this.panelEl && this.panelEl.parentElement === parentEl) return;
    if (this.panelEl) this.panelEl.remove();

    this.panelEl = document.createElement('div');
    this.panelEl.className = 'kanvas-stages';

    this.titleEl = document.createElement('div');
    this.titleEl.className = 'kanvas-stages-titles';
    this.titleEl.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.collapsed = !this.collapsed;
      this.panelEl?.classList.toggle('collapsed', this.collapsed);
    });
    this.panelEl.appendChild(this.titleEl);

    this.titleLabelEl = document.createElement('span');
    this.titleLabelEl.textContent = 'Stages: 1';
    this.titleEl.appendChild(this.titleLabelEl);

    this.btnAdd = document.createElement('span');
    this.btnAdd.className = 'kanvas-button kanvas-stage-control';
    this.btnAdd.title = 'Add stage';
    this.btnAdd.textContent = '\uf0fe';
    this.btnAdd.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.createStage();
    });
    this.titleEl.appendChild(this.btnAdd);

    this.listEl = document.createElement('div');
    this.listEl.className = 'kanvas-stages-list';
    this.panelEl.appendChild(this.listEl);
    this.panelEl.classList.toggle('collapsed', this.collapsed);

    const shapesPanel = parentEl.querySelector('.kanvas-shapes');
    if (shapesPanel) parentEl.insertBefore(this.panelEl, shapesPanel);
    else parentEl.appendChild(this.panelEl);
    this.renderOverlay();
  }

  renderOverlay() {
    if (!this.titleLabelEl || !this.listEl || !this.btnAdd) return;
    const stages = this.getStageList();
    const activeIndex = this.list.findIndex((stage) => stage.id === this.activeStageId);
    this.titleLabelEl.textContent = `Stages: ${activeIndex >= 0 ? activeIndex + 1 : 1}`;
    this.btnAdd.classList.toggle('disabled', !this.canCreateStage());
    this.listEl.textContent = '';

    stages.forEach((stage) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'kanvas-stage-item';
      if (stage.active) item.classList.add('active');

      const thumb = document.createElement('span');
      thumb.className = 'kanvas-stage-thumb';
      if (stage.thumbnail) {
        const img = document.createElement('img');
        img.src = stage.thumbnail;
        img.alt = stage.label;
        thumb.appendChild(img);
      } else {
        thumb.textContent = 'Empty';
      }
      item.appendChild(thumb);

      const meta = document.createElement('span');
      meta.className = 'kanvas-stage-meta';

      const header = document.createElement('span');
      header.className = 'kanvas-stage-header';

      const label = document.createElement('span');
      label.className = 'kanvas-stage-label';
      label.textContent = stage.label;
      header.appendChild(label);

      if (stage.removable) {
        const remove = document.createElement('span');
        remove.className = 'kanvas-button kanvas-stage-remove';
        remove.title = `Delete ${stage.label}`;
        remove.textContent = '\uf2d3';
        remove.addEventListener('click', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          this.deleteStage(stage.id);
        });
        header.appendChild(remove);
      }

      meta.appendChild(header);

      const resolution = document.createElement('span');
      resolution.className = 'kanvas-stage-resolution';
      resolution.textContent = `${Math.round(stage.width)}x${Math.round(stage.height)}`;
      meta.appendChild(resolution);

      thumb.appendChild(meta);

      item.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (!stage.active) this.switchStage(stage.id);
        if (!stage.thumbnail) this.k.upload.uploadFile(false);
      });
      this.listEl?.appendChild(item);
    });
  }

  static createStageNodes() {
    const imageGroup = new Konva.Group();
    const maskGroup = new Konva.Group();
    return { imageGroup, maskGroup };
  }

  getActiveStage() {
    return this.list.find((stage) => stage.id === this.activeStageId) || null;
  }

  getStageList() {
    return this.list.map((stage) => ({
      id: stage.id,
      label: stage.label,
      active: stage.id === this.activeStageId,
      removable: true,
      width: stage.width,
      height: stage.height,
      thumbnail: this.getStageThumbnail(stage.id),
    }));
  }

  getStageThumbnail(stageId: string) {
    const stage = this.list.find((item) => item.id === stageId);
    if (!stage || !stage.imageGroup.hasChildren()) return null;
    const width = Math.max(1, Math.round(stage.width));
    const height = Math.max(1, Math.round(stage.height));
    const wasVisible = stage.imageGroup.visible();
    // Inactive stages are hidden in the main view; force visibility for offscreen thumbnail capture.
    if (!wasVisible) stage.imageGroup.visible(true);
    const canvas = stage.imageGroup.toCanvas({
      x: 0,
      y: 0,
      width,
      height,
      imageSmoothingEnabled: false,
    });
    if (!wasVisible) stage.imageGroup.visible(false);
    return canvas.toDataURL('image/png');
  }

  syncActiveLayerRefs() {
    const active = this.getActiveStage();
    if (!active) return;
    this.k.imageGroup = active.imageGroup;
    this.k.maskGroup = active.maskGroup;
    this.k.layer = this.k.selectedLayer === 'image' ? this.k.imageLayer : this.k.maskLayer;
    this.k.group = this.k.selectedLayer === 'image' ? this.k.imageGroup : this.k.maskGroup;
  }

  setStageLabelFromFileName(fileName: string) {
    const active = this.getActiveStage();
    if (!active) return;
    const normalized = fileName.split('/').pop()?.split('\\').pop() || '';
    const baseName = normalized.replace(/\.[^/.]+$/, '').trim();
    if (!baseName) return;
    active.label = baseName;
    this.renderOverlay();
    this.k.shapes?.refresh();
  }

  createStage(label?: string) {
    if (this.list.length >= this.maxStages) {
      this.k.helpers?.showMessage?.(`Maximum stages reached: ${this.maxStages}`);
      return null;
    }
    const id = `stage-${this.stageCounter}`;
    const stageNum = this.list.length + 1;
    const { imageGroup, maskGroup } = Stages.createStageNodes();
    this.k.imageLayer.add(imageGroup);
    this.k.maskLayer.add(maskGroup);
    const stageData: KanvasStage = {
      id,
      label: label?.trim() || `Stage ${stageNum}`,
      imageGroup,
      maskGroup,
      width: this.k.stage.width(),
      height: this.k.stage.height(),
    };
    imageGroup.visible(false);
    maskGroup.visible(false);
    this.list.push(stageData);
    this.stageCounter += 1;
    this.switchStage(id);
    this.renderOverlay();
    this.k.helpers?.showMessage?.(`Created stage: ${stageData.label}`);
    this.k.history.capture('Create stage');
    return id;
  }

  switchStage(id: string) {
    const next = this.list.find((stage) => stage.id === id);
    if (!next) return false;
    this.activeStageId = id;
    this.list.forEach((stage) => {
      const visible = stage.id === id;
      stage.imageGroup.visible(visible);
      stage.maskGroup.visible(visible);
    });
    this.syncActiveLayerRefs();
    this.bindThumbnailListeners();
    const nextWidth = Math.max(1, Math.round(next.width));
    const nextHeight = Math.max(1, Math.round(next.height));
    this.k.imageLayer.size({ width: nextWidth, height: nextHeight });
    this.k.maskLayer.size({ width: nextWidth, height: nextHeight });
    this.k.stage.size({ width: nextWidth, height: nextHeight });
    if (this.k.toolbar) this.k.toolbar.el.style.maxWidth = `${nextWidth}px`;
    this.k.resize?.updateSizeInputs?.();
    this.k.resize?.fitStage?.();
    this.k.layer.find('Transformer').forEach((t) => t.destroy());
    this.k.selected = null as unknown as Konva.Node;
    this.k.stage.batchDraw();
    this.k.shapes?.drawShapes();
    this.renderOverlay();
    this.k.helpers?.showMessage?.(`Active stage: ${next.label}`);
    return true;
  }

  deleteStage(id: string) {
    const index = this.list.findIndex((stage) => stage.id === id);
    if (index === -1) return false;
    const [removed] = this.list.splice(index, 1);
    removed.imageGroup.destroy();
    removed.maskGroup.destroy();
    this.k.helpers?.showMessage?.(`Deleted stage: ${removed.label}`);
    if (this.list.length === 0) {
      // last stage removed — reinitialize
      this.k.initialize(removed.width, removed.height);
      return true;
    }
    if (this.activeStageId === id) {
      // switch to the stage now at the same index (or last)
      const nextIndex = Math.min(index, this.list.length - 1);
      this.activeStageId = this.list[nextIndex].id;
      this.switchStage(this.activeStageId);
    } else {
      this.k.stage.batchDraw();
      this.renderOverlay();
      this.k.shapes?.refresh();
    }
    this.k.history.capture('Delete stage');
    return true;
  }

  getStageCount() {
    return this.list.length;
  }

  canCreateStage() {
    return this.list.length < this.maxStages;
  }

  canDeleteActiveStage() {
    return this.list.length >= 1;
  }

  resizeActiveStageLayers(width: number, height: number) {
    const active = this.getActiveStage();
    if (!active) return;
    active.width = width;
    active.height = height;
    this.k.imageLayer.size({ width, height });
    this.k.maskLayer.size({ width, height });
  }
}

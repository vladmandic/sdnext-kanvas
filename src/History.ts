import Konva from 'konva';
import type Kanvas from './Kanvas';
import type { KanvasStage } from './Stages';

interface StageSnapshot {
  id: string;
  label: string;
  width: number;
  height: number;
  imageJSON: string;
  imageSources: string[];
  maskJSON: string;
  maskSources: string[];
}

interface WorkspaceSnapshot {
  stageCounter: number;
  activeStageId: string;
  selectedLayer: 'image' | 'mask';
  stages: StageSnapshot[];
}

export default class History {
  k: Kanvas;
  past: WorkspaceSnapshot[] = [];
  future: WorkspaceSnapshot[] = [];
  current: WorkspaceSnapshot | null = null;
  replaying = false;
  maxEntries = 100;

  constructor(k: Kanvas) {
    this.k = k;
  }

  init() {
    this.current = this.snapshotWorkspace();
    this.updateToolbar();
  }

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }

  updateToolbar() {
    this.k.toolbar?.updateHistoryButtons?.(this.canUndo(), this.canRedo());
  }

  snapshotWorkspace(): WorkspaceSnapshot {
    const stages = this.k.stages.list.map((stage) => ({
      id: stage.id,
      label: stage.label,
      width: stage.width,
      height: stage.height,
      imageJSON: stage.imageGroup.toJSON(),
      imageSources: this.serializeImageSources(stage.imageGroup),
      maskJSON: stage.maskGroup.toJSON(),
      maskSources: this.serializeImageSources(stage.maskGroup),
    }));
    return {
      stageCounter: this.k.stages.stageCounter,
      activeStageId: this.k.stages.activeStageId,
      selectedLayer: this.k.selectedLayer,
      stages,
    };
  }

  capture(_label = 'Edit') {
    if (this.replaying) return;
    const next = this.snapshotWorkspace();
    if (!this.current) {
      this.current = next;
      this.updateToolbar();
      return;
    }
    this.past.push(this.current);
    if (this.past.length > this.maxEntries) this.past.shift();
    this.current = next;
    this.future = [];
    this.updateToolbar();
  }

  undo() {
    if (!this.canUndo() || !this.current) return;
    const previous = this.past.pop() as WorkspaceSnapshot;
    this.future.push(this.current);
    this.current = previous;
    this.restoreWorkspace(previous);
    this.k.helpers.showMessage('Undo');
    this.updateToolbar();
  }

  redo() {
    if (!this.canRedo() || !this.current) return;
    const next = this.future.pop() as WorkspaceSnapshot;
    this.past.push(this.current);
    this.current = next;
    this.restoreWorkspace(next);
    this.k.helpers.showMessage('Redo');
    this.updateToolbar();
  }

  static createGroupFromJSON(json: string) {
    const node = Konva.Node.create(json);
    if (node instanceof Konva.Group) return node;
    const group = new Konva.Group();
    if (node instanceof Konva.Shape) group.add(node);
    return group;
  }

  serializeImageSources(group: Konva.Group) {
    const images = group.find('Image') as Konva.Image[];
    return images.map((image) => {
      try {
        const canvas = image.toCanvas({ imageSmoothingEnabled: false });
        return canvas.toDataURL('image/png');
      } catch {
        return '';
      }
    });
  }

  restoreImageSources(group: Konva.Group, sources: string[]) {
    if (!sources || sources.length === 0) return;
    const images = group.find('Image') as Konva.Image[];
    images.forEach((node, index) => {
      const src = sources[index];
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        node.image(img);
        if (node.filters() && node.filters()!.length > 0) node.cache();
        this.k.stage.batchDraw();
        this.k.stages.renderOverlay();
      };
      img.src = src;
    });
  }

  restoreWorkspace(snapshot: WorkspaceSnapshot) {
    this.replaying = true;
    try {
      this.k.stopActions();
      this.k.stages.disconnectThumbnailListeners();
      this.k.stages.list.forEach((stage) => {
        stage.imageGroup.destroy();
        stage.maskGroup.destroy();
      });
      this.k.stages.list = [];

      const restored: KanvasStage[] = snapshot.stages.map((stageSnap) => {
        const imageGroup = History.createGroupFromJSON(stageSnap.imageJSON);
        const maskGroup = History.createGroupFromJSON(stageSnap.maskJSON);
        imageGroup.visible(false);
        maskGroup.visible(false);
        this.k.imageLayer.add(imageGroup);
        this.k.maskLayer.add(maskGroup);
        this.restoreImageSources(imageGroup, stageSnap.imageSources || []);
        this.restoreImageSources(maskGroup, stageSnap.maskSources || []);
        return {
          id: stageSnap.id,
          label: stageSnap.label,
          imageGroup,
          maskGroup,
          width: stageSnap.width,
          height: stageSnap.height,
        };
      });

      this.k.stages.list = restored;
      this.k.stages.stageCounter = snapshot.stageCounter;
      const targetStageId = restored.find((s) => s.id === snapshot.activeStageId)?.id || restored[0]?.id || '';
      if (targetStageId) this.k.stages.switchStage(targetStageId);

      this.k.selectedLayer = snapshot.selectedLayer;
      if (this.k.selectedLayer === 'mask') this.k.toolbar.btnSelectMask?.click();
      else this.k.toolbar.btnSelectImage?.click();

      this.k.layer.find('Transformer').forEach((t) => t.destroy());
      this.k.selected = null as unknown as Konva.Node;
      this.k.stage.batchDraw();
      this.k.shapes.refresh();
      this.k.stages.renderOverlay();
      this.k.notifyImage();
    } finally {
      this.replaying = false;
    }
  }
}

import Konva from 'konva';
import type Kanvas from './Kanvas';
import { fillTransparent } from './Fill';

export default class Outpaint {
  k: Kanvas;
  outpaintBlur = 0.1;
  outpaintExpand = 0.1;
  outpaintActive = false;

  constructor(k: Kanvas) {
    this.k = k;
  }

  fillOutpaint() {
    this.k.imageLayer.cache();
    const canvas = this.k.imageLayer.toCanvas({ imageSmoothingEnabled: false });
    const filled = fillTransparent(canvas, 0);
    const konvaImg = new Konva.Image({ x: 0, y: 0, image: filled });
    konvaImg.name('fill-outpaint');
    konvaImg.cache({ imageSmoothingEnabled: false });
    this.k.imageGroup.add(konvaImg);
    this.k.imageGroup.cache();
    this.k.imageLayer.cache();
    this.k.imageLayer.batchDraw();
  }

  removeOutpaint() {
    const toRemove: Konva.Node[] = [];
    this.k.maskGroup.children.forEach((child) => {
      if (child.name().endsWith('-outpaint')) toRemove.push(child);
    });
    this.k.imageGroup.children.forEach((child) => {
      if (child.name().endsWith('-outpaint')) toRemove.push(child);
    });
    toRemove.forEach((node) => node.destroy());
    this.k.maskGroup.filters([]);
    this.k.maskGroup.blurRadius(0);
    this.k.maskGroup.clearCache();
    this.k.imageGroup.clearCache();
    this.k.imageLayer.clearCache();
    this.k.maskLayer.clearCache();
    this.k.imageLayer.batchDraw();
    this.k.maskLayer.batchDraw();
    this.k.stage.batchDraw();
    this.outpaintActive = false;
  }

  doOutpaint(action = true) {
    if (!action) {
      this.removeOutpaint();
      return;
    }
    this.k.imageMode = 'outpaint';
    this.k.helpers.showMessage(`Outpaint blur:${this.outpaintBlur} expand:${this.outpaintExpand}`);
    this.removeOutpaint();
    if (this.k.settings.settings.outpaintFill) this.fillOutpaint();
    const fillRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.k.stage.width(),
      height: this.k.stage.height(),
      fill: 'white',
      // opacity: 0.6,
    });
    fillRect.name('mask-outpaint');
    this.k.maskGroup.add(fillRect);
    const images = this.k.imageGroup.getChildren((node) => node instanceof Konva.Image);
    for (const image of images) {
      if (image.name() === 'fill') continue;
      image.cache();
      const expandX = Math.round(this.outpaintExpand * image.width());
      const expandY = Math.round(this.outpaintExpand * image.height());
      const imageRect = new Konva.Rect({
        x: Math.floor(image.x() + (expandX / 2)),
        y: Math.floor(image.y() + (expandY / 2)),
        width: Math.round((image.width() * image.scaleX()) - expandX),
        height: Math.round((image.height() * image.scaleY()) - expandY),
        fill: 'black',
        globalCompositeOperation: 'destination-out', // punch hole
      });
      imageRect.name('image-outpaint');
      this.k.maskGroup.add(imageRect);
    }
    this.k.maskGroup.cache();
    if (this.outpaintBlur > 0) {
      this.k.maskGroup.filters([Konva.Filters.Blur]);
      this.k.maskGroup.blurRadius(this.outpaintBlur * 100);
    }
    this.k.imageLayer.batchDraw();
    this.k.maskLayer.batchDraw();
    this.k.stage.batchDraw();
    this.outpaintActive = true;
    this.k.history.capture('Outpaint apply');
  }
}

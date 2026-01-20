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
    konvaImg.name('fill');
    konvaImg.cache({ imageSmoothingEnabled: false });
    this.k.imageGroup.add(konvaImg);
    this.k.imageGroup.cache();
    this.k.imageLayer.cache();
    this.k.imageLayer.batchDraw();
  }

  remove() {
    this.k.maskGroup.children.forEach(async (child) => {
      if (child.name() === 'mask-outpaint' || child.name() === 'fill') await child.destroy();
    });
    this.k.imageGroup.children.forEach(async (child) => {
      if (child.name() === 'mask-outpaint' || child.name() === 'fill') await child.destroy();
    });
    this.k.imageGroup.cache();
    this.k.layer.batchDraw();
  }

  doOutpaint() {
    this.k.imageMode = 'outpaint';
    this.k.helpers.showMessage(`Image mode=outpaint blur=${this.outpaintBlur} expand=${this.outpaintExpand}`);
    this.remove();
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
    const images = this.k.stage.find('Image');
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
      this.k.maskGroup.add(imageRect);
    }
    this.k.maskGroup.cache();
    if (this.outpaintBlur > 0) {
      this.k.maskGroup.filters([Konva.Filters.Blur]);
      this.k.maskGroup.blurRadius(this.outpaintBlur * 100);
    }
    this.k.layer.batchDraw();
    this.outpaintActive = true;
  }
}

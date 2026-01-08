import Konva from 'konva';
import type Kanvas from './Kanvas';

export default class Filter {
  k: Kanvas;
  filterValue = 10;
  filterName = 'blur';

  constructor(k: Kanvas) {
    this.k = k;
  }

  applyFilter() {
    if (this.k.selected && this.k.selected instanceof Konva.Image) {
      const image = this.k.selected;
      image.cache();
      this.k.helpers.showMessage(`Apply filter: ${this.filterName} value=${this.filterValue}`);
      if (this.filterName === 'blur') {
        image.filters([Konva.Filters.Blur]);
        image.blurRadius(this.filterValue / 4);
      }
      if (this.filterName === 'brightness') {
        image.filters([Konva.Filters.Brighten]);
        image.brightness((this.filterValue - 50) / 100);
      }
      if (this.filterName === 'contrast') {
        image.filters([Konva.Filters.Contrast]);
        image.contrast(this.filterValue - 50);
      }
      if (this.filterName === 'mask') {
        image.filters([Konva.Filters.Mask]);
        image.threshold(255 * (this.filterValue / 100));
      }
      if (this.filterName === 'enhance') {
        image.filters([Konva.Filters.Enhance]);
        image.enhance(this.filterValue / 100);
      }
      if (this.filterName === 'grayscale') {
        image.filters([Konva.Filters.Grayscale]);
      }
      if (this.filterName === 'invert') {
        image.filters([Konva.Filters.Invert]);
      }
      if (this.filterName === 'noise') {
        image.filters([Konva.Filters.Noise]);
        image.noise(this.filterValue / 50);
      }
      if (this.filterName === 'pixelate') {
        image.filters([Konva.Filters.Pixelate]);
        image.pixelSize(this.filterValue / 4);
      }
      if (this.filterName === 'threshold') {
        image.filters([Konva.Filters.Threshold]);
        image.threshold(this.filterValue / 100);
      }
      image.draw();
    }
  }
}

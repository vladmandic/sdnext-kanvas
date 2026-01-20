import type Kanvas from './Kanvas';

export default class Pan {
  k: Kanvas;
  moving = false;
  constructor(k: Kanvas) {
    this.k = k;
  }

  onMouseMove(evt: MouseEvent) {
    if (!this.moving) return;
    this.k.wrapper.scrollTo(
      this.k.wrapper.scrollLeft - evt.movementX,
      this.k.wrapper.scrollTop - evt.movementY,
    );
  }

  bindPan() {
    this.moving = false;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Control') {
        this.k.container.style.cursor = 'default';
        this.k.container.style.cursor = 'grab';
        this.moving = true;
        this.k.container.onmousemove = this.onMouseMove.bind(this);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        this.k.container.style.cursor = 'default';
        this.moving = false;
        this.k.container.onmousemove = null;
      }
    });
  }
}

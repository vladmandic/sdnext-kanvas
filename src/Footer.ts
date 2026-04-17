import type Kanvas from './Kanvas';

export default class Footer {
  k: Kanvas;
  el: HTMLElement;

  constructor(k: Kanvas) {
    this.k = k;
    this.el = document.getElementById(`${this.k.containerId}-footer`) as HTMLElement;
    this.el.classList.add('kanvas-toolbar', 'kanvas-footer');
    this.el.classList.add('active');
    this.el.innerHTML = `
      <span class="kanvas-text" id="${this.k.containerId}-message"></span>
    `;
  }
}

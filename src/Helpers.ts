import type Kanvas from './Kanvas';

let debounceMessage: ReturnType<typeof setTimeout> | undefined;

export default class Helpers {
  k: Kanvas;
  constructor(k: Kanvas) {
    this.k = k;
  }

  isEmpty() {
    const activeStage = this.k.stages.getActiveStage();
    if (!activeStage) return true;
    const images = activeStage.imageGroup.find('Image').length + activeStage.maskGroup.find('Image').length;
    return images === 0;
  }

  async kanvasLog(message: string) { // eslint-disable-line class-methods-use-this
    // @ts-ignore
    if (typeof log !== 'undefined') log('Kanvas:', message);
    else console.log('Kanvas:', message);
  }

  async showMessage(msg: string, duration = this.k.settings.settings.debounceMessage) {
    this.kanvasLog(msg);
    const footerEl = document.getElementById(`${this.k.containerId}-footer`);
    const msgEl = document.getElementById(`${this.k.containerId}-message`);
    if (!footerEl || !msgEl || !this.k.settings.settings.messageShow) return;
    if (debounceMessage) msgEl.innerHTML += '<span class="kanvas-separator"> | </span>' + msg;
    else msgEl.innerHTML = msg;
    // msgEl.innerHTML = msg;
    msgEl.classList.add('active');
    footerEl.classList.add('active');
    if (debounceMessage) clearTimeout(debounceMessage);
    debounceMessage = setTimeout(() => {
      msgEl.classList.remove('active');
      footerEl.classList.remove('active');
      msgEl.innerHTML = '';
      debounceMessage = undefined;
    }, duration);
  }

  async bindStage() {
    this.k.stage.on('contextmenu', (e) => {
      e.evt.preventDefault();
      e.evt.stopPropagation();
      this.k.settings.showSettings();
    });
    this.k.stage.on('click tap', (e) => {
      if (e.evt.button === 2) return; // right click
      this.k.upload.uploadFile();
    });
    this.k.stage.on('dblclick dbltap', () => this.k.resize.resizeStageToFit(this.k.group));
    this.k.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const scale = e.evt.deltaY > 0 ? this.k.stage.scaleX() / 1.05 : this.k.stage.scaleX() * 1.05;
      this.k.stage.scale({ x: scale, y: scale });
      this.k.stage.batchDraw();
      this.showMessage(`Scale: ${Math.round(scale * 100)}%`);
    });
  }

  async bindEvents() {
    this.k.container.addEventListener('dragover', (e) => e.preventDefault());
    this.k.container.addEventListener('dragleave', (e) => e.preventDefault());
    this.k.container.addEventListener('drop', async (e) => this.k.upload.uploadImage(e));
  }
}

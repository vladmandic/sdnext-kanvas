import type Kanvas from './Kanvas';

const html = `
  <div class="kanvas-settings-title">Settings<button id="kanvas-settings-reset" class="kanvas-settings-reset" title="Reset to defaults">Reset</button></div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-size">Toolbar size</label>
    <input type="number" id="kanvas-settings-size" name="kanvas-settings-size" min="8" max="48" value="18" />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-color">Toolbar hue</label>
    <input type="number" id="kanvas-settings-color" name="kanvas-settings-color" min="0" max="360" value="190" />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-overlay-width">Overlay width</label>
    <input type="number" id="kanvas-settings-overlay-width" name="kanvas-settings-overlay-width" min="140" max="400" value="240" />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-allow-hide">Allow toolbar hide</label>
    <input type="checkbox" id="kanvas-settings-allow-hide" name="kanvas-settings-allow-hide" checked />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-zoom-lock">Zoom lock</label>
    <input type="checkbox" id="kanvas-settings-zoom-lock" name="kanvas-settings-zoom-lock" />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-max-size">Max canvas size</label>
    <input type="number" id="kanvas-settings-max-size" name="kanvas-settings-max-size" min="256" max="8192" value="2048" />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-brush-size">Brush size</label>
    <input type="number" id="kanvas-settings-brush-size" name="kanvas-settings-brush-size" min="1" max="100" value="20" />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-outpaint-fill">Outpaint fill</label>
    <input type="checkbox" id="kanvas-settings-outpaint-fill" name="kanvas-settings-outpaint-fill" />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-message-show">Show messages</label>
    <input type="checkbox" id="kanvas-settings-message-show" name="kanvas-settings-message-show" checked />
  </div>
  <div class="kanvas-settings-row">
    <label for="kanvas-settings-message-timeout">Message timeout</label>
    <input type="number" id="kanvas-settings-message-timeout" name="kanvas-settings-message-timeout" min="1000" max="20000" value="5000" />
  </div>
`;

export default class Settings {
  k: Kanvas;
  el: HTMLDivElement;
  settings = {
    allowHide: true,
    toolbarSize: 18,
    toolbarColor: 190,
    overlayWidth: 240,
    brushSize: 20,
    outpaintFill: false,
    zoomLock: false,
    maxSize: 2048,
    messageShow: true,
    messageTimeout: 5000,
  };

  constructor(k: Kanvas) {
    this.k = k;
    this.readSettings();
    this.el = document.createElement('div');
    this.el.id = `${this.k.containerId}-settings`;
    this.el.className = 'kanvas-settings';
    this.el.innerHTML = html;
    this.bindLiveControls();
  }

  readonly defaults = { allowHide: true, toolbarSize: 18, toolbarColor: 190, overlayWidth: 240, brushSize: 20, outpaintFill: false, zoomLock: false, maxSize: 2048, messageShow: true, messageTimeout: 5000 };

  resetSettings() {
    Object.assign(this.settings, this.defaults);
    this.saveSettings();
    this.populateInputs();
  }

  static clampOverlayWidth(value: number) {
    return Math.min(Math.max(value, 140), 400);
  }

  bindLiveControls() {
    const bind = (id: string, apply: (el: HTMLInputElement) => void) => {
      const el = this.el.querySelector<HTMLInputElement>(`#${id}`);
      el?.addEventListener('input', () => apply(el));
      el?.addEventListener('change', () => apply(el));
    };
    bind('kanvas-settings-size', (el) => {
      const v = parseInt(el.value, 10);
      if (!Number.isNaN(v)) {
        this.settings.toolbarSize = v;
        this.saveSettings();
      }
    });
    bind('kanvas-settings-color', (el) => {
      const v = parseInt(el.value, 10);
      if (!Number.isNaN(v)) {
        this.settings.toolbarColor = v;
        this.saveSettings();
      }
    });
    bind('kanvas-settings-overlay-width', (el) => {
      const v = parseInt(el.value, 10);
      if (!Number.isNaN(v)) {
        this.settings.overlayWidth = Settings.clampOverlayWidth(v);
        this.saveSettings();
      }
    });
    bind('kanvas-settings-allow-hide', (el) => {
      this.settings.allowHide = el.checked;
      this.saveSettings();
    });
    bind('kanvas-settings-zoom-lock', (el) => {
      this.settings.zoomLock = el.checked;
      this.saveSettings();
    });
    bind('kanvas-settings-max-size', (el) => {
      const v = parseInt(el.value, 10);
      if (!Number.isNaN(v)) {
        this.settings.maxSize = v;
        this.saveSettings();
      }
    });
    bind('kanvas-settings-brush-size', (el) => {
      const v = parseInt(el.value, 10);
      if (!Number.isNaN(v)) {
        this.settings.brushSize = v;
        this.saveSettings();
      }
    });
    bind('kanvas-settings-outpaint-fill', (el) => {
      this.settings.outpaintFill = el.checked;
      this.saveSettings();
    });
    bind('kanvas-settings-message-show', (el) => {
      this.settings.messageShow = el.checked;
      this.saveSettings();
    });
    bind('kanvas-settings-message-timeout', (el) => {
      const v = parseInt(el.value, 10);
      if (!Number.isNaN(v)) {
        this.settings.messageTimeout = v;
        this.saveSettings();
      }
    });
    const resetBtn = this.el.querySelector<HTMLButtonElement>('#kanvas-settings-reset');
    resetBtn?.addEventListener('click', () => this.resetSettings());
  }

  mountIntoOverlay() {
    const overlay = this.k.shapes?.getOverlayContainer?.();
    if (!overlay || this.el.parentElement === overlay) return;
    overlay.insertBefore(this.el, overlay.children[1] || null);
  }

  setCSS() {
    document.documentElement.style.setProperty('--kanvas-size', `${this.settings.toolbarSize}px`);
    document.documentElement.style.setProperty('--kanvas-color', `${this.settings.toolbarColor}`);
    document.documentElement.style.setProperty('--kanvas-overlay-width', `${Settings.clampOverlayWidth(this.settings.overlayWidth)}px`);
  }

  readSettings() {
    if (window.localStorage) {
      const raw = window.localStorage.getItem('sdnext-kanvas');
      const data = raw ? JSON.parse(raw) : {};
      for (const key in this.settings) {
        if (data[key] !== undefined) this.settings[key] = data[key];
      }
    }
    this.saveSettings();
  }

  saveSettings() {
    if (window.localStorage) window.localStorage.setItem('sdnext-kanvas', JSON.stringify(this.settings));
    this.setCSS();
    if (this.k.resize) this.k.resize.fitStage();
  }

  populateInputs() {
    (this.el.querySelector('#kanvas-settings-allow-hide') as HTMLInputElement).checked = this.settings.allowHide;
    (this.el.querySelector('#kanvas-settings-size') as HTMLInputElement).value = String(this.settings.toolbarSize);
    (this.el.querySelector('#kanvas-settings-color') as HTMLInputElement).value = String(this.settings.toolbarColor);
    (this.el.querySelector('#kanvas-settings-overlay-width') as HTMLInputElement).value = String(this.settings.overlayWidth);
    (this.el.querySelector('#kanvas-settings-zoom-lock') as HTMLInputElement).checked = this.settings.zoomLock;
    (this.el.querySelector('#kanvas-settings-message-show') as HTMLInputElement).checked = this.settings.messageShow;
    (this.el.querySelector('#kanvas-settings-message-timeout') as HTMLInputElement).value = String(this.settings.messageTimeout);
    (this.el.querySelector('#kanvas-settings-brush-size') as HTMLInputElement).value = String(this.settings.brushSize);
    (this.el.querySelector('#kanvas-settings-outpaint-fill') as HTMLInputElement).checked = this.settings.outpaintFill;
    (this.el.querySelector('#kanvas-settings-max-size') as HTMLInputElement).value = String(this.settings.maxSize);
  }

  showSettings() {
    const isVisible = this.el.style.display === 'flex';
    if (!isVisible) this.populateInputs();
    this.el.style.display = isVisible ? 'none' : 'flex';
  }

  showInfo() { // eslint-disable-line class-methods-use-this
    window.open('https://vladmandic.github.io/sdnext-docs/Kanvas/', '_blank', '');
  }
}

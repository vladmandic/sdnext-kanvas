import '../dist/kanvas.esm.js';

let kanvasInstance = null;
const kanvasElement = 'kanvas-container';
const kanvasChangeButton = 'kanvas-change-button';

function getKanvasData() { // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  if (kanvasInstance) return kanvasInstance.getImage();
  return null;
}

function loadFromURL(url) { // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  if (!url) return null;
  if (Array.isArray(url) && url.length > 0) url = url[0];
  if (url.data) url = url.data;
  if (kanvasInstance) kanvasInstance.addImage(url);
  return null;
}

async function initKanvas() {
  if (typeof log !== 'undefined') log(`Kanvas: element=${kanvasElement}`); // eslint-disable-line no-undef
  const t0 = performance.now();
  let el = document.getElementById(kanvasElement);
  while (!el) {
    if (performance.now() - t0 > 20000) {
      console.error('Kanvas: timeout', kanvasElement); // eslint-disable-line no-console
      return;
    }
    el = document.getElementById(kanvasElement);
    await new Promise((resolve) => setTimeout(resolve, 50)); // eslint-disable-line no-promise-executor-return
  }
  el.innerHTML = '';
  kanvasInstance = new Kanvas(kanvasElement); // eslint-disable-line no-undef
  const btn = document.getElementById(kanvasChangeButton);
  if (btn) kanvasInstance.onchange = () => btn.click();
  window.kanvas = kanvasInstance; // expose to global
  window.getKanvasData = getKanvasData; // expose to global
  window.loadFromURL = loadFromURL; // expose to global
}

onUiReady(initKanvas); // eslint-disable-line no-undef

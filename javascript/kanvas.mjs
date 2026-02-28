import '../dist/kanvas.esm.js';

let kanvasInstance = null;
const kanvasElement = 'kanvas-container';

function getKanvasData() {
  if (kanvasInstance) return kanvasInstance.getImage();
  return null;
}

function loadFromURL(url) {
  if (!url) return null;
  let uri = url;
  if (Array.isArray(uri) && uri.length > 0) uri = uri[0];
  if (uri.data) uri = uri.data;
  if (kanvasInstance) kanvasInstance.addImage(uri);
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
  window.kanvas = kanvasInstance; // expose to global
  window.getKanvasData = getKanvasData; // expose to global
  window.loadFromURL = loadFromURL; // expose to global
}

onUiReady(initKanvas); // eslint-disable-line no-undef

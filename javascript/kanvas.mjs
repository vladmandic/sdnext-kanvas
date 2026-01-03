import '../dist/kanvas.esm.js';

let kanvasInstance = null;
const kanvasElement = 'kanvas-container';
const kanvasChangeButton = 'kanvas-change-button';

function getKanvasData() {
  if (kanvasInstance) return kanvasInstance.getImage();
  return null;
}

async function initKanvas() {
  if (typeof log !== 'undefined') log(`Kanvas: element=${kanvasElement}`); // eslint-disable-line no-undef
  const t0 = performance.now();
  let el = document.getElementById(kanvasElement);
  while (!el) {
    if (performance.now() - t0 > 20000) {
      console.error('Kanvas: timeout', kanvasElement);
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
}

onUiReady(initKanvas); // eslint-disable-line no-undef

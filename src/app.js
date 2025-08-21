import { initUI } from './ui.js';
import { state } from './models.js';
import { saveState } from './storage.js';

window.addEventListener('DOMContentLoaded', () => {
  initUI();
  registerSW();
});

function registerSW(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  }
}

setInterval(()=> saveState(state), 30000);
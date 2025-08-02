// src/index.ts

import { route } from './router';

import { initI18n } from './i18n';
import { initDashboard } from './views/dashboard';

async function startApp() {
  await initI18n();
  initDashboard();
  route();
}

window.addEventListener('DOMContentLoaded', () => {
  startApp().catch(console.error);
});
window.addEventListener('hashchange', () => {
  route();
});


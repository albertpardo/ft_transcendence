// src/index.ts

import { route } from './router';

window.addEventListener('DOMContentLoaded', () => {
  console.log("triggered a dom content loaded");
  route();
});
window.addEventListener('hashchange', () => {
  console.log("triggered a hash change");
  route();
});


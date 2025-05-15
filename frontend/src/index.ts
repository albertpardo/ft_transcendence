// src/index.ts
// import './views/dashboard';
import { route } from './router';

window.addEventListener('DOMContentLoaded', () => route());
window.addEventListener('hashchange', () => route());


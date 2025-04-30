// src/index.ts
import './views/dashboard';    // importa sólo para que ejecute initDashboard()
import { route } from './router';

window.addEventListener('DOMContentLoaded', () => route());
window.addEventListener('hashchange', () => route());


// src/index.ts

import { route } from './router';


window.addEventListener('DOMContentLoaded', () => route());
window.addEventListener('hashchange', () => route());


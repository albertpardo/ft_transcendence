//src/router.ts

import { renderLogin } from './views/login';
import { renderHomeContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './views/sections';
import { initDashboard } from './views/dashboard';
import { renderProfileContent } from './views/profile';

export function route() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById('app')!;
  const isAuthenticated = !!localStorage.getItem('authToken');

  // Si NO está autenticado y no está en login, lo redirige al login
  if (!isAuthenticated && hash !== 'login') {
    window.location.hash = 'login';
    return;
  }

  // Si está en login (autenticado o no), carga la pantalla de login
  if (hash === 'login') {
    renderLogin(app);
    return;
  }

  // Si no esta login, monta ESTRUCTURA del dashboard UNA vez
  if (!document.getElementById('sidebar')) {
    initDashboard();
  }

  // Renderiza el contenido según la sección
  const contentArea = document.getElementById('content-area')!;
  const startButton = document.getElementById('start-button')!;
  const gameArea = document.getElementById('game-area')!;
  const gameWindow = document.getElementById('game-window')!;
  switch (hash) {
    case 'profile':    renderProfileContent(contentArea, startButton, gameArea, gameWindow);    break;
    case 'play':       renderPlayContent(contentArea, startButton, gameArea, gameWindow);       break;
    case 'tournament': renderTournamentContent(contentArea, startButton, gameArea, gameWindow); break;
    case 'stats':      renderStatsContent(contentArea, startButton, gameArea, gameWindow);      break;
    default:           renderHomeContent(contentArea, startButton, gameArea, gameWindow);
  }

  // Actualiza el estado activo de los links del sidebar
  document.querySelectorAll('#sidebar a[href^="#"]').forEach(link => {
    const el = link as HTMLAnchorElement;
    if (el.getAttribute('href') === `#${hash}`) {
      el.classList.add('bg-blue-600');
      el.classList.remove('bg-gray-700');
    } else {
      el.classList.add('bg-gray-700');
      el.classList.remove('bg-blue-600');
    }
  });
}

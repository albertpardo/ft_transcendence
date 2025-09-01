///src/router.ts

import { renderLogin } from './views/login';
import { renderHomeContent, renderPlayContent, renderStatsContent } from './views/sections';
import { renderProfileContent } from './views/profile';
import { renderHistoryContent } from './views/history';
import { renderTournamentContent, renderTournamentManagerContent } from './views/tournament';
import { initDashboard } from './views/dashboard';

import { renderFriendsContent } from './views/friends'

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
  const hideableElements = {
    contentArea: document.getElementById('content-area')!,
    buttonArea: document.getElementById('button-area')!,
    gameArea: document.getElementById('game-area')!,
    gameWindow: document.getElementById('game-window')!,
    gameInfo: document.getElementById('game-info')!,
  };
  switch (hash) {
    case 'profile':           renderProfileContent(hideableElements);           break;
    case 'play':              renderPlayContent(hideableElements);              break;
    case 'history':           renderHistoryContent(hideableElements);           break;
    case 'tournament':        renderTournamentContent(hideableElements);        break;
    case 'tournamentmanager': renderTournamentManagerContent(hideableElements); break;
    case 'friends':           renderFriendsContent(hideableElements);           break;
    default:                  renderHomeContent(hideableElements);
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

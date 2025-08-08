//src/router.ts

import { renderLogin } from './views/login';
import { renderHomeContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './views/sections';
import { renderProfileContent } from './views/profile';
import { renderHistoryContent } from './views/history';
import { initDashboard } from './views/dashboard';


const isAuthenticated = () => {
  return (
    !!localStorage.getItem("authToken") ||
    !!document.cookie.match("authToken=([^;]+)")
  );
};

export function route() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById("app") || document.body;
  const isAuthed = isAuthenticated();
  // Si NO está autenticado y no está en login, lo redirige al login
  if (!isAuthed && hash !== "login") {
    window.location.hash = "login";
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
  const contentArea =
    document.getElementById("content-area") || document.createElement("div");
  const startButton =
    document.getElementById("start-button") || document.createElement("div");
  const gameArea =
    document.getElementById("game-area") || document.createElement("div");
  const gameWindow =
    document.getElementById("game-window") || document.createElement("div");
  switch (hash) {
    case 'profile':     renderProfileContent(contentArea, startButton, gameArea, gameWindow);     break;
    case 'play':        renderPlayContent(contentArea, startButton, gameArea, gameWindow);        break;
    case 'history':     renderHistoryContent(contentArea, startButton, gameArea, gameWindow);     break;
    case 'tournament':  renderTournamentContent(contentArea, startButton, gameArea, gameWindow);  break;
    case 'stats':       renderStatsContent(contentArea, startButton, gameArea, gameWindow);       break;
    default:            renderHomeContent(contentArea, startButton, gameArea, gameWindow);
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

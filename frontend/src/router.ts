import { doSomething } from './views/buttonClicking';
import { renderLogin } from './views/login';
import {
  renderHomeContent,
  renderProfileContent,
  renderPlayContent,
  renderTournamentContent,
  renderStatsContent
} from './views/sections';
import { initDashboard } from './views/dashboard';

export function route() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById('app')!;
  const isAuthenticated = !!localStorage.getItem('authToken');

  // Si NO está autenticado y no está en login, lo redirige al login
  if (!isAuthenticated && hash !== 'login') {
    window.location.hash = 'login';
    return;
  }

  // Si está en login (no importa si autenticado o no), carga la pantalla de login
  if (hash === 'login') {
    renderLogin(app);
    return;
  }

  // Si no es login, monta ESTRUCTURA del dashboard UNA vez
  if (!document.getElementById('sidebar')) {
    initDashboard();
  }

  // Renderiza el contenido según la sección
  const contentArea = document.getElementById('content-area')!;
  const secretClickMeButton = document.getElementById('secret-button')!;
  const registeredGamesList = document.getElementById('registered-games-list')!;
  switch (hash) {
    case 'profile':    renderProfileContent(contentArea, secretClickMeButton, registeredGamesList);    break;
    case 'play':       renderPlayContent(contentArea, secretClickMeButton, registeredGamesList);       break;
    case 'tournament': renderTournamentContent(contentArea, secretClickMeButton, registeredGamesList); break;
    case 'stats':      renderStatsContent(contentArea, secretClickMeButton, registeredGamesList);      break;
    default:           renderHomeContent(contentArea, secretClickMeButton, registeredGamesList);
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

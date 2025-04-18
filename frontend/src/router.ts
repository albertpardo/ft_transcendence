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

  // Si la ruta es 'login', renderiza solo el login y sale
  if (hash === 'login') {
    renderLogin(app);
    return;
  }
  // Si no es login, monta ESTRUCTURA del dashboard UNA vez
  if (!document.getElementById('sidebar')) {
    initDashboard();
  }

  // Renderiza el contenido según la sección
  const content = document.getElementById('content-area')!;
  switch (hash) {
    case 'profile':    renderProfileContent(content);    break;
    case 'play':       renderPlayContent(content);       break;
    case 'tournament': renderTournamentContent(content); break;
    case 'stats':      renderStatsContent(content);      break;
    default:           renderHomeContent(content);
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

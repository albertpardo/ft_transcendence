// src/views/dashboard.ts
import { renderHomeContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './sections';
import { renderProfileContent } from './profile';

export function initDashboard() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <aside id="sidebar" class="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 p-6 flex flex-col">
      <h2 class="text-2xl font-bold mb-8 text-center">Transcendence</h2>
      <nav class="flex-grow space-y-3">
        <a href="#home" class="block p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition ${hash === 'home' ? 'bg-blue-600' : 'bg-gray-700'}">Dashboard</a>
        <a href="#profile" class="block p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition ${hash === 'profile' ? 'bg-blue-600' : 'bg-gray-700'}">Profile</a>
        <a href="#play" class="block p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition ${hash === 'play' ? 'bg-blue-600' : 'bg-gray-700'}">Play Pong</a>
        <a href="#tournament" class="block p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition ${hash === 'tournament' ? 'bg-blue-600' : 'bg-gray-700'}">Tournament</a>
        <a href="#stats" class="block p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition ${hash === 'stats' ? 'bg-blue-600' : 'bg-gray-700'}">Stats</a>
      </nav>
      <button id="logout-btn" class="mt-auto w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition">
        Logout
      </button>
    </aside>
    <main id="content-area" class="ml-64 p-6 md:p-8 lg:p-12 overflow-auto"></main>
  `;

  // Logout → vuelve a index.html
  document.getElementById('logout-btn')!.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.hash = 'login';
    route();
  });

  // Renderizar la sección activa
  const contentArea = document.getElementById('content-area')!;
  switch (hash) {
    case 'profile':    renderProfileContent(contentArea);    break;
    case 'play':       renderPlayContent(contentArea);       break;
    case 'tournament': renderTournamentContent(contentArea); break;
    case 'stats':      renderStatsContent(contentArea);      break;
    default:           renderHomeContent(contentArea);
  }
}

// Llamá initDashboard() solo una vez al iniciar la app
initDashboard();

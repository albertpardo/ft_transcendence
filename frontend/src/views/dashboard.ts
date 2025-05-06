// src/views/dashboard.ts
import { renderHomeContent, renderProfileContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './sections';
import { doSomething, registerGame } from './buttonClicking';

export function initDashboard() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <aside id="sidebar" class="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 p-6 flex flex-col">
	<div>
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
	  </div>
    </aside>
	<div>
    	<main id="content-area" class="ml-64 p-6 md:p-8 lg:p-12 overflow-auto"></main>
      <button id="secret-button" class="mt-auto w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition" hidden>click me bro</button>		
	</div>
  `;

  // Logout → vuelve a index.html
  document.getElementById('logout-btn')!.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.hash = 'login';
    route();
  });

  // Secret button
	document.getElementById('secret-button')!.addEventListener('click', () => {
		registerGame(function (error, response) {
			if (error) {
				console.error(error);
			}
			else {
				response?.text().then((result) => alert('Secret button clicked! Response text: ' + result));
			}
		});
	});
  

  // Renderizar la sección activa
  const contentArea = document.getElementById('content-area')!;
  const secretClickMeButton = document.getElementById('secret-button')!;
  switch (hash) {
    case 'profile':    renderProfileContent(contentArea, secretClickMeButton);    break;
    case 'play':       renderPlayContent(contentArea, secretClickMeButton);       break;
    case 'tournament': renderTournamentContent(contentArea, secretClickMeButton); break;
    case 'stats':      renderStatsContent(contentArea, secretClickMeButton);      break;
    default:           renderHomeContent(contentArea, secretClickMeButton);
  }
}

// Llamá initDashboard() solo una vez al iniciar la app
initDashboard();

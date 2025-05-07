// src/views/dashboard.ts
import { renderHomeContent, renderProfileContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './sections';
import { doSomething, registerGame, startGame } from './buttonClicking';

async function gameClicker(parsedId : string) : void {
	startGame(parsedId, function (error, response) {
		if (error) {
			console.error(error);
		}
		else {
			response?.text().then((result) => console.log(result));
			document.getElementById(parsedId).innerHTML = "check on the game";
		}
	});
}

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
	  <table id="registered-games-list" hidden></table>
	</div>
  `;
  const registeredGamesList = document.getElementById('registered-games-list')!;

  // Logout → vuelve a index.html
  document.getElementById('logout-btn')!.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.hash = 'login';
    route();
  });

  const listTableHeaders : string = "<tr><th>gameId</th><th>start the simulation button</th></tr>";
  // Secret button
	document.getElementById('secret-button')!.addEventListener('click', () => {
		registerGame(function (error, response) {
			if (error) {
				console.error(error);
			}
			else {
				response?.text().then((result) => {
					const parsedId : string = JSON.parse(result)?.gameId;
					registeredGamesList.innerHTML = listTableHeaders +
						"<tr><td>" + parsedId + "</td>" +
						"<td><button id=\"" + parsedId + "\" class=\"mt-auto w-full p-3 transition\">start the game...</button></td></tr>" +
						registeredGamesList.innerHTML.substring(listTableHeaders.length + 2);
					// the "+ 2" is because I guess something is transforming the html along the way to make it prettier and
					//it adds 2 additional characters, maybe they're a double newline actually.
					document.getElementById(parsedId)!.addEventListener('click', gameClicker(parsedId));
				});
			}
		});
	});
  

  // Renderizar la sección activa
  const contentArea = document.getElementById('content-area')!;
  const secretClickMeButton = document.getElementById('secret-button')!;
  switch (hash) {
    case 'profile':    renderProfileContent(contentArea, secretClickMeButton, registeredGamesList);    break;
    case 'play':       renderPlayContent(contentArea, secretClickMeButton, registeredGamesList);       break;
    case 'tournament': renderTournamentContent(contentArea, secretClickMeButton, registeredGamesList); break;
    case 'stats':      renderStatsContent(contentArea, secretClickMeButton, registeredGamesList);      break;
    default:           renderHomeContent(contentArea, secretClickMeButton, registeredGamesList);
  }
}

// Llamá initDashboard() solo una vez al iniciar la app
initDashboard();

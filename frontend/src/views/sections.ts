// src/views/sections.ts
// export function renderLoginContent(el: HTMLElement) {
//     el.innerHTML = `
//       <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
//         <h1 class="text-4xl font-bold mb-8">Transcendence</h1>
//         <input id="username" placeholder="Username" class="mb-4 p-3 rounded bg-gray-700 w-full max-w-md" />
//         <input id="password" type="password" placeholder="Password" class="mb-6 p-3 rounded bg-gray-700 w-full max-w-md" />
//         <button id="login-btn" class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg">
//           LOGIN
//         </button>
//       </div>
//     `;
//     document.getElementById('login-btn')!.addEventListener('click', () => {
//       // tras login correcto guardas token y vas a dashboard
//       localStorage.setItem('authToken', '…');
//       window.location.hash = '#home';
//       route();
//     });
//   }
  

// src/views/sections.ts

// import { doSomething } from './buttonClicking';

export function renderHomeContent(hideableElements) {
  hideableElements.contentArea.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Welcome to Transcendence!</h1>
    <p class="mb-4">Sección de inicio con texto e imagen de prueba.</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg mb-6" alt="Demo">
  `;
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
}

export function renderPlayContent(hideableElements) {
  hideableElements.contentArea.innerHTML = `
  `;
  // on this view, show the button and the registered games list
  hideableElements.buttonArea.hidden = false;
  hideableElements.gameArea.classList.remove("hidden");
  hideableElements.gameWindow.hidden = false;
}

export function renderStatsContent(hideableElements) {
  hideableElements.contentArea.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Stats</h1>
    <p class="mb-4">Stats</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Stats">
  `;
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
}

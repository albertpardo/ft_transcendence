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
export function renderHomeContent(el: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Welcome to Transcendence!</h1>
    <p class="mb-4">Sección de inicio con texto e imagen de prueba.</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg mb-6" alt="Demo">
  `;
}

export function renderPlayContent(el: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Play Pong</h1>
    <p class="mb-4">Pong (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Pong">
  `;
}

export function renderTournamentContent(el: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Tournaments</h1>
    <p class="mb-4">Tournaments (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Tournament">
  `;
}

export function renderStatsContent(el: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Stats</h1>
    <p class="mb-4">Stats (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Stats">
  `;
}

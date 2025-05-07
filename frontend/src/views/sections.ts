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

export function renderProfileContent(el: HTMLElement) {
  el.innerHTML = `
    <div class="w-full max-w-6xl p-10 bg-gray-800 rounded-lg shadow-md mx-auto my-8">
      <h1 class="text-4xl font-bold mb-10 text-center">Your Profile</h1>
      
      <div class="flex flex-col md:flex-row gap-12">
        <!-- Columna izquierda - Información de perfil -->
        <div class="md:w-1/3 flex flex-col items-center space-y-6">
          <div class="bg-gray-700 p-6 rounded-lg w-full flex flex-col items-center">
            <img src="/assets/images/default-avatar.png" alt="Profile Avatar" 
                class="w-40 h-40 rounded-full border-4 border-blue-600 mb-6">
            <h2 class="text-3xl font-bold mt-2">Username</h2>
            <p class="text-gray-400 text-lg mt-2">@nickname</p>
            <p class="text-gray-300 mt-4 text-center">Member since: January 2025</p>
            <button class="mt-6 px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors">
              Edit Profile
            </button>
          </div>
          
          <!-- Badges/achievements section -->
          <div class="bg-gray-700 p-6 rounded-lg w-full">
            <h3 class="text-2xl font-semibold mb-4">Achievements</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="p-3 bg-gray-600 rounded-lg flex flex-col items-center">
                <span class="text-3xl">🏆</span>
                <span class="text-sm mt-2">Champion</span>
              </div>
              <div class="p-3 bg-gray-600 rounded-lg flex flex-col items-center">
                <span class="text-3xl">🔥</span>
                <span class="text-sm mt-2">10 Wins</span>
              </div>
              <div class="p-3 bg-gray-600 rounded-lg flex flex-col items-center">
                <span class="text-3xl">⚡</span>
                <span class="text-sm mt-2">Fast Player</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Columna derecha - Estadísticas y juegos recientes -->
        <div class="md:w-2/3">
          <!-- Estadísticas -->
          <div class="mb-10">
            <h3 class="text-2xl font-semibold mb-6">Statistics</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="bg-gray-700 p-6 rounded-lg">
                <div class="text-4xl font-bold text-blue-400">10</div>
                <div class="text-gray-400 text-lg mt-2">Wins</div>
              </div>
              <div class="bg-gray-700 p-6 rounded-lg">
                <div class="text-4xl font-bold text-red-400">5</div>
                <div class="text-gray-400 text-lg mt-2">Losses</div>
              </div>
              <div class="bg-gray-700 p-6 rounded-lg">
                <div class="text-4xl font-bold text-yellow-400">2.0</div>
                <div class="text-gray-400 text-lg mt-2">Win Ratio</div>
              </div>
              <div class="bg-gray-700 p-6 rounded-lg">
                <div class="text-4xl font-bold text-green-400">15</div>
                <div class="text-gray-400 text-lg mt-2">Total Games</div>
              </div>
            </div>
          </div>
          
          <!-- Juegos recientes -->
          <div>
            <h3 class="text-2xl font-semibold mb-6">Recent Games</h3>
            <div class="space-y-5">
              <div class="bg-gray-700 p-5 rounded-lg flex justify-between items-center">
                <div class="flex items-center">
                  <div class="bg-blue-600 p-3 rounded-full mr-4">
                    <span class="text-xl">👤</span>
                  </div>
                  <div>
                    <div class="text-lg">vs PlayerOne</div>
                    <div class="text-sm text-gray-400">May 4, 2025</div>
                  </div>
                </div>
                <div class="text-green-500 text-lg font-semibold">Won 5-3</div>
              </div>
              
              <div class="bg-gray-700 p-5 rounded-lg flex justify-between items-center">
                <div class="flex items-center">
                  <div class="bg-red-600 p-3 rounded-full mr-4">
                    <span class="text-xl">👤</span>
                  </div>
                  <div>
                    <div class="text-lg">vs PlayerTwo</div>
                    <div class="text-sm text-gray-400">May 3, 2025</div>
                  </div>
                </div>
                <div class="text-red-500 text-lg font-semibold">Lost 2-5</div>
              </div>
              
              <div class="bg-gray-700 p-5 rounded-lg flex justify-between items-center">
                <div class="flex items-center">
                  <div class="bg-blue-600 p-3 rounded-full mr-4">
                    <span class="text-xl">👤</span>
                  </div>
                  <div>
                    <div class="text-lg">vs PlayerThree</div>
                    <div class="text-sm text-gray-400">May 1, 2025</div>
                  </div>
                </div>
                <div class="text-green-500 text-lg font-semibold">Won 5-1</div>
              </div>
              
              <div class="bg-gray-700 p-5 rounded-lg flex justify-between items-center">
                <div class="flex items-center">
                  <div class="bg-blue-600 p-3 rounded-full mr-4">
                    <span class="text-xl">👤</span>
                  </div>
                  <div>
                    <div class="text-lg">vs PlayerFour</div>
                    <div class="text-sm text-gray-400">April 29, 2025</div>
                  </div>
                </div>
                <div class="text-green-500 text-lg font-semibold">Won 5-2</div>
              </div>
            </div>
            
            <div class="mt-8 text-center">
              <button class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                View All Games
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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

import { route } from '../router';
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

export function renderHomeContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
 /*  el.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 class="text-4xl font-bold mb-8">Welcome to Transcendence</h1>
      <button id="login-btn" class="mb-4 px-8 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition">Login with 42</button>
      <div id="google-signin"></div>
      <div 
      id="google-signin" 
      data-action="http://localhost:8443/api/auth/google"
      class="g_id_signin"
      data-type="standard"
      data-size="large"
      data-theme="outline"
      data-text="signin_with"
      data-shape="rectangular"
      data-logo_alignment="center">
    </div>
    </div>
  `; */

   el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Welcome to Transcendence!</h1>
    <p class="mb-4">Sección de inicio con texto e imagen de prueba.</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg mb-6" alt="Demo">
  `;

  // Hide game-related elements
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;

/*   const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = 'https://localhost:8443/api/auth/42';
    });
  }

  // Initialize Google Sign-In after DOM is ready
  //initGoogleSignIn();
  setTimeout(() => {
    initGoogleSignIn();
  }, 500); */
}

export function renderPlayContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
  `;
  // on this view, show the button and the registered games list
  bu.hidden = false;
  gArea.hidden = false;
  gWin.hidden = false;
}

export function renderTournamentContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Tournaments</h1>
    <p class="mb-4">Tournaments (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Tournament">
  `;
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}

export function renderStatsContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Stats</h1>
    <p class="mb-4">Stats (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Stats">
  `;
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}

/* export async function handleGoogleCredentialResponse(response: { credential: string }) {
  try {
    const idToken = response.credential;

    // Send token to your backend
    const res = await fetch('https://localhost:8443/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: idToken }),
      credentials: 'include', // Important for cookies
    });
    console.log('📡 Response status:', res.status);
    console.log('📡 Response headers:', [...res.headers.entries()]);

    if (!res.ok) {
      throw new Error(`Google login failed: ${res.statusText}`);
    }

    const data = await res.json();

    // Store your app's tokens
    localStorage.setItem('authToken', data.authToken);
    localStorage.setItem('userId', data.userId);

    // Redirect to dashboard
    window.location.hash = 'play';
    route(); // Your routing function
  } catch (error) {
    console.error('Google sign-in error:', error);
    alert('Google sign-in failed. Please try again.');
  }
}

export function initGoogleSignIn() {
  const googleButton = document.getElementById('google-signin');
  if (!googleButton) return;

  // @ts-ignore - Google API is loaded globally
  if (typeof google === 'undefined') {
    console.error("Google Identity Services not loaded");
    return;
  }

  // @ts-ignore
  google.accounts.id.initialize({
    client_id: '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com', // ← Replace with your client ID
    callback: handleGoogleCredentialResponse,
    // auto_select: false,
  });

  // @ts-ignore
  google.accounts.id.renderButton(googleButton, {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
  });
} */
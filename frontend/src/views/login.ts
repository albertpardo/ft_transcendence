import { route } from "../router";

export function renderLogin(appElement: HTMLElement) {
  appElement.innerHTML = `
    <div class="w-full min-h-screen bg-gray-900 flex items-center justify-center">
      <div class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
        <div class="text-center">
          <h1 class="text-3xl font-extrabold text-white">Transcendence</h1>
          <p class="mt-2 text-gray-400">Sign in to your account</p>
        </div>
        
        <!-- Login Form -->
        <form class="mt-8 space-y-6" id="login-form">
          <div> 
            <label for="username" class="sr-only">Username</label>
            <input id="username" name="username" type="text" required 
              class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Username">
          </div>
          <div class="relative">
            <input id="login-password" name="password" type="password" required
                   class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                   placeholder="Password">
            <button type="button" onclick="togglePasswordVisibility('login-password')"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path id="eye-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path id="eye-slash-icon" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          
          
          <div id="login-error" class="text-red-500 text-sm hidden"></div>
          <div>
          <button type="submit" id="submit-button"
          class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">
          Sign in
          </button>
          </div>
          </form>
          
          <!-- Registration Form (hidden by default) -->
          <form class="mt-8 space-y-6 hidden" id="register-form">
          <div>
          <label for="reg-nickname" class="sr-only">Nick Name</label>
          <input id="reg-nickname" name="nickname" type="text" required 
          class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Nick Name">
          </div>
          <div>
          <label for="reg-username" class="sr-only">Username</label>
          <input id="reg-username" name="username" type="text" required 
              class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Username">
              </div>
          <div>
          <label for="reg-email" class="sr-only">Email</label>
          <input id="reg-email" name="email" type="email" required 
              class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Email">
          </div>
          <div class="relative">
          <input id="reg-password" name="password" type="password" required
                   class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                   placeholder="Password">
                   <button type="button" onclick="togglePasswordVisibility('reg-password')"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path id="eye-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path id="eye-slash-icon" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              </button>
          </div>
          <div id="register-error" class="text-red-500 text-sm hidden"></div>
          <div class="flex space-x-4">
          <button type="button" id="back-to-login"
              class="w-1/2 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800">
              Back
              </button>
              <button type="submit" id="register-button"
              class="w-1/2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800">
              Register
              </button>
              </div>
              </form>
              
              <div class="text-center mt-4">
              <p class="text-sm text-gray-400">
              <span id="toggle-form-text">Don't have an account? </span>
              <a href="#" id="toggle-form" class="text-blue-400 hover:text-blue-300">Register now</a>
              </p>
              </div>
              <button id="google-signin" class="flex items-center justify-center gap-3 bg-white text-gray-700 px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition w-full max-w-xs mx-auto">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/150px-Google_%22G%22_logo.svg.png" alt="Google" class="w-5 h-5" />
                <span>Sign in with Google</span>
              </button>
      </div>
    </div>
  `;

  // Form toggle functionality
  const toggleForm = document.getElementById('toggle-form');
  const toggleFormText = document.getElementById('toggle-form-text');
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  const registerForm = document.getElementById('register-form') as HTMLFormElement;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const togglePasswordVisibility = (fieldId: string, button?: HTMLElement) => {
  const passwordField = document.getElementById(fieldId) as HTMLInputElement;
  if (!passwordField) return;

  const isPassword = passwordField.type === 'password';
  passwordField.type = isPassword ? 'text' : 'password';

  // Visual feedback if button is provided
  if (button) {
    const svg = button.querySelector('svg');
    if (svg) {
      svg.querySelector('.eye-open')?.classList.toggle('hidden', !isPassword);
      svg.querySelector('.eye-closed')?.classList.toggle('hidden', isPassword);
    }
  }
};
(window as any).togglePasswordVisibility = togglePasswordVisibility;


  if (toggleForm && loginForm && registerForm && toggleFormText) {
    toggleForm.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginForm.classList.contains('hidden')) {
        // Show login, hide register
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        toggleFormText.textContent = 'Don\'t have an account? ';
        toggleForm.textContent = 'Register now';
      } else {
        // Show register, hide login
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        toggleFormText.textContent = 'Already have an account? ';
        toggleForm.textContent = 'Login now';
      }
    });

    // Back to login button
    const backToLogin = document.getElementById('back-to-login');
    if (backToLogin) {
      backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        toggleFormText.textContent = 'Don\'t have an account? ';
        toggleForm.textContent = 'Register now';
      });
    }
  }

  // Login form submission
  //const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = (document.getElementById('username') as HTMLInputElement).value;
      const password = (document.getElementById('login-password') as HTMLInputElement).value;
      const errorElement = document.getElementById('login-error') as HTMLElement;
      const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
      const loginBtn = document.getElementById('login-btn');

      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          window.location.href = 'https://localhost:8443/api/auth/42';
        });
      }
      console.log('📅 Scheduling initGoogleSignIn in 500ms...');
      waitForElement('#google-signin', () => {
        console.log('✅ #google-signin found, initializing...');
        setTimeout(initGoogleSignIn, 500); // Small delay for safety
      });
      
      // Clear previous errors
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
      
      // Disable button during request
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';
      
      try {
        // Try real API first
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json,application/html,text/html,*/*',
            'Origin': 'https://127.0.0.1:3000/',
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include',
          mode: 'cors',
        });

        const data = await response.json();
//        console.log("in login, received data:", data);

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Login failed');
//          const errorData = await response.json();
//          throw new Error(errorData.message || 'Login failed');
        }
       
       localStorage.setItem('authToken', data.token);
	     localStorage.setItem('userId', data.id);

       const userAvatar = data.user?.avatar?.trim()
        ? data.user.avatar
        : `https://i.pravatar.cc/150?u=${username}`;
       localStorage.setItem('user', JSON.stringify({ 
            username: data.user?.username || username,
            nickname: data.user?.nickname || username,
            avatar: userAvatar
//            avatar: data.user?.avatar || `https://i.pravatar.cc/150?u=${username}`
          }));
          window.location.hash = 'home';
    
        
      } catch (error) {
        errorElement.textContent = error instanceof Error ? error.message : 'Login failed';
        errorElement.classList.remove('hidden');
       
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign in';
      }
    });
  }

  // Registration form submission
 // const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nickname = (document.getElementById('reg-nickname') as HTMLInputElement).value;
      const username = (document.getElementById('reg-username') as HTMLInputElement).value;
      const email = (document.getElementById('reg-email') as HTMLInputElement).value;
      const password = (document.getElementById('reg-password') as HTMLInputElement).value;
      const errorElement = document.getElementById('register-error') as HTMLElement;
      const registerButton = document.getElementById('register-button') as HTMLButtonElement;
     
      // Clear previous errors
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
      // Simple validation
      if (!nickname || !username || !email || !password) {
        errorElement.textContent = 'Please fill all fields';
        errorElement.classList.remove('hidden');
        return;
      }

      // Disable button during request
      registerButton.disabled = true;
      registerButton.textContent = 'Registering...';
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json,application/html,text/html,*/*',
              'Origin': 'https://127.0.0.1:3000/',
            },
            body: JSON.stringify({ nickname, username, email ,password }),
            credentials: 'include',
            mode: 'cors',
        });


//        console.log(response);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }
        const data = await response.json();

        errorElement.classList.add('text-green-500');
        errorElement.textContent = 'Registration suc cessful! Please login.';
        errorElement.classList.remove('hidden');
        // Switch back to login form
        if (loginForm && registerForm && toggleForm && toggleFormText) {
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
          toggleFormText.textContent = 'Already have an account? ';
          toggleForm.textContent = 'Login now';
        }
        // Clear form
        (document.getElementById('reg-nickname') as HTMLInputElement).value = '';
        (document.getElementById('reg-username') as HTMLInputElement).value = '';
        (document.getElementById('reg-email') as HTMLInputElement).value = '';
        (document.getElementById('reg-password') as HTMLInputElement).value = '';
      } catch (error) {
        errorElement.textContent = error instanceof Error ? error.message : 'Registration failed';
        errorElement.classList.remove('hidden');
      } finally {
        registerButton.disabled = false;
        registerButton.textContent = 'Register';
      }
    });
  }
}// login button before here

function waitForGoogle() {
  const googleButton = document.getElementById('google-signin');
  if (googleButton && typeof google !== 'undefined') {
    console.log('✅ #google-signin found and Google script loaded');
    initGoogleSignIn();
  } else {
    console.log('⏳ Waiting for Google script or DOM...');
    setTimeout(waitForGoogle, 100);
  }
}

waitForGoogle();

const waitForElement = (selector: string, callback: () => void) => {
  const el = document.querySelector(selector);
  if (el) {
    callback();
  } else {
    setTimeout(() => waitForElement(selector, callback), 100);
  }
}

export function initGoogleSignIn() {
  const googleButton = document.getElementById('google-signin');
  if (!googleButton) {
    console.error('❌ #google-signin not found in DOM');
    return;
  }

  // @ts-ignore - Google API is global
  if (typeof google === 'undefined') {
    console.error('❌ Google script not loaded');
    return;
  }

  // @ts-ignore
  google.accounts.id.initialize({
    client_id: '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com',
    callback: handleGoogleCredentialResponse,
  });

  // @ts-ignore
  google.accounts.id.renderButton(googleButton, {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
  });

  console.log('✅ Google Sign-In button rendered');
}

async function handleGoogleCredentialResponse(response: { credential: string }) {
  console.log('🔐 Google token received:', response.credential);

  try {
    const res = await fetch('https://localhost:8443/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential }),
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    console.log('✅ Login success:', data);

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data.id);
    window.location.hash = 'play';
    route();
  } catch (error) {
    console.error('❌ Google sign-in failed:', error);
    alert('Google sign-in failed. Please try again.');
  }
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
  if (!googleButton) {
    console.error('❌ #google-signin not found in DOM');
    return;
  }

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
  console.log('✅ Google Sign-In button rendered');
} */


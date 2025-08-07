// src/index.ts

// src/index.ts

import { route } from './router';
import { initI18n } from './i18n';
import { initDashboard } from './views/dashboard';
import { renderLogin } from './views/login'; // Import the proper login renderer

export function checkAuthStatus(): Promise<boolean> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  return new Promise((resolve) => {
    // Check both localStorage and cookies
    const authToken =
      localStorage.getItem("authToken") ||
      document.cookie.match("authToken=([^;]+)")?.[1] ||
      "";

    if (!authToken) {
      // No auth token found
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.hash = "login";
      resolve(false);
      return;
    }

    // Verify token with server
    fetch(`${API_BASE_URL}/api/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          // Token is valid - ensure it's in localStorage
          if (!localStorage.getItem("authToken")) {
            localStorage.setItem("authToken", authToken);
          }
          resolve(true);
        } else {
          // Token is invalid
          localStorage.removeItem("authToken");
          document.cookie =
            "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.hash = "login";
          resolve(false);
        }
      })
      .catch(() => {
        // Network error - assume not authenticated
        localStorage.removeItem("authToken");
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.hash = "login";
        resolve(false);
      });
  });
}

async function startApp() {
  await initI18n();
  
  route(); // Initialize routing first
}

// This is the correct way to handle authentication
async function initializeApp() {
  try {
    const isAuthenticated = await checkAuthStatus();
    
    // Get the main app container
    const appElement = document.getElementById('app') || document.body;
    
    if (isAuthenticated) {
      // User is authenticated - show dashboard
      initDashboard();
      // Uncomment this when you're ready
      // bindDashboardEvents(); 
      
      // If they're on login page but authenticated, redirect to home
      if (window.location.hash === '#login' || window.location.hash === '#') {
        window.location.hash = 'home';
      }
    } else {
      // User is not authenticated - show login form
      renderLogin(appElement);
      
      // The 42 login button will be handled by renderLogin()
      // No need to add event listeners here
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    // Fallback to login if there's an error
    const appElement = document.getElementById('app') || document.body;
    renderLogin(appElement);
  }
}

// Initialize the app when DOM is ready
window.addEventListener('DOMContentLoaded', async () => {
  await startApp();
  await initializeApp();
  
  // Set up hash change listener for routing
  window.addEventListener('hashchange', () => {
    checkAuthStatus().then(isAuthenticated => {
      if (!isAuthenticated && window.location.hash !== '#login') {
        window.location.hash = 'login';
      }
    });
  });
});
/* 
import { route } from './router';
import { initI18n } from './i18n';
import { initDashboard, bindDashboardEvents } from './views/dashboard';


export function checkAuthStatus(): Promise<boolean> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  return new Promise((resolve) => {
    // Check both localStorage and cookies
    const authToken =
      localStorage.getItem("authToken") ||
      document.cookie.match("authToken=([^;]+)")?.[1] ||
      "";

    if (!authToken) {
      // No auth token found
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.hash = "login";
      resolve(false);
      return;
    }

    // Verify token with server
    fetch(`${API_BASE_URL}/api/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          // Token is valid - ensure it's in localStorage
          if (!localStorage.getItem("authToken")) {
            localStorage.setItem("authToken", authToken);
          }
          resolve(true);
        } else {
          // Token is invalid
          localStorage.removeItem("authToken");
          document.cookie =
            "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.hash = "login";
          resolve(false);
        }
      })
      .catch(() => {
        // Network error - assume not authenticated
        localStorage.removeItem("authToken");
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.hash = "login";
        resolve(false);
      });
  });
}


async function startApp() {
  await initI18n();
  initDashboard();
  route();
}

window.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus().then(isAuthenticated => {
    if (isAuthenticated) {
      // User is authenticated - initialize app
      
      initDashboard();
      // bindDashboardEvents();
      
      // If they're on login page but authenticated, redirect to home
      if (window.location.hash === '#login') {
        window.location.hash = 'home';
      }
    } else {
      // User is not authenticated
      showLoginForm();
      
      // Handle 42 login button
      const login42Btn = document.getElementById('login-42-btn');
      if (login42Btn) {
        login42Btn.addEventListener('click', () => {
          window.location.href = 'https://localhost:8443/api/auth/42';
        });
      }
    }

  startApp().catch(console.error);
});
window.addEventListener('hashchange', () => {
  route();
});
});


function showLoginForm() {
  // Hide dashboard or main app content if present
  const dashboard = document.getElementById('dashboard');
  if (dashboard) dashboard.style.display = 'none';

  // Show login form
  let loginForm = document.getElementById('login-form');
  if (!loginForm) {
    // Create the login form if it doesn't exist
    loginForm = document.createElement('div');
    loginForm.id = 'login-form';
    loginForm.innerHTML = `
      <h2>Login</h2>
      <button id="login-42-btn" type="button">Login with 42</button>
    `;
    document.body.appendChild(loginForm);
  } else {
    loginForm.style.display = 'block';
  }
}

 */
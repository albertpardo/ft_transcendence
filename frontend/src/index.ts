// src/index.ts
import { route } from "./router";
import { initI18n } from "./i18n";
import { initDashboard, bindDashboardEvents } from "./views/dashboard";
import { syncAuthTokens } from "./views/login";
import { renderLogin } from "./views/login";

function propagateTokenToLocalStorage() {
  // Check if we have a token in cookies but not in localStorage
  const cookieToken = document.cookie.match("authToken=([^;]+)")?.[1];
  const localStorageToken = localStorage.getItem("authToken");

  // If token is in cookie but not localStorage, add it to localStorage
  if (cookieToken && !localStorageToken) {
    localStorage.setItem("authToken", cookieToken);
    console.log("✅ Propagated authToken from cookie to localStorage");
  }

  // Also check for X-Set-LocalStorage header
  const localStorageHeader = document.querySelector(
    'meta[name="x-set-localstorage"]'
  );
  if (localStorageHeader) {
    const content = localStorageHeader.getAttribute("content");
    if (content && content.startsWith("authToken=")) {
      const token = content.split("=")[1];
      localStorage.setItem("authToken", token);
      console.log("✅ Set authToken from header");
      // Remove the meta tag to prevent repeated setting
      localStorageHeader.remove();
    }
  }
}

function handle42Callback() {
  // Check if we're coming from 42 callback
  if (window.location.hash.includes("callback")) {
    // CRITICAL: Wait longer for auth token to be set
    setTimeout(() => {
      // Force token synchronization
      syncAuthTokens();

      // Check if we're authenticated
      const isAuthenticated = !!localStorage.getItem("authToken");

      if (isAuthenticated) {
        console.log("✅ Auth token found after 42 callback");
        // Force route to home
        window.location.hash = "home";
        route();
      } else {
        console.log("❌ No auth token found after 42 callback");
        window.location.hash = "login";
        route();
      }
    }, 1000); // Increased from 500ms to 1000ms
  }
}


export function checkAuthStatus(): Promise<boolean> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  return new Promise((resolve) => {
    // Check both localStorage and cookies
    const authToken =
      localStorage.getItem("authToken") ||
      document.cookie.match("authToken=([^;]+)")?.[1] ||
      "";

    // CRITICAL FIX: Ensure authToken is in localStorage
    if (authToken && !localStorage.getItem("authToken")) {
      localStorage.setItem("authToken", authToken);
    }

    if (!authToken) {
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.hash = "login";
      resolve(false);
      return;
    }

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
          resolve(true);
        } else {
          localStorage.removeItem("authToken");
          document.cookie =
            "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.hash = "login";
          resolve(false);
        }
      })
      .catch(() => {
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
  route();
}

function setupAuthenticatedApp() {
  initDashboard();
  bindDashboardEvents();

  if (window.location.hash === "#login" || window.location.hash === "#") {
    window.location.hash = "home";
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  syncAuthTokens();
  handle42Callback();
  if (!document.querySelector('meta[name="x-set-localstorage"]')) {
    const meta = document.createElement("meta");
    meta.name = "x-set-localstorage";
    meta.content = "";
    document.head.appendChild(meta);
  }

  propagateTokenToLocalStorage();

  await startApp();

  // CRITICAL FIX: Check auth status on load
  const authToken =
    localStorage.getItem("authToken") ||
    document.cookie.match("authToken=([^;]+)")?.[1];

  if (authToken && !window.location.hash.includes("callback")) {
    setupAuthenticatedApp();
  }

  // CRITICAL FIX: Handle 42 callback properly
  if (window.location.hash.includes("callback")) {
    // Wait for auth token to propagate from cookie to localStorage
    setTimeout(() => {
      const authToken =
        localStorage.getItem("authToken") ||
        document.cookie.match("authToken=([^;]+)")?.[1];

      if (authToken) {
        setupAuthenticatedApp();
        window.location.hash = "home";
      } else {
        window.location.hash = "login";
      }
      route();
    }, 500);
  }

  // CRITICAL FIX: Always check current auth status in hashchange
  window.addEventListener("hashchange", () => {
    syncAuthTokens();
    const isAuthenticated =
      !!localStorage.getItem("authToken") ||
      !!document.cookie.match("authToken=([^;]+)");

    if (!isAuthenticated && window.location.hash !== "#login") {
      window.location.hash = "login";
    } else if (isAuthenticated && window.location.hash === "#login") {
      window.location.hash = "home";
    }
    route();
  });
});

/* import { route } from './router';
import { initI18n } from './i18n';
import { initDashboard, bindDashboardEvents } from './views/dashboard';
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

function setupAuthenticatedApp() {
  initDashboard();
  bindDashboardEvents();

  // If they're on login page but authenticated, redirect to home
  if (window.location.hash === "#login" || window.location.hash === "#") {
    window.location.hash = "home";
  }
}

 async function initializeApp() {
  try {
    const isAuthenticated = await checkAuthStatus();

    // Get the main app container
    const appElement = document.getElementById("app") || document.body;

    if (isAuthenticated) {
      // User is authenticated - show dashboard
      initDashboard();

      // CRITICAL: This was commented out but is needed
      bindDashboardEvents();

      // Initialize routing
      route();

      // If they're on login page but authenticated, redirect to home
      if (window.location.hash === "#login" || window.location.hash === "#") {
        window.location.hash = "home";
      }
    } else {
      // User is not authenticated - show login form
      renderLogin(appElement);
    }
  } catch (error) {
    console.error("Error initializing app:", error);
    // Fallback to login if there's an error
    const appElement = document.getElementById("app") || document.body;
    renderLogin(appElement);
  }
} 

window.addEventListener("DOMContentLoaded", async () => {
  await startApp();
  // await initializeApp();
  if (window.location.hash.includes("callback")) {
    // Wait for auth token to be set
    setTimeout(() => {
      window.location.hash = "home";
      route();
    }, 500);
  }
  const isAuthenticated = !!localStorage.getItem('authToken');
  if (isAuthenticated) {
    setupAuthenticatedApp();
  }

  // Set up hash change listener for routing
  window.addEventListener("hashchange", () => {
    //checkAuthStatus().then((isAuthenticated) => {
      if (!isAuthenticated && window.location.hash !== "#login") {
        window.location.hash = "login";
      } 
      // else if (isAuthenticated) {
        // CRITICAL: Re-initialize routing on hash change
        // Make sure dashboard events are bound
       // bindDashboardEvents();
     // } 
      route();
    });
  }); */
// });

// This is the correct way to handle authentication
/* async function initializeApp() {
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
 */
// Initialize the app when DOM is ready
/* window.addEventListener('DOMContentLoaded', async () => {
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
}); */
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

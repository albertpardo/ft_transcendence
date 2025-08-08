export function syncAuthTokens() {
  // Check if token is in cookie but not localStorage
  const cookieToken = document.cookie.match("authToken=([^;]+)")?.[1];
  const localStorageToken = localStorage.getItem("authToken");

  // If token is in cookie but not localStorage, add it to localStorage
  if (cookieToken && !localStorageToken) {
    localStorage.setItem("authToken", cookieToken);
    console.log("✅ Synced authToken from cookie to localStorage");
  }

  // Also check if token is in localStorage but not cookie
  if (localStorageToken && !cookieToken) {
    document.cookie = `authToken=${localStorageToken}; path=/; domain=localhost; secure; sameSite=none`;
    console.log("✅ Synced authToken from localStorage to cookie");
  }
}

export function renderLogin(appElement: HTMLElement) {
  syncAuthTokens();
  if (!document.querySelector('meta[name="x-set-localstorage"]')) {
    const meta = document.createElement("meta");
    meta.name = "x-set-localstorage";
    meta.content = "";
    document.head.appendChild(meta);
  }
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
        <button id="login-42-btn" class="w-full mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center">
        Sign in with&nbsp;&nbsp;
          <img src="../../public/assets/images/descarga.png" alt="42" class="w-5 h-5 mr-2" />
        </button>
        <div class="text-center mt-4">
          <p class="text-sm text-gray-400">
            <span id="toggle-form-text">Don't have an account? </span>
            <a href="#" id="toggle-form" class="text-blue-400 hover:text-blue-300">Register now</a>
          </p>
        </div>
      </div>
    </div>
  `;
  const login42Btn = document.getElementById("login-42-btn");
  if (login42Btn) {
    login42Btn.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("authProvider");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";
      
      window.location.href = "/api/auth/42";
    });
  }
  // Form toggle functionality
  const toggleForm = document.getElementById("toggle-form");
  const toggleFormText = document.getElementById("toggle-form-text");
  const loginForm = document.getElementById("login-form") as HTMLFormElement;
  const registerForm = document.getElementById(
    "register-form"
  ) as HTMLFormElement;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const togglePasswordVisibility = (fieldId: string, button?: HTMLElement) => {
    const passwordField = document.getElementById(fieldId) as HTMLInputElement;
    if (!passwordField) return;

    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";

    // Visual feedback if button is provided
    if (button) {
      const svg = button.querySelector("svg");
      if (svg) {
        svg.querySelector(".eye-open")?.classList.toggle("hidden", !isPassword);
        svg
          .querySelector(".eye-closed")
          ?.classList.toggle("hidden", isPassword);
      }
    }
  };
  (window as any).togglePasswordVisibility = togglePasswordVisibility;

  if (toggleForm && loginForm && registerForm && toggleFormText) {
    toggleForm.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginForm.classList.contains("hidden")) {
        // Show login, hide register
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        toggleFormText.textContent = "Don't have an account? ";
        toggleForm.textContent = "Register now";
      } else {
        // Show register, hide login
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        toggleFormText.textContent = "Already have an account? ";
        toggleForm.textContent = "Login now";
      }
    });

    // Back to login button
    const backToLogin = document.getElementById("back-to-login");
    if (backToLogin) {
      backToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        toggleFormText.textContent = "Don't have an account? ";
        toggleForm.textContent = "Register now";
      });
    }
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = (document.getElementById("username") as HTMLInputElement)
        .value;
      const password = (
        document.getElementById("login-password") as HTMLInputElement
      ).value;
      const errorElement = document.getElementById(
        "login-error"
      ) as HTMLElement;
      const submitButton = document.getElementById(
        "submit-button"
      ) as HTMLButtonElement;
      console.log(
        "okay, so we're trying to send username and passowrd:",
        username,
        password
      );
      console.log("the object:", { username: username, password: password });
      // Clear previous errors
      errorElement.classList.add("hidden");
      errorElement.textContent = "";

      // Disable button during request
      submitButton.disabled = true;
      submitButton.textContent = "Signing in...";

      try {
        // Try real API first
        if (!API_BASE_URL) {
          throw new Error(
            "API base URL is not defined. Please set VITE_API_BASE_URL in your environment variables."
          );
        }
        console.log("Sending login fetch to:", `${API_BASE_URL}/api/login`);

        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json,application/html,text/html,*/*",
          },
          body: JSON.stringify({ username: username, password: password }),
          credentials: "include",
          mode: "cors",
        });
        console.log("Login fetch response status:", response.status);
        console.log("Login fetch response headers:", [
          ...response.headers.entries(),
        ]);

        const contentType = response.headers.get("Content-Type") || "";
        if (!contentType.includes("application/json")) {
          const fallback = await response.text(); // .text() is safe now
          console.error("Received unexpected content type:", contentType);
          throw new Error(
            `Expected JSON, got: ${contentType}, body: ${fallback}`
          );
        }
        let data = await response.json();

        // console.log('**********Login response data:', data);

        if (!response.ok || data.error) {
          throw new Error(data.error || "Login failed");
        }
        // console.log('**********Storing auth token and user info');
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.id);

        const userAvatar = data.user?.avatar?.trim()
          ? data.user.avatar
          : `https://i.pravatar.cc/150?u=${username}`;
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: data.user?.username || username,
            nickname: data.user?.nickname || username,

            avatar:
              data.user?.avatar || `https://i.pravatar.cc/150?u=${username}`,
          })
        );
        window.location.hash = "home";
      } catch (error) {
        console.error("**********Login error caught:", error);
        errorElement.textContent =
          error instanceof Error ? error.message : "Login failed";
        errorElement.classList.remove("hidden");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Sign in";
      }
    });
  }

  // Registration form submission
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nickname = (
        document.getElementById("reg-nickname") as HTMLInputElement
      ).value;
      const username = (
        document.getElementById("reg-username") as HTMLInputElement
      ).value;
      const email = (document.getElementById("reg-email") as HTMLInputElement)
        .value;
      const password = (
        document.getElementById("reg-password") as HTMLInputElement
      ).value;
      const errorElement = document.getElementById(
        "register-error"
      ) as HTMLElement;
      const registerButton = document.getElementById(
        "register-button"
      ) as HTMLButtonElement;

      // Clear previous errors
      errorElement.classList.add("hidden");
      errorElement.textContent = "";

      // Simple validation
      if (!nickname || !username || !email || !password) {
        errorElement.textContent = "Please fill all fields";
        errorElement.classList.remove("hidden");
        return;
      }

      // Disable button during request
      registerButton.disabled = true;
      registerButton.textContent = "Registering...";

      try {
        if (!API_BASE_URL) {
          throw new Error(
            "API base URL is not defined. Please set VITE_API_BASE_URL in your environment variables."
          );
        }
        const response = await fetch(`${API_BASE_URL}/api/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json,application/html,text/html,*/*",

            // 'Origin': 'https://127.0.0.1:3000/',
          },
          body: JSON.stringify({
            nickname: nickname,
            username: username,
            email: email,
            password: password,
          }),
          credentials: "include",
          mode: "cors",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Registration failed");
        }
        const data = await response.json();

        errorElement.textContent = "Registration successful! Please login.";
        errorElement.classList.remove("hidden");
        errorElement.classList.add("text-green-500");
        // Switch back to login form
        if (loginForm && registerForm && toggleForm && toggleFormText) {
          loginForm.classList.remove("hidden");
          registerForm.classList.add("hidden");
          toggleFormText.textContent = "Already have an account? ";
          toggleForm.textContent = "Login now";
        }
        // Clear form
        (document.getElementById("reg-nickname") as HTMLInputElement).value =
          "";
        (document.getElementById("reg-username") as HTMLInputElement).value =
          "";
        (document.getElementById("reg-email") as HTMLInputElement).value = "";
        (document.getElementById("reg-password") as HTMLInputElement).value =
          "";
      } catch (error) {
        errorElement.textContent =
          error instanceof Error ? error.message : "Registration failed";
        errorElement.classList.remove("hidden");
      } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
      }
    });
  }
}

export function checkAuthStatus() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const authToken =
    localStorage.getItem("authToken") ||
    (document.cookie.match("authToken=([^;]+)")?.[1] ?? "");

  if (!authToken) {
    // No auth token found - redirect to login
    window.location.hash = "login";
    return false;
  }

  // Token exists - try to validate it
  return fetch(`${API_BASE_URL}/api/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        // Token is invalid - clear it and redirect to login
        localStorage.removeItem("authToken");
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.hash = "login";
        return false;
      }
      return true;
    })
    .catch(() => {
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.hash = "login";
      return false;
    });
}

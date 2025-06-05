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
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" name="password" type="password" required 
              class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Password">
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
          <div>
            <label for="reg-password" class="sr-only">Password</label>
            <input id="reg-password" name="password" type="password" required 
              class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Password">
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
      </div>
    </div>
  `;

  // Form toggle functionality
  const toggleForm = document.getElementById('toggle-form');
  const toggleFormText = document.getElementById('toggle-form-text');
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  const registerForm = document.getElementById('register-form') as HTMLFormElement;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const errorElement = document.getElementById('login-error') as HTMLElement;
      const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
      
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
       localStorage.setItem('user', JSON.stringify({ 
            username: data.user?.username || username,
            nickname: data.user?.nickname || username,
            avatar: data.user?.avatar || `https://i.pravatar.cc/150?u=${username}`
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

        errorElement.textContent = 'Registration successful! Please login.';
        errorElement.classList.remove('hidden');
        errorElement.classList.add('text-green-500');
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
}

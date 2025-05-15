// export function  renderLogin(appElement: HTMLElement) {
//   appElement.innerHTML = `
//     <div class="w-full min-h-screen bg-gray-900 flex items-center justify-center">
//       <div class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
//         <div class="text-center">
//           <h1 class="text-3xl font-extrabold text-white">Transcendence</h1>
//           <p class="mt-2 text-gray-400">Sign in to your account</p>
//         </div>
//         <form class="mt-8 space-y-6" id="login-form">
//           <div>
//             <label for="username" class="sr-only">Username</label>
//             <input id="username" name="username" type="text" required 
//               class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Username">
//           </div>
//           <div>
//             <label for="password" class="sr-only">Password</label>
//             <input id="password" name="password" type="password" required 
//               class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Password">
//           </div>
//           <div id="error-message" class="text-red-500 text-sm hidden"></div>
//           <div>
//             <button type="submit" id="submit-button"
//               class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">
//               Sign in
//             </button>
//           </div>
//         </form>


//          <form class="mt-8 space-y-6 hidden" id="register-form">
//           <div>
//             <label for="reg-name" class="sr-only">Full Name</label>
//             <input id="reg-name" name="name" type="text" required 
//               class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Full Name">
//           </div>
//           <div>
//             <label for="reg-username" class="sr-only">username</label>
//             <input id="reg-username" name="username" type="text" required 
//               class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="username">
//           </div>
//           <div>
//             <label for="reg-email" class="sr-only">Email</label>
//             <input id="reg-email" name="email" type="email" required 
//               class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Email">
//           </div>
//            <div>
//             <label for="reg-password" class="sr-only">Password</label>
//             <input id="reg-password" name="password" type="password" required 
//               class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Password">
//           </div>
//           <div id="register-error" class="text-red-500 text-sm hidden"></div>
//           <div class="flex space-x-4">
//             <button type="button" id="back-to-login"
//               class="w-1/2 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800">
//               Back
//             </button>
//             <button type="submit" id="register-button"
//               class="w-1/2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800">
//               Register
//             </button>
//           </div>
//         </form>
//         <div class="text-center mt-4">
//           <p class="text-sm text-gray-400">
//             Don't have an account? 
//             <a href="#register" class="text-blue-400 hover:text-blue-300">Register now</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   `;

//   const toggleForm = document.getElementById('toggle-form');
//   const toggleFormText = document.getElementById('toggle-form-text');
//   const loginForm = document.getElementById('login-form') as HTMLFormElement;
//   const registerForm = document.getElementById('register-form') as HTMLFormElement;

//   if (toggleForm && loginForm && registerForm) {
//     toggleForm.addEventListener('click', (e) => {
//       e.preventDefault();
//       if (loginForm.classList.contains('hidden')) {
//         // Show login, hide register
//         loginForm.classList.remove('hidden');
//         registerForm.classList.add('hidden');
//         if (toggleFormText) {
//           toggleFormText.textContent = "Don't have an account? ";
//         }
//         toggleForm.textContent = 'Register now';
//       } else {
//         // Show register, hide login
//         loginForm.classList.add('hidden');
//         registerForm.classList.remove('hidden');
//         if (toggleFormText) {
//           toggleFormText.textContent = 'Already have an account? ';
//         }
//         toggleForm.textContent = 'Login now';
//       }
//     });
//     const backToLogin = document.getElementById('back-to-login');
//     if (backToLogin) {
//       backToLogin.addEventListener('click', () => {
//         loginForm.classList.remove('hidden');
//         registerForm.classList.add('hidden');
//         if (toggleFormText) {
//           toggleFormText.textContent = "Don't have an account? ";
//         }
//         toggleForm.textContent = 'Register now';
//       });
//     }
//   }

//   const loginButton = document.getElementById('login-button') as HTMLButtonElement;
//   if (loginButton) {
//     loginButton.addEventListener('click', async (e) => {
//       e.preventDefault();
      
//       const username = (document.getElementById('username') as HTMLInputElement).value;
//       const password = (document.getElementById('password') as HTMLInputElement).value;
//       const errorElement = document.getElementById('login-error') as HTMLElement;
      
//       // Simple validation
//       if (!username || !password) {
//         errorElement.textContent = 'Please enter both username and password';
//         errorElement.classList.remove('hidden');
//         return;
//       }
//       try {
//         // Show loading state
//         loginButton.disabled = true;
//         loginButton.innerHTML = 'Signing in...';
        
//         // Simulate API delay
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // Mock successful login
//         localStorage.setItem('authToken', 'mock-jwt-token');
//         localStorage.setItem('user', JSON.stringify({
//           username,
//           name: 'Mock User',
//           avatar: 'https://i.pravatar.cc/150?u=' + username
//         }));

//         // Redirect to home
//         window.location.hash = 'home';
//       } catch (error) {
//         errorElement.textContent = 'Invalid credentials (mock response)';
//         errorElement.classList.remove('hidden');
//         loginButton.disabled = false;
//         loginButton.innerHTML = 'Sign in';
//       }
//     });
//   }
//   const registerButton = document.getElementById('register-button');
//   if (registerButton) {
//     registerButton.addEventListener('click', async (e) => {
//       e.preventDefault();
      
//       const name = (document.getElementById('reg-name') as HTMLInputElement).value;
//       const username = (document.getElementById('reg-username') as HTMLInputElement).value;
//       const email = (document.getElementById('reg-email') as HTMLInputElement).value;
//       const password = (document.getElementById('reg-password') as HTMLInputElement).value;
//       const errorElement = document.getElementById('register-error') as HTMLElement;
      
//       // Simple validation
//       if (!name || !username || !email || !password) {
//         errorElement.textContent = 'Please fill all fields';
//         errorElement.classList.remove('hidden');
//         return;
//       }

//       try {
//         // Show loading state
//         (registerButton as HTMLButtonElement).disabled = true;
//         registerButton.innerHTML = 'Registering...';
        
//         // Simulate API delay
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // Mock successful registration
//         errorElement.textContent = 'Registration successful! Please login.';
//         errorElement.classList.remove('hidden');
//         errorElement.classList.add('text-green-500');
        
//         // Switch back to login form
//         loginForm.classList.remove('hidden');
//         registerForm.classList.add('hidden');
//         if (toggleFormText) {
//           toggleFormText.textContent = "Don't have an account? ";
//         }
//         if (toggleForm) {
//           toggleForm.textContent = 'Register now';
//         }
        
//         // Clear form
//         (document.getElementById('reg-name') as HTMLInputElement).value = '';
//         (document.getElementById('reg-username') as HTMLInputElement).value = '';
//         (document.getElementById('reg-email') as HTMLInputElement).value = '';
//         (document.getElementById('reg-password') as HTMLInputElement).value = '';
//       } catch (error) {
//         errorElement.textContent = 'Registration failed (mock response)';
//         errorElement.classList.remove('hidden');
//       } finally {
//         (registerButton as HTMLButtonElement).disabled = false;
//         registerButton.innerHTML = 'Register';
//       }
//     });
//   }




//   const form = document.getElementById('login-form');
//   if (form) {
//     form.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const username = (document.getElementById('username') as HTMLInputElement).value;
//       const password = (document.getElementById('password') as HTMLInputElement).value;
//       const errorMessage = document.getElementById('error-message') as HTMLElement;
//       const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
//       console.log('Login attempt:', username, password);
//       // Aquí implementarías la validación real con el backend
//       // Por ahora simulamos un login exitoso

//       errorMessage.classList.add('hidden');
//       errorMessage.textContent = '';
//       submitButton.disabled = true;
//       submitButton.textContent = 'Signing in...';
//       try {
//         const response = await fetch('http://localhost:4000/api/login', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ username, password }),
//         });
//         const data = await response.json();
//         if (!response.ok) {
//           throw new Error(data.message || 'Login failed');
//         }

//         localStorage.setItem('authToken', 'fake-jwt-token');
        
//         // Redireccionar al dashboard home
//         window.location.hash = 'home';
//       } catch (error) {
//         console.error('Login error:', error);
//         errorMessage.textContent = error.message || 'An unexpected error occurred';
//         errorMessage.classList.remove('hidden');
//       } finally {
//         submitButton.disabled = false;
//         submitButton.textContent = 'Sign in';
//       }
//     });
//   }
// }

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
            <label for="reg-name" class="sr-only">Full Name</label>
            <input id="reg-name" name="name" type="text" required 
              class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Full Name">
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
        const response = await fetch('http://localhost:4000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        
        // Store the authentication token
        localStorage.setItem('authToken', data.token || 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          username,
          name: username,
          avatar: `https://i.pravatar.cc/150?u=${username}`
        }));
        
        // Redirect to home
        window.location.hash = 'home';
      } catch (error) {
        console.error('Login error:', error);
        
        // Fallback to mock if API is not available
        if (error.message.includes('Failed to fetch')) {
          console.warn('API not available, using mock login');
          await new Promise(resolve => setTimeout(resolve, 1000));
          localStorage.setItem('authToken', 'mock-jwt-token');
          localStorage.setItem('user', JSON.stringify({
            username,
            name: 'Mock User',
            avatar: `https://i.pravatar.cc/150?u=${username}`
          }));
          window.location.hash = 'home';
        } else {
          // Show error message
          errorElement.textContent = error instanceof Error ? error.message : 'Login failed';
          errorElement.classList.remove('hidden');
        }
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
      
      const name = (document.getElementById('reg-name') as HTMLInputElement).value;
      const username = (document.getElementById('reg-username') as HTMLInputElement).value;
      const email = (document.getElementById('reg-email') as HTMLInputElement).value;
      const password = (document.getElementById('reg-password') as HTMLInputElement).value;
      const errorElement = document.getElementById('register-error') as HTMLElement;
      const registerButton = document.getElementById('register-button') as HTMLButtonElement;
      
      // Clear previous errors
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
      
      // Simple validation
      if (!name || !username || !email || !password) {
        errorElement.textContent = 'Please fill all fields';
        errorElement.classList.remove('hidden');
        return;
      }

      // Disable button during request
      registerButton.disabled = true;
      registerButton.textContent = 'Registering...';
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful registration
        errorElement.textContent = 'Registration successful! Please login.';
        errorElement.classList.remove('hidden');
        errorElement.classList.add('text-green-500');
        
        // Switch back to login form
        if (loginForm && registerForm && toggleForm && toggleFormText) {
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
          toggleFormText.textContent = 'Don\'t have an account? ';
          toggleForm.textContent = 'Register now';
        }
        
        // Clear form
        (document.getElementById('reg-name') as HTMLInputElement).value = '';
        (document.getElementById('reg-username') as HTMLInputElement).value = '';
        (document.getElementById('reg-email') as HTMLInputElement).value = '';
        (document.getElementById('reg-password') as HTMLInputElement).value = '';
      } catch (error) {
        errorElement.textContent = 'Registration failed (mock response)';
        errorElement.classList.remove('hidden');
      } finally {
        registerButton.disabled = false;
        registerButton.textContent = 'Register';
      }
    });
  }
}
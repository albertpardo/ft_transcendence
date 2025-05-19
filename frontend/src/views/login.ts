export function renderLogin(appElement: HTMLElement) {
  appElement.innerHTML = `
    <div class="w-full min-h-screen bg-gray-900 flex items-center justify-center">
      <div class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
        <div class="text-center">
          <h1 class="text-3xl font-extrabold text-white">Transcendence</h1>
          <p class="mt-2 text-gray-400">Sign in to your account</p>
        </div>
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
          <div>
            <button type="submit" 
              class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">
              Sign in
            </button>
          </div>
        </form>
        <div class="text-center mt-4">
          <p class="text-sm text-gray-400">
            Don't have an account? 
            <a href="#register" class="text-blue-400 hover:text-blue-300">Register now</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = (document.getElementById('username') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      
      console.log('Login attempt:', username, password);
      
      // Aquí implementarías la validación real con el backend
      // Por ahora simulamos un login exitoso
      localStorage.setItem('authToken', 'fake-jwt-token');
      
      // Redireccionar al dashboard home
      window.location.hash = 'home';
    });
  }
}

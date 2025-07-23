// frontend/src/googleAuth.ts

export class GoogleAuth {
  private static instance: GoogleAuth;
  private isInitialized = false;
  private readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  private constructor() {}

  public static getInstance(): GoogleAuth {
    if (!GoogleAuth.instance) {
      GoogleAuth.instance = new GoogleAuth();
    }
    return GoogleAuth.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        this.initializeGoogleSignIn();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeGoogleSignIn();
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
      document.head.appendChild(script);
    });
  }

  private initializeGoogleSignIn(): void {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: this.CLIENT_ID,
        callback: this.handleCredentialResponse.bind(this),
      });
      this.isInitialized = true;
    }
  }

  private async handleCredentialResponse(response: any): Promise<void> {
    try {
      // Decode JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub // Google user ID
      };

      // Try to authenticate with backend
      await this.authenticateWithBackend(googleUser, response.credential);
      
    } catch (error) {
      console.error('Error processing Google sign-in:', error);
      // Show error to user
      this.showError('Error al iniciar sesión con Google');
    }
  }

  private async authenticateWithBackend(googleUser: any, credential: string): Promise<void> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://127.0.0.1:3000/',
        },
        body: JSON.stringify({ 
          googleToken: credential,
          user: googleUser 
        }),
        credentials: 'include',
        mode: 'cors',
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Google login failed');
      }

      // Store auth data same way as regular login
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('user', JSON.stringify({ 
        username: data.user?.username || googleUser.email,
        nickname: data.user?.nickname || googleUser.name,
        avatar: data.user?.avatar || googleUser.picture
      }));

      // Redirect to home
      window.location.hash = 'home';
      
    } catch (error) {
      console.error('Backend authentication failed:', error);
      // Fallback: create temporary session (optional)
      this.handleFallbackAuth(googleUser);
    }
  }

  private handleFallbackAuth(googleUser: any): void {
    // Optional: Create a temporary session when backend is not available
    // Remove this if you always want backend authentication
    localStorage.setItem('authToken', 'google_temp_token');
    localStorage.setItem('userId', googleUser.sub);
    localStorage.setItem('user', JSON.stringify({ 
      username: googleUser.email,
      nickname: googleUser.name,
      avatar: googleUser.picture
    }));
    window.location.hash = 'home';
  }

  public renderButton(containerId: string): void {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id ${containerId} not found`);
      return;
    }

    // Clear previous button
    container.innerHTML = '';

    if (window.google && window.google.accounts) {
      window.google.accounts.id.renderButton(container, {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        locale: 'es',
        width: '100%'
      });
    }
  }

  private showError(message: string): void {
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  public signOut(): void {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  }
}

// Declare global Google types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
// src/views/dashboard.ts
import { registerPlayer, movePaddle } from './buttonClicking';
import { route } from '../router';
import { renderHomeContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './sections';
import { renderHistoryContent } from './history';
import { renderProfileContent } from './profile';
import { State, nullState } from './pongrender';
import { googleInitialized, resetGoogle, currentGoogleButtonId } from './login';
import confetti from 'canvas-confetti';

// Import VITE_API_BASE_URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Declare socket at the module level
let socket: WebSocket | null = null;
let playerSide: string = 'l';
let started: boolean = false;
let gameState: State = { ...nullState };

// Game elements interface
interface GameElements {
  ball: SVGElement | null;
  lpad: SVGElement | null;
  rpad: SVGElement | null;
  scoreText: HTMLElement | null;
  gameText: HTMLElement | null;
  startButton: HTMLElement | null;
}

// Helper to apply game result with visual feedback
const applyGameResult = (message: string, colorClass: string, pulseClass: string) => {
  const gameText = document.getElementById('game-text');
  if (!gameText) return;
  gameText.innerHTML = message;
  gameText.className = gameText.className.replace(/text-(red|green)-\d{3}/g, '');
  gameText.className = gameText.className.replace(/animate-(win|lose)-pulse/g, '');
  gameText.classList.add(colorClass, pulseClass);
};

// Trigger confetti effect
const triggerConfetti = () => {
  const gameWindow = document.getElementById('game-window');
  if (!gameWindow) return;
  const rect = gameWindow.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 4) / window.innerHeight;
  const colors = ['#4ade80', '#f87171', '#fbbf24', '#60a5fa'];

  confetti({
    particleCount: 150,
    spread: 180,
    origin: { x, y },
    colors,
    scalar: 1.3
  });

  confetti({
    particleCount: 100,
    angle: 60,
    spread: 55,
    decay: 0.9,
    gravity: 0.3,
    origin: { x: x - 0.2, y },
    scalar: 1.8,
    colors
  });

  confetti({
    particleCount: 100,
    angle: 120,
    spread: 55,
    decay: 0.9,
    gravity: 0.3,
    origin: { x: x + 0.2, y },
    scalar: 1.8,
    colors
  });

  setTimeout(() => confetti({ particleCount: 80, spread: 120, startVelocity: 40, origin: { x, y }, scalar: 1.1, colors }), 300);
  setTimeout(() => confetti({ particleCount: 60, spread: 100, startVelocity: 35, origin: { x, y }, scalar: 1.2, colors }), 600);
};

// Trigger rain effect
const triggerRainEffect = () => {
  const overlay = document.getElementById('rain-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const drop = document.createElement('div');
    drop.className = 'absolute bg-gradient-to-b from-blue-200 to-blue-400 rounded-full opacity-70 pointer-events-none';
    drop.style.width = Math.random() * 2 + 2 + 'px';
    drop.style.height = Math.random() * 10 + 10 + 'px';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.top = '-10px';
    drop.style.animation = `fall ${Math.random() * 2 + 2}s linear infinite`;
    overlay.appendChild(drop);
  }
};

// Reset game UI
const resetGameUi = () => {
  const overlay = document.getElementById('rain-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }
  const gameElements = {
    ball: document.getElementById("ball") as SVGElement | null,
    lpad: document.getElementById("lpad") as SVGElement | null,
    rpad: document.getElementById("rpad") as SVGElement | null,
    scoreText: document.getElementById("score-text") as HTMLElement | null,
    gameText: document.getElementById("game-text") as HTMLElement | null,
  };

  if (gameElements.ball) {
    gameElements.ball.setAttribute('cx', '640');
    gameElements.ball.setAttribute('cy', '360');
  }
  if (gameElements.lpad) gameElements.lpad.setAttribute('y', '310');
  if (gameElements.rpad) gameElements.rpad.setAttribute('y', '310');
  if (gameElements.scoreText) gameElements.scoreText.innerHTML = '0 : 0';
  if (gameElements.gameText) {
    gameElements.gameText.style.visibility = 'hidden';
    gameElements.gameText.innerHTML = 'Welcome to Pong!';
    gameElements.gameText.classList.remove(
      'text-red-400', 'text-green-400',
      'text-red-500', 'text-green-500',
      'animate-win-pulse', 'animate-lose-pulse'
    );
  }
};

// Cleanup game area
const cleanupGameArea = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  resetGameUi();
  document.getElementById('game-area')?.classList.add('hidden');
};

// Remove game event listeners
const removeGameEventListeners = () => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
};

// Reset game state
const resetGameState = () => {
  gameState = { ...nullState };
  started = false;
};

// Reset game text
const resetGameText = () => {
  const gameText = document.getElementById('game-text');
  if (gameText) {
    gameText.style.visibility = 'hidden';
    gameText.innerHTML = 'Game started!';
  }
};

// Move paddle wrapper
const movePaddleWrapper = (direction: number) => {
  movePaddle(direction, (error, response) => {
    if (error) console.error(error);
  });
};

// Keydown handler
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    movePaddleWrapper(-2);
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    movePaddleWrapper(2);
  }
};

// Keyup handler
const handleKeyUp = (e: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
    movePaddleWrapper(0);
  }
};

// Bind mobile controls
const bindMobileControls = () => {
  const leftUpArrow = document.getElementById('left-up');
  const leftDownArrow = document.getElementById('left-down');
  const rightUpArrow = document.getElementById('right-up');
  const rightDownArrow = document.getElementById('right-down');

  const bindControl = (button: HTMLElement | null, direction: number) => {
    if (!button) return;
    const start = () => movePaddleWrapper(direction);
    const stop = () => movePaddleWrapper(0);
    button.addEventListener('mousedown', start);
    button.addEventListener('touchstart', (e) => { e.preventDefault(); start(); });
    ['mouseup', 'mouseleave', 'touchend'].forEach(evt =>
      button.addEventListener(evt, stop)
    );
  };

  bindControl(leftUpArrow, -2);
  bindControl(leftDownArrow, 2);
  bindControl(rightUpArrow, -2);
  bindControl(rightDownArrow, 2);
};

// Start game logic
export function startGameLogic(token: string) {
  if (started) return;
  started = true;

  socket = new WebSocket(`${API_BASE_URL}/api/pong/game-ws?uuid=${localStorage.getItem("userId")}&authorization=${token}`);

  const gameElements: GameElements = {
    ball: document.getElementById("ball"),
    lpad: document.getElementById("lpad"),
    rpad: document.getElementById("rpad"),
    scoreText: document.getElementById("score-text"),
    gameText: document.getElementById("game-text"),
    startButton: document.getElementById("start-button")
  };

  socket.addEventListener("message", (event) => {
    try {
      const newState = JSON.parse(event.data);
      gameState = newState;

      if (gameElements.ball) {
        gameElements.ball.setAttribute('cx', String(newState.stateBall.x));
        gameElements.ball.setAttribute('cy', String(newState.stateBall.y));
      }
      if (gameElements.lpad) {
        gameElements.lpad.setAttribute('y', String(newState.stateLP.y));
      }
      if (gameElements.rpad) {
        gameElements.rpad.setAttribute('y', String(newState.stateRP.y));
      }

      if (gameElements.scoreText) {
        gameElements.scoreText.innerHTML = `${newState.stateScoreL} : ${newState.stateScoreR}`;
      }

      if (newState.stateWhoL !== "none" && newState.stateWhoL !== "null state") {
        if (gameElements.gameText) {
          gameElements.gameText.style.visibility = "visible";
        }

        if (playerSide === "l") {
          switch (newState.stateWhoL) {
            case "left":
              applyGameResult("You lost the round.", "text-red-400", "animate-lose-pulse");
              break;
            case "right":
              applyGameResult("You won the round!", "text-green-400", "animate-win-pulse");
              break;
            case "left fully":
              started = false;
              applyGameResult("You lost the game.", "text-red-500", "animate-lose-pulse");
              if (gameElements.startButton) gameElements.startButton.style.display = "block";
              setTimeout(() => triggerRainEffect(), 300);
              break;
            case "right fully":
              started = false;
              applyGameResult("You won the game!", "text-green-500", "animate-win-pulse");
              if (gameElements.startButton) gameElements.startButton.style.display = "block";
              setTimeout(() => triggerConfetti(), 300);
              break;
          }
        } else if (playerSide === "r") {
          switch (newState.stateWhoL) {
            case "right":
              applyGameResult("You lost the round.", "text-red-400", "animate-lose-pulse");
              break;
            case "left":
              applyGameResult("You won the round!", "text-green-400", "animate-win-pulse");
              break;
            case "right fully":
              started = false;
              applyGameResult("You lost the game.", "text-red-500", "animate-lose-pulse");
              if (gameElements.startButton) gameElements.startButton.style.display = "block";
              setTimeout(() => triggerRainEffect(), 300);
              break;
            case "left fully":
              started = false;
              applyGameResult("You won the game!", "text-green-500", "animate-win-pulse");
              if (gameElements.startButton) gameElements.startButton.style.display = "block";
              setTimeout(() => triggerConfetti(), 300);
              break;
          }
        }
      } else {
        if (gameElements.gameText) {
          gameElements.gameText.style.visibility = "hidden";
        }
      }
    } catch (e) {
      console.error("Error parsing game state:", e);
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket closed");
    if (gameElements.startButton) {
      gameElements.startButton.style.display = "block";
    }
  });

  socket.addEventListener("error", (err) => {
    console.error("WebSocket error:", err);
  });
}

// Bind dashboard UI events
function bindDashboardEvents() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('mobile-backdrop');

  const showMenu = () => {
    sidebar?.classList.remove('-translate-x-full');
    backdrop?.classList.remove('opacity-0');
    backdrop?.classList.add('pointer-events-auto', 'opacity-100');
  };

  const hideMenu = () => {
    sidebar?.classList.add('-translate-x-full');
    backdrop?.classList.add('opacity-0');
    backdrop?.classList.remove('pointer-events-auto');
  };

  mobileMenuToggle?.addEventListener('click', showMenu);
  mobileMenuClose?.addEventListener('click', hideMenu);
  backdrop?.addEventListener('click', hideMenu);

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (socket) {
      socket.close();
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('authProvider');
    resetGoogle();
    window.location.hash = '#login';
    window.location.reload();
  });
}

// Initialize the dashboard
export async function initDashboard() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById('app')!;

  // Set the full HTML structure
  app.innerHTML = `
    <!-- Mobile Header -->
    <header class="md:hidden fixed top-0 left-0 right-0 bg-gray-900 z-50 p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">Transcendence</h1>
      <button id="mobile-menu-toggle" class="text-white p-2 hover:bg-gray-700 rounded-lg transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </header>

    <!-- Sidebar -->
    <aside id="sidebar" class="
      fixed top-0 left-0 bottom-0 z-40
      w-full md:w-64
      bg-gray-900 p-4 md:p-6
      transform md:transform-none transition-transform duration-300 ease-in-out
      -translate-x-full md:translate-x-0
      flex flex-col
    ">
      <div class="md:hidden flex justify-end mb-4">
        <button id="mobile-menu-close" class="text-white p-2 hover:bg-gray-700 rounded-lg transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <h2 class="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center text-white">Transcendence</h2>
      <nav class="flex-grow space-y-2 md:space-y-3">
        <a href="#home" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='home'?'bg-blue-600':'bg-gray-700'}">Dashboard</a>
        <a href="#profile" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='profile'?'bg-blue-600':'bg-gray-700'}">Profile</a>
        <a href="#play" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='play'?'bg-blue-600':'bg-gray-700'}">Play Pong</a>
        <a href="#history" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='history'?'bg-blue-600':'bg-gray-700'}">Match History</a>
        <a href="#tournament" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='tournament'?'bg-blue-600':'bg-gray-700'}">Tournament</a>
        <a href="#stats" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='stats'?'bg-blue-600':'bg-gray-700'}">Stats</a>
      </nav>
      <button id="logout-btn" class="mt-auto w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium">Logout</button>
    </aside>

    <!-- Mobile Backdrop -->
    <div id="mobile-backdrop" class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 opacity-0 pointer-events-none transition-opacity duration-300"></div>

    <!-- Main Content -->
    <main id="content-area" class="pt-16 md:pt-0 md:ml-64 p-4 md:p-6 lg:p-8 xl:p-12 min-h-screen overflow-auto bg-gray-900"></main>

    <!-- Hidden Game Area -->
    <div id="game-area" class="flex flex-col items-center justify-center w-full max-w-7xl mt-4 hidden">
      <div id="game-window" class="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:w-[1280px] aspect-video bg-black mx-auto overflow-hidden min-h-0">
        <div id="rain-overlay" class="absolute inset-0 z-50 pointer-events-none hidden"></div>
        <!-- Left Controls -->
        <div class="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
          <button id="left-up" class="bg-white text-black p-1 rounded shadow" hidden>^</button>
          <button id="left-down" class="bg-white text-black p-1 rounded shadow" hidden>v</button>
        </div>
        <!-- SVG Field -->
        <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" class="absolute inset-0 w-full h-full">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#00ff00" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="black" />
          <g id="lpad-group">
            <rect id="lpad" x="40" y="310" width="10" height="100" class="fill-white" />
          </g>
          <g id="rpad-group">
            <rect id="rpad" x="1230" y="310" width="10" height="100" class="fill-white" />
          </g>
          <circle id="ball" cx="640" cy="360" r="3" class="fill-white" />
          <text id="score-text" x="640" y="60" font-family="Monospace" font-size="40" class="fill-white" text-anchor="middle">
            0 : 0
          </text>
          <text id="game-text" x="640" y="200" font-family="Sans-serif" font-size="60" text-anchor="middle" class="opacity-0 transition-all duration-300 fill-current">
            Welcome to Pong!
          </text>
        </svg>
        <!-- Right Controls -->
        <div class="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
          <button id="right-up" class="bg-white text-black p-1 rounded shadow" hidden>^</button>
          <button id="right-down" class="bg-white text-black p-1 rounded shadow" hidden>v</button>
        </div>
      </div>
      <button id="start-button" class="mt-6 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium">Click to join or reconnect</button>
    </div>
  `;

  // Bind UI events
  bindDashboardEvents();

  // Bind mobile controls
  bindMobileControls();

  // Keyboard controls
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Start button
  document.getElementById('start-button')?.addEventListener('click', () => {
    const btn = document.getElementById('start-button');
    if (btn) btn.style.display = 'none';
    registerPlayer((error: any) => {
      if (error) console.error('Register failed:', error);
    });
  });

  // Render content based on hash
  const contentArea = document.getElementById('content-area')!;
  const gameArea = document.getElementById('game-area')!;
  const startButton = document.getElementById('start-button')!;

  switch (hash) {
    case 'profile':     renderProfileContent(contentArea, startButton, gameArea); break;
    case 'play':        renderPlayContent(contentArea, startButton, gameArea); break;
    case 'history':     renderHistoryContent(contentArea, startButton, gameArea); break;
    case 'tournament':  renderTournamentContent(contentArea, startButton, gameArea); break;
    case 'stats':       renderStatsContent(contentArea, startButton, gameArea); break;
    default:            renderHomeContent(contentArea, startButton, gameArea);
  }

  // Handle hash change
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '') || 'home';
    if (newHash !== 'play') {
      cleanupGameArea();
      removeGameEventListeners();
      resetGameState();
    } else {
      resetGameText();
      if (localStorage.getItem("authToken")) {
        startGameLogic(localStorage.getItem("authToken")!);
      }
    }
    // Re-render content
    switch (newHash) {
      case 'profile':     renderProfileContent(contentArea, startButton, gameArea); break;
      case 'play':        renderPlayContent(contentArea, startButton, gameArea); break;
      case 'history':     renderHistoryContent(contentArea, startButton, gameArea); break;
      case 'tournament':  renderTournamentContent(contentArea, startButton, gameArea); break;
      case 'stats':       renderStatsContent(contentArea, startButton, gameArea); break;
      default:            renderHomeContent(contentArea, startButton, gameArea);
    }
  });
}
// src/views/dashboard.ts
import { registerPlayer, movePaddle } from './buttonClicking';
import { route } from '../router';
import { renderHomeContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './sections';
import { renderHistoryContent } from './history';
import { renderProfileContent } from './profile';
import { State, nullState } from './pongrender';
import confetti from 'canvas-confetti';

// Import VITE_API_BASE_URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Declare socket at the module level
let socket: WebSocket | null = null;
let gameState: State = nullState;
let playerSide: string = "tbd";
let started: boolean = false;

const resetGameText = () => {
  const gameText = document.getElementById("game-text") as HTMLElement | null;
  if (!gameText) return;

  gameText.style.visibility = "hidden";
  gameText.innerHTML = "Welcome to Pong!";
 
  gameText.classList.remove(
    "fill-white",
    'fill-red-400', 'fill-green-400',
    'fill-red-500', 'fill-green-500',
    'animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow'
  );
  gameText.classList.add("fill-white");
}

const resetGameUi = () => {
  const gameText = document.getElementById("game-text") as HTMLElement | null;
  const scoreText = document.getElementById("score-text") as HTMLElement | null;

  if (gameText) {
    gameText.style.visibility = "hidden";
    gameText.innerHTML = "Welcome to Pong!";
    // gameText.setAttribute("fill", "white");
    gameText.classList.remove(
      'fill-red-400', 'fill-green-400',
      'fill-red-500', 'fill-green-500',
      'animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow'
    );
  }
  if (scoreText) {
    scoreText.innerHTML = "0 : 0";
    scoreText.classList.add('opacity-0');
    setTimeout(() => {
      scoreText.classList.remove('opacity-0');
    }, 150);
  } 
}


const movePaddleWrapper = (d: number) => {
  movePaddle(d, (error, response) => {
    if (error) {
      console.error(error);
    }
    else {
      response?.text().then((result) => {
      });
    }
  });
}


const triggerConfetti = () => {
  const gameWindow = document.getElementById('game-window');
  if (!gameWindow) return;

  const rect = gameWindow.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 4) / window.innerHeight;

  const colors = ['#4ade80', '#f87171', '#fbbf24', '#60a5fa'];

  // 💥 Main burst
  confetti({
    particleCount: 150,
    spread: 90,
    startVelocity: 50,
    origin: { x, y },
    colors,
    scalar: 1.3
  });

  // 🎇 Streamers burst
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

  // ✨ Follow-up bursts
  setTimeout(() => confetti({
    particleCount: 80,
    spread: 120,
    startVelocity: 40,
    origin: { x, y },
    scalar: 1.1,
    colors
  }), 300);

  setTimeout(() => confetti({
    particleCount: 60,
    spread: 100,
    startVelocity: 35,
    origin: { x, y },
    scalar: 1.2,
    colors
  }), 600);
}

const triggerRainEffect = () => {
  const overlay = document.getElementById('rain-overlay');
  if (!overlay) return;

  overlay.innerHTML = ''; // Clear old rain
  overlay.classList.remove('hidden');

  for (let i = 0; i < 150; i++) {
    const drop = document.createElement('div');
    drop.classList.add('rain-drop');
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.4 + Math.random() * 0.6}s`;
    drop.style.animationDelay = `${Math.random()}s`;
    overlay.appendChild(drop);
  }

  // Optional lightning flash
  overlay.style.backgroundColor = 'rgba(255,255,255,0.1)';
  setTimeout(() => overlay.style.backgroundColor = 'transparent', 100);

  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }, 2000);
}

const triggerPaddleEffect = (paddleId: string) => {
  const group = document.getElementById(`${paddleId}-group`);
  if (!group) return;

  const pivotX = paddleId === 'lpad' ? 45 : 1235; // x + width/2
  const pivotY = 360;
  group.setAttribute(
    'transform',
    `translate(${pivotX},${pivotY}) scale(1.2) translate(${-pivotX},${-pivotY})`
  ); 

  setTimeout(() => {
    group.removeAttribute('filter'); // corrected
    group.removeAttribute('transform'); // corrected
  }, 300);
}

const triggerBallEffect = () => {
  const ball = document.getElementById('ball');
  if (!ball) return;
  
  ball.classList.add('animate-ball-pulse');
  setTimeout(() => ball.classList.remove('animate-ball-pulse'), 300);
}

const cleanupGameArea = () => {
  const gameWindow = document.getElementById('game-window');
  if (gameWindow) {
    gameWindow.innerHTML = `
      <div id="rain-overlay" class="absolute inset-0 z-50 pointer-events-none hidden"></div>
      <!-- Left Controls -->
      <div class="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
        <button id="left-up" class="bg-white text-black p-3 rounded shadow" hidden>^</button>
        <button id="left-down" class="bg-white text-black p-3 rounded shadow" hidden>v</button>
      </div>
      <!-- SVG Field -->
      <svg width="1280" height="720">
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
        <button id="right-up" class="bg-white text-black p-3 rounded shadow" hidden>^</button>
        <button id="right-down" class="bg-white text-black p-3 rounded shadow" hidden>v</button>
      </div>
    `;
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    movePaddleWrapper(-2);
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    movePaddleWrapper(2);
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
    movePaddleWrapper(0);
  }
}

// Add:
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Remove:
window.removeEventListener('keydown', handleKeyDown);
window.removeEventListener('keyup', handleKeyUp);
const removeGameEventListeners = () => {
  const leftUpArrow = document.getElementById("left-up");
  const leftDownArrow = document.getElementById("left-down");
  const rightUpArrow = document.getElementById("right-up");
  const rightDownArrow = document.getElementById("right-down");

  [leftUpArrow, leftDownArrow, rightUpArrow, rightDownArrow].forEach(btn => {
    if (btn) {
      btn.replaceWith(btn.cloneNode(true)); // Removes all event listeners
    }
  });

  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
}

// Reset game state
const resetGameState = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  gameState = nullState;
  playerSide = "tbd";
  started = false;
}

const bindDashboardEvents = () => {
  // Logout functionality
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    if (socket !== null) {
      socket.close();
    }
    window.location.hash = 'login';
    route();
  });
}

const applyGameResult = (message: string, colorClass: string, animationClass: string) => {
  const gameText = document.getElementById("game-text") as HTMLElement | null;
  if (!gameText) return;

  resetGameText(); // Reset before applying new styles

  gameText.style.visibility = "visible";
  gameText.innerHTML = message;
  void gameText.offsetWidth;
  gameText.classList.add(colorClass, animationClass);
}

export const startGameLogic = (authToken: string) => {
  resetGameText();
  resetGameUi();
  if (socket) {
    socket.removeEventListener("message", () => {});
    
    socket.close();
    socket = null;
  }
  socket = new WebSocket(`${API_BASE_URL}/api/pong/game-ws?uuid=${localStorage.getItem("userId")}&authorization=${authToken}`);
  
  const leftUpArrow = document.getElementById("left-up")!;
  const leftDownArrow = document.getElementById("left-down")!;
  const rightUpArrow = document.getElementById("right-up")!;
  const rightDownArrow = document.getElementById("right-down")!;
  const ball: HTMLElement = document.getElementById("ball")!;
  const lpad: HTMLElement = document.getElementById("lpad")!;
  const rpad: HTMLElement = document.getElementById("rpad")!;
  const scoreText : HTMLElement = document.getElementById("score-text")!;
  
  let gameText: HTMLElement | null = document.getElementById("game-text")!;
  if (gameText) {
    gameText.style.visibility = "hidden";
    gameText.classList.remove('opacity-0');
    gameText.classList.remove('animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow');
  } 

  // Reset game text
  gameText.style.visibility = "hidden";
  gameText.innerHTML = "Welcome to Pong!";
  // gameText.setAttribute("fill", "white"); // Default fill
  gameText.classList.remove(
    'text-red-400', 'text-green-400', 
    'text-red-500', 'text-green-500', 
    'animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow'
  );
  
  scoreText.innerHTML = "0 : 0";
  scoreText.classList.add('opacity-0');
  setTimeout(() => {
    scoreText.classList.remove('opacity-0');
  }, 150);
  
  gameText.classList.remove(
    'animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow',
    'text-red-400', 'text-green-400', 'text-red-500', 'text-green-500'
  );
  
  socket.addEventListener("message", (event: MessageEvent<string>) => {
    switch (event.data) {
      case "connected":
        break;
        case "added: L":
          started = false;
          playerSide = "l";
          leftUpArrow.hidden = false;
          leftDownArrow.hidden = false;
          rightUpArrow.hidden = true;
          rightDownArrow.hidden = true;
          gameText.style.visibility = "hidden";
          scoreText.classList.add('opacity-0');
          setTimeout(() => {
            scoreText.innerHTML = `${gameState.stateScoreL} : ${gameState.stateScoreR}`;
            scoreText.classList.remove('opacity-0');
          }, 150);
          break;
          case "added: R":
            started = false;
            playerSide = "r";
            rightUpArrow.hidden = false;
            rightDownArrow.hidden = false;
            leftUpArrow.hidden = true;
            leftDownArrow.hidden = true;
            gameText.style.visibility = "hidden";
            scoreText.classList.add('opacity-0');
            setTimeout(() => {
          scoreText.innerHTML = `${gameState.stateScoreL} : ${gameState.stateScoreR}`;
          scoreText.classList.remove('opacity-0');
        }, 150);
        break;
        case "started":
          started = true;
          break;
          default:
            try {
              const newState: State = JSON.parse(event.data);
              gameState = newState;

              ball.setAttribute("cx", "" + newState.stateBall.coords.x);
              ball.setAttribute("cy", "" + newState.stateBall.coords.y);
              lpad.setAttribute("y", "" + newState.stateLP.y);
              rpad.setAttribute("y", "" + newState.stateRP.y);
              
              if (gameState.stateWhoL !== "none" && gameState.stateWhoL !== "null state") {
                gameText.style.visibility = "visible";
                scoreText.innerHTML = `${newState.stateScoreL} : ${newState.stateScoreR}`;
                if (playerSide === "l") {
                  switch (gameState.stateWhoL) {
                    case "left":
                  handleGameMessage(event);
                  break;
                  case "right":
                    handleGameMessage(event);
                    break;
                    case "left fully":
                      started = false;
                      handleGameMessage(event);
                      setTimeout(() => triggerRainEffect(), 300);
                      document.getElementById('start-button')!.style.display = 'block';
                      break;
                      case "right fully":
                        started = false;
                        handleGameMessage(event);
                        setTimeout(() => triggerConfetti(), 300);
                        document.getElementById('start-button')!.style.display = 'block';
                        break;
                      }
                    } else if (playerSide === "r") {
              switch (gameState.stateWhoL) {
                case "right":
                  handleGameMessage(event);
                  break;
                  case "left":
                    handleGameMessage(event);
                    break;
                    case "right fully":
                      started = false;
                      handleGameMessage(event);
                      setTimeout(() => triggerRainEffect(), 300);
                      document.getElementById('start-button')!.style.display = 'block';
                      break;
                      case "left fully":
                  started = false;
                  handleGameMessage(event);
                  setTimeout(() => triggerConfetti(), 300);
                  document.getElementById('start-button')!.style.display = 'block';
                  break;
                }
              }
          } else {
            gameText.style.visibility = "hidden";
            scoreText.innerHTML = `${gameState.stateScoreL} : ${gameState.stateScoreR}`;
          }
        } catch (e) {
          console.error("Error parsing game state:", e);
        }
    }
  });

  document.getElementById('start-button')!.addEventListener('click', () => {
    document.getElementById('start-button')!.style.display = 'none';
    registerPlayer(function (error, response) {
      if (error) console.error(error);
    });
  });

  // Add button and keyboard event listeners
  leftUpArrow.addEventListener('mousedown', () => movePaddleWrapper(-2));
  leftUpArrow.addEventListener('mouseup', () => movePaddleWrapper(0));
  leftDownArrow.addEventListener('mousedown', () => movePaddleWrapper(2));
  leftDownArrow.addEventListener('mouseup', () => movePaddleWrapper(0));

  rightUpArrow.addEventListener('mousedown', () => movePaddleWrapper(-2));
  rightUpArrow.addEventListener('mouseup', () => movePaddleWrapper(0));
  rightDownArrow.addEventListener('mousedown', () => movePaddleWrapper(2));
  rightDownArrow.addEventListener('mouseup', () => movePaddleWrapper(0));

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
};


window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '') || 'home';
  if (hash !== 'play') {
    cleanupGameArea();
    removeGameEventListeners();
    resetGameState();
  } else {
    resetGameText();
    if (localStorage.getItem("authToken")) {
      startGameLogic(localStorage.getItem("authToken")!);
    }
  }

  initDashboard();
  bindDashboardEvents();
  console.log("Hash changed to:", window.location.hash);
});

interface GameMessageEvent extends MessageEvent<string> {}

interface GameElements {
  ball: HTMLElement;
  lpad: HTMLElement;
  rpad: HTMLElement;
  gameText: HTMLElement;
  scoreText: HTMLElement;
  startButton: HTMLElement;
}

const handleGameMessage = (event: MessageEvent<string>): void => {
  const gameElements = {
    ball: document.getElementById("ball") as SVGElement | null,
    lpad: document.getElementById("lpad") as SVGElement | null,
    rpad: document.getElementById("rpad") as SVGElement | null,
    gameText: document.getElementById("game-text") as HTMLElement | null,
    scoreText: document.getElementById("score-text") as HTMLElement | null,
    startButton: document.getElementById("start-button") as HTMLElement | null,
  };

  switch (event.data) {
    case "connected":
      console.log("Connected to game");
      break;
      
      case "added: L":
        playerSide = "l";
        started = false;
        if (gameElements.gameText) {
          gameElements.gameText.style.visibility = "hidden";
        }
        if (gameElements.scoreText) {
        gameElements.scoreText.classList.add("opacity-0");
        setTimeout(() => {
          gameElements.scoreText!.innerHTML = "0 : 0";
          gameElements.scoreText!.classList.remove("opacity-0");
        }, 150);
      }
      break;
      
      case "added: R":
        playerSide = "r";
        started = false;
        if (gameElements.gameText) {
          gameElements.gameText.style.visibility = "hidden";
        }
        if (gameElements.scoreText) {
        gameElements.scoreText.classList.add("opacity-0");
        setTimeout(() => {
          gameElements.scoreText!.innerHTML = "0 : 0";
          gameElements.scoreText!.classList.remove("opacity-0");
        }, 150);
      }
      break;
      
    case "started":
      started = true;
      if (gameElements.gameText) {
        gameElements.gameText.style.visibility = "hidden";
      }
      if (gameElements.startButton) {
        gameElements.startButton.style.display = "none";
      }
      break;

    default:
      try {
        const newState: State = JSON.parse(event.data);
        gameState = newState;

        // Update ball and paddles
        if (gameElements.ball) {
          gameElements.ball.setAttribute("cx", "" + newState.stateBall.coords.x);
          gameElements.ball.setAttribute("cy", "" + newState.stateBall.coords.y);
        }
        if (gameElements.lpad) {
          gameElements.lpad.setAttribute("y", "" + newState.stateLP.y);
        }
        if (gameElements.rpad) {
          gameElements.rpad.setAttribute("y", "" + newState.stateRP.y);
        }

        if (gameElements.gameText && gameElements.scoreText) {
          if (newState.stateWhoL !== "none" && newState.stateWhoL !== "null state") {
            gameElements.gameText.style.visibility = "visible";
            gameElements.scoreText.innerHTML = `${newState.stateScoreL} : ${newState.stateScoreR}`;

            // Reset styles
            gameElements.gameText.classList.remove(
              "text-red-400", "text-green-400",
              "text-red-500", "text-green-500",
              "animate-win-pulse", "animate-lose-pulse"
            );

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
                  if (gameElements.startButton) {
                    gameElements.startButton.style.display = "block";
                  }
                  setTimeout(() => triggerRainEffect(), 300);
                  break;
                case "right fully":
                  started = false;
                  applyGameResult("You won the game!", "text-green-500", "animate-win-pulse");
                  if (gameElements.startButton) {
                    gameElements.startButton.style.display = "block";
                  }
                  setTimeout(() => triggerConfetti(), 300);
                  break;
              }
            } else if (playerSide === "r") {
              switch (newState.stateWhoL) {
                case "right":
                  applyGameResult("You lost the round.",  "text-red-400", "animate-lose-pulse");
                  break;
                case "left":
               
                  applyGameResult("You won the round!", "text-green-400", "animate-win-pulse");
                  break;
                case "right fully":
                  started = false;
                  applyGameResult("You lost the game.", "text-red-500", "animate-lose-pulse");
                  if (gameElements.startButton) {
                    gameElements.startButton.style.display = "block";
                  }
                  setTimeout(() => triggerRainEffect(), 300);
                  break;
                case "left fully":
                  started = false;
                  applyGameResult("You won the game!", "text-green-500", "animate-win-pulse");
                  if (gameElements.startButton) {
                    gameElements.startButton.style.display = "block";
                  }
                  setTimeout(() => triggerConfetti(), 300);
                  break;
              }
            }
          } else {
            // No round result yet
            gameElements.gameText.style.visibility = "hidden";
            gameElements.scoreText.innerHTML = `${newState.stateScoreL} : ${newState.stateScoreR}`;
          }
        }
      } catch (e) {
        console.error("Error parsing game state:", e);
      }
  }
};

export async function initDashboard() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById('app')!;

  

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

    <!-- Sidebar/Navigation -->
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
    <div id="game-area" class="flex flex-col items-center justify-center w-full max-w-7xl mt-4">
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
      <button id="start-button" class="mt-6 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium">click to join or reconnect</button>
    </div>
  `;

  const contentArea = document.getElementById('content-area')!;
  const startButton = document.getElementById('start-button')!;
  const gameArea = document.getElementById('game-area')!;
  const gameWindow = document.getElementById('game-window')!;

  switch (hash) {
    case 'profile':     renderProfileContent(contentArea, startButton, gameArea, gameWindow);     break;
    case 'play':        renderPlayContent(contentArea, startButton, gameArea, gameWindow);        break;
    case 'history':     renderHistoryContent(contentArea, startButton, gameArea, gameWindow);     break;
    case 'tournament':  renderTournamentContent(contentArea, startButton, gameArea, gameWindow);  break;
    case 'stats':       renderStatsContent(contentArea, startButton, gameArea, gameWindow);       break;
    default:            renderHomeContent(contentArea, startButton, gameArea, gameWindow);
  }

  if (localStorage)
    startGameLogic(localStorage.getItem("authToken")!);
    if (hash === 'play') {
    gameArea.classList.remove('hidden');
  } else {
    gameArea.classList.add('hidden');
  }
  bindDashboardEvents();
}

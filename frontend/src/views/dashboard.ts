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

function movePaddleWrapper(d: number) {
  movePaddle(d, function (error, response) {
    if (error) {
      console.error(error);
    }
    else {
      response?.text().then((result) => {
//        console.log(result);
      });
    }
  });
}

function triggerConfetti() {
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

function triggerRainEffect() {
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

function triggerPaddleEffect(paddleId: string) {
  const paddle = document.getElementById(paddleId);
  if (!paddle) return;

  paddle.classList.add('animate-paddle-ping');
  setTimeout(() => paddle.classList.remove('animate-paddle-ping'), 500);
}

function triggerBallEffect() {
  const ball = document.getElementById('ball');
  if (!ball) return;
  
  ball.classList.add('animate-ball-pulse');
  setTimeout(() => ball.classList.remove('animate-ball-pulse'), 300);
}

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
    <div id="game-area" class="flex flex-col items-center justify-center" hidden>
      <div id="game-window" class="relative w-[1280px] h-[720px]">
        <div id="rain-overlay" class="absolute inset-0 z-50 pointer-events-none hidden"></div>

        <!-- Left Controls -->
        <div class="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
          <button id="left-up" class="bg-white text-black p-3 rounded shadow" hidden>^</button>
          <button id="left-down" class="bg-white text-black p-3 rounded shadow" hidden>v</button>
        </div>

        <!-- SVG Field -->
        <svg width="1280" height="720">
        <rect width="100%" height="100%" fill="black" />
        <rect id="lpad" x="40" y="310" width="10" height="100" class="fill-white" />
        <rect id="rpad" x="1230" y="310" width="10" height="100" class="fill-white" />
        <circle id="ball" cx="640" cy="360" r="3" class="fill-white" />
        <text id="score-text" x="640" y="60" font-family="Monospace" font-size="40" class="fill-white" text-anchor="middle">
          0 : 0
        </text>
        <text id="game-text" x="640" y="200" font-family="Sans-serif" font-size="60" text-anchor="middle" class="opacity-0 transition-all duration-300 fill-white">
          Welcome to Pong!
        </text>
        </svg>

        <!-- Right Controls -->
        <div class="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
          <button id="right-up" class="bg-white text-black p-3 rounded shadow" hidden>^</button>
          <button id="right-down" class="bg-white text-black p-3 rounded shadow" hidden>v</button>
        </div>

      </div>
      <button id="start-button" class="mt-6 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium">click to join or reconnect</button>
    </div>
  `;

  const leftUpArrow: HTMLElement = document.getElementById("left-up");
  const leftDownArrow : HTMLElement = document.getElementById("left-down");
  const rightUpArrow : HTMLElement = document.getElementById("right-up");
  const rightDownArrow : HTMLElement = document.getElementById("right-down");
  const ball : HTMLElement = document.getElementById("ball");
  const lpad : HTMLElement = document.getElementById("lpad");
  const rpad : HTMLElement = document.getElementById("rpad");
  
  let gameText : HTMLElement | null = document.getElementById("game-text");
  if (gameText) {
    gameText.style.visibility = "hidden";
    gameText.classList.remove('opacity-0');
    gameText.classList.remove('animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow');
  } 


  // gameText.classList.remove('animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow');


  // for some reason, doing a .hidden = false or true on this doesn't work.
  const scoreText : HTMLElement = document.getElementById("score-text");
//  console.log(ball);
//  console.log(lpad);
//  console.log(rpad);
  //WEBSOCKET TIME!
  let socket : WebSocket;
  let gameState : State = nullState;
  let playerSide : string = "tbd";
  // FIXME unused. remove or use.
  let started : boolean = false;
  if (localStorage.getItem("authToken")) {
    socket = new WebSocket(`${API_BASE_URL}/api/pong/game-ws?uuid=${localStorage.getItem("userId")}&authorization=${localStorage.getItem("authToken")}`);
    gameText.classList.remove(
      'animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow',
      'fill-red-400', 'fill-green-400', 'fill-red-500', 'fill-green-500'
    );
    socket.addEventListener("message", (event) => {
//      console.log("I, a tokened player, receive:", event.data);
      // XXX maybe a try catch? idk if it'd crash or something on a wrong input
      switch (event.data) {
        case "connected":
//          console.log("Welcome to pong.");
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
        case "error":
          break;
        default:
          const newState: State =JSON.parse(event.data);

           ball.setAttribute("cx", newState.stateBall.coords.x);
           ball.setAttribute("cy", newState.stateBall.coords.y);
           lpad.setAttribute("y", newState.stateLP.y);
           rpad.setAttribute("y", newState.stateRP.y);
           try {
             if (newState.stateBall.hitLPaddle) triggerPaddleEffect('lpad');
             if (newState.stateBall.hitRPaddle) triggerPaddleEffect('rpad');
             if (newState.stateBall.hitWall) triggerBallEffect();

           } catch (e) {
            console.error("Error updating game state:", e);
            }
           scoreText.innerHTML = `${newState.stateScoreL} : ${newState.stateScoreR}`;
           scoreText.classList.remove('opacity-0');

          gameState = newState;
          



          if (gameState.stateWhoL !== "none" && gameState.stateWhoL !== "null state") {
            gameText.style.visibility = "visible";
            gameText.classList.remove('opacity-0');
            // gameText.classList.remove('animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow');
            
            scoreText.innerHTML = "" + gameState.stateScoreL + " : " + gameState.stateScoreR;
            scoreText.classList.remove('opacity-0');
            if (playerSide === "l") {
              switch (gameState.stateWhoL) {
                case "left":
                  gameText.innerHTML = "You lost the round.";
                  gameText.classList.remove('fill-white'); 
                  gameText.setAttribute("fill", "#f87171");
                  break;
                case "right":
                  gameText.innerHTML = "You won the round!";
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#4ade80");
                  break;
                case "left fully":
                  started = false;
                  gameText.innerHTML = "You lost the game.";
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#f87171");
                  setTimeout(() => triggerRainEffect(), 300);
                  break;
                case "right fully":
                  started = false;
                  gameText.innerHTML = "You won the game!";
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#4ade80");
                  setTimeout(() => triggerConfetti(), 300);
                  break;
              }
            } else if (playerSide === "r") {
              switch (gameState.stateWhoL) {
                case "right":
                  gameText.innerHTML = "You lost the round.";
                  gameText.classList.remove('fill-white');  
                  gameText.setAttribute("fill", "#f87171");
                  break;
                case "left":
                  gameText.innerHTML = "You won the round!";
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#4ade80");
                  break;
                case "right fully":
                  started = false; 
                  gameText.innerHTML = "You lost the game.";
                  gameText.setAttribute("fill", "#f87171");
                  setTimeout(() => triggerRainEffect(), 300);
                  break;
                case "left fully":
                  started = false;
                  gameText.innerHTML = "You won the game!";
                  gameText.setAttribute("fill", "#4ade80");
                  setTimeout(() => triggerConfetti(), 300);
                  break;
              }
            }
          }
          else {
            gameText.style.visibility = "hidden";
            
            scoreText.innerHTML = "" + gameState.stateScoreL + " : " + gameState.stateScoreR;
            scoreText.classList.remove('opacity-0');
          }
      }
    });

    document.getElementById('start-button')!.addEventListener('click', () => {
      registerPlayer(function (error, response) {
        if (error) {
          console.error(error);
        }
        else {
          response?.text().then((result) => {
//            console.log(result);
          });
        }
      });
    });

    leftUpArrow.addEventListener('mousedown', () => {
      movePaddleWrapper(-2);
    });

    leftUpArrow.addEventListener('mouseup', () => {
      movePaddleWrapper(0);
    });

    leftUpArrow.addEventListener('mouseleave', () => {
      movePaddleWrapper(0);
    });

    leftDownArrow.addEventListener('mousedown', () => {
      movePaddleWrapper(2);
    });

    leftDownArrow.addEventListener('mouseup', () => {
      movePaddleWrapper(0);
    });

    leftDownArrow.addEventListener('mouseleave', () => {
      movePaddleWrapper(0);
    });

    rightUpArrow.addEventListener('mousedown', () => {
      movePaddleWrapper(-2);
    });

    rightUpArrow.addEventListener('mouseup', () => {
      movePaddleWrapper(0);
    });

    rightUpArrow.addEventListener('mouseleave', () => {
      movePaddleWrapper(0);
    });

    rightDownArrow.addEventListener('mousedown', () => {
      movePaddleWrapper(2);
    });

    rightDownArrow.addEventListener('mouseup', () => {
      movePaddleWrapper(0);
    });

    rightDownArrow.addEventListener('mouseleave', () => {
      movePaddleWrapper(0);
    });
  }
  // Mobile menu functionality
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle')!;
  const mobileMenuClose = document.getElementById('mobile-menu-close')!;
  const sidebar = document.getElementById('sidebar')!;
  const backdrop = document.getElementById('mobile-backdrop')!;

  function openMobileMenu() {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100');
    document.body.classList.add('overflow-hidden');
  }

  function closeMobileMenu() {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    backdrop.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');
  }

  mobileMenuToggle.addEventListener('click', openMobileMenu);
  mobileMenuClose.addEventListener('click', closeMobileMenu);
  backdrop.addEventListener('click', closeMobileMenu);

  // Close mobile menu when navigation link is clicked
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) { // md breakpoint
        closeMobileMenu();
      }
    });
  });

  // Close mobile menu on window resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });

  // Logout functionality
  document.getElementById('logout-btn')!.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    socket.close();
    window.location.hash = 'login';
    route();
  });

  // Render active section
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
}

// Initialize dashboard only once when starting the app
initDashboard();

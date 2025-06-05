// src/views/dashboard.ts
import { registerPlayer, movePaddle } from './buttonClicking';
import { route } from '../router';
import { renderHomeContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './sections';
import { renderProfileContent } from './profile';
import { State, nullState } from './pongrender';

export function initDashboard() {
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

        <!-- Left Controls -->
        <div class="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
          <button id="left-up" class="bg-white text-black p-3 rounded shadow" hidden>^</button>
          <button id="left-down" class="bg-white text-black p-3 rounded shadow" hidden>v</button>
        </div>

        <!-- SVG Field -->
        <svg width="1280" height="720">
          <rect width="100%" height="100%" fill="black" />
          <rect id="lpad" x="40" y="310" width="10" height="100" fill="white" />
          <rect id="rpad" x="1230" y="310" width="10" height="100" fill="white" />
          <circle id="ball" cx="640" cy="360" r="3" fill="white" />
          <text id="score-text" x="640" y="60" font-family="Monospace" font-size="40" fill="white" text-anchor=middle>
            0 : 0
          </text>
          <text id="game-text" x="640" y="200" font-family="Sans-serif" font-size="60" fill="white" text-anchor=middle>
            Placeholder text
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
  let gameText : HTMLElement = document.getElementById("game-text");
  gameText.style.visibility = "hidden";
  // for some reason, doing a .hidden = false or true on this doesn't work.
  const scoreText : HTMLElement = document.getElementById("score-text");
//  console.log(ball);
//  console.log(lpad);
//  console.log(rpad);
  //WEBSOCKET TIME!
  const socket = new WebSocket("https://127.0.0.1:8443/api/pong/game-ws", [localStorage.getItem("authToken")]);
  //const socket = new WebSocket("https://127.0.0.1:8443/api/pong/game-ws");
  let gameState : State = nullState;
  let playerSide : string = "tbd";
  let started : boolean = false;
  socket.addEventListener("message", (event) => {
//    console.log("I, a tokened player, receive:", event.data);
    // XXX maybe a try catch? idk if it'd crash or something on a wrong input
    switch (event.data) {
      case "connected":
//        console.log("Welcome to pong.");
        break;
      case "added: L":
        started = false;
        playerSide = "l";
        leftUpArrow.hidden = false;
        leftDownArrow.hidden = false;
        rightUpArrow.hidden = true;
        rightDownArrow.hidden = true;
        gameText.style.visibility = "hidden";
        scoreText.innerHTML = "" + 0 + " : " + 0;
        break;
      case "added: R":
        started = false;
        playerSide = "r";
        rightUpArrow.hidden = false;
        rightDownArrow.hidden = false;
        leftUpArrow.hidden = true;
        leftDownArrow.hidden = true;
        gameText.style.visibility = "hidden";
        scoreText.innerHTML = "" + 0 + " : " + 0;
        break;
      case "started":
        started = true;
        break;
      case "error":
//        console.log("some error returned from the server");
        break;
      default:
        gameState = JSON.parse(event.data);
        ball.setAttribute("cx", gameState.stateBall.coords.x);
        ball.setAttribute("cy", gameState.stateBall.coords.y);
        lpad.setAttribute("y", gameState.stateLP.y);
        rpad.setAttribute("y", gameState.stateRP.y);

        if (gameState.stateWhoL !== "none" && gameState.stateWhoL !== "null state") {
          gameText.style.visibility = "visible";
          scoreText.innerHTML = "" + gameState.stateScoreL + " : " + gameState.stateScoreR;
          if (playerSide === "l") {
            switch (gameState.stateWhoL) {
              case "left":
                gameText.innerHTML = "You lost the round.";
                break;
              case "right":
                gameText.innerHTML = "You won the round!";
                break;
              case "left fully":
                started = false;
                gameText.innerHTML = "You lost the game.";
                break;
              case "right fully":
                started = false;
                gameText.innerHTML = "You won the game!";
                break;
            }
          } else if (playerSide === "r") {
            switch (gameState.stateWhoL) {
              case "right":
                gameText.innerHTML = "You lost the round.";
                break;
              case "left":
                gameText.innerHTML = "You won the round!";
                break;
              case "right fully":
                started = false;
                gameText.innerHTML = "You lost the game.";
                break;
              case "left fully":
                started = false;
                gameText.innerHTML = "You won the game!";
                break;
            }
          }
        }
        else {
          gameText.style.visibility = "hidden";
          scoreText.innerHTML = "" + gameState.stateScoreL + " : " + gameState.stateScoreR;
        }
    }
  });
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
    socket.close();
    window.location.hash = 'login';
    route();
  });

  // Secret button (start the game, etc. this is for the game section)
  document.getElementById('start-button')!.addEventListener('click', () => {
    registerPlayer(socket);
  });

  leftUpArrow.addEventListener('mousedown', () => {
    movePaddle(socket, -2);
  });

  leftUpArrow.addEventListener('mouseup', () => {
    movePaddle(socket, 0);
  });

  leftUpArrow.addEventListener('mouseleave', () => {
    movePaddle(socket, 0);
  });

  leftDownArrow.addEventListener('mousedown', () => {
    movePaddle(socket, 2);
  });

  leftDownArrow.addEventListener('mouseup', () => {
    movePaddle(socket, 0);
  });

  leftDownArrow.addEventListener('mouseleave', () => {
    movePaddle(socket, 0);
  });

  rightUpArrow.addEventListener('mousedown', () => {
    movePaddle(socket, -2);
  });

  rightUpArrow.addEventListener('mouseup', () => {
    movePaddle(socket, 0);
  });

  rightUpArrow.addEventListener('mouseleave', () => {
    movePaddle(socket, 0);
  });

  rightDownArrow.addEventListener('mousedown', () => {
    movePaddle(socket, 2);
  });

  rightDownArrow.addEventListener('mouseup', () => {
    movePaddle(socket, 0);
  });

  rightDownArrow.addEventListener('mouseleave', () => {
    movePaddle(socket, 0);
  });

  // Render active section
  const contentArea = document.getElementById('content-area')!;
  const startButton = document.getElementById('start-button')!;
  const gameArea = document.getElementById('game-area')!;
  const gameWindow = document.getElementById('game-window')!;
  switch (hash) {
    case 'profile':    renderProfileContent(contentArea, startButton, gameArea, gameWindow);    break;
    case 'play':       renderPlayContent(contentArea, startButton, gameArea, gameWindow);       break;
    case 'tournament': renderTournamentContent(contentArea, startButton, gameArea, gameWindow); break;
    case 'stats':      renderStatsContent(contentArea, startButton, gameArea, gameWindow);      break;
    default:           renderHomeContent(contentArea, startButton, gameArea, gameWindow);
  }
}

// Initialize dashboard only once when starting the app
initDashboard();

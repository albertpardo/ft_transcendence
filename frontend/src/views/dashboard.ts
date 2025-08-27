// src/views/dashboard.ts
import { registerPlayer, localGaming, forfeit, movePaddle, localMovePaddle, confirmParticipation, checkIsInGame, checkReady, checkIsInTournament } from './buttonClicking';
import { route } from '../router';
import { renderHomeContent, renderPlayContent, renderStatsContent } from './sections';
import { renderHistoryContent, getNicknameForPlayerId } from './history';
import { renderProfileContent } from './profile';
import { renderTournamentContent, renderTournamentManagerContent, getCompleteTournamentInfo } from './tournament';
import { State, nullState } from './pongrender';
import { googleInitialized, resetGoogle, currentGoogleButtonId} from './login';
import confetti from 'canvas-confetti';
import { t, i18nReady } from '../i18n';


// Import VITE_API_BASE_URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
let socket: WebSocket | null = null;
let gameState: State = nullState;
let playerSide: string = "tbd";
let started: boolean = false;

export enum MetaGameState {
  nothing,
  waitmmopp,
  waitmmstart,
  inmmgame,
  waittouropp,
  waittourstart,
  waittourrdy,
  waittouropprdy,
  intourgame,
  losttour,
  inlocalgame,
  misc,
}

async function movePaddleWrapper(d: number) {
  const movePaddleRawResp = await movePaddle(d);
  const movePaddleResp = await movePaddleRawResp.text();
  const movePaddleRespObj = JSON.parse(movePaddleResp);
  if (movePaddleRespObj.err !== "nil") {
    console.error(movePaddleRespObj.err);
  }
}

async function localMovePaddleWrapper(d: number, p: string) {
  // p === "l" || "r";
  const lmovePaddleRawResp = await localMovePaddle(d, p);
  const lmovePaddleResp = await lmovePaddleRawResp.text();
  const lmovePaddleRespObj = JSON.parse(lmovePaddleResp);
  if (lmovePaddleRespObj.err !== "nil") {
    console.error(lmovePaddleRespObj.err);
  }
}

export async function getGameMetaInfo() {
  const fresp = await fetch(
    `${API_BASE_URL}/api/pong/game/info`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      credentials: 'include',
      mode: 'cors',
    }
  );
  const textFresp = await fresp.text();
  const parsedFresp = JSON.parse(textFresp);
  if (parsedFresp.err === "nil") {
    const oppId = parsedFresp.oppId;
    let oppName = "";
    if (oppId === "") {
      oppName = "<i>unknown</i>";
    }
    else {
      const oppNameRaw = await getNicknameForPlayerId(oppId);
      const oppNameText = await oppNameRaw.text();
      console.log("oppname from metainfo:", oppNameText);
      const oppNameJson = JSON.parse(oppNameText);
      if (oppNameJson.err !== "nil") {
        oppName = "<i>unknown</i>";
      }
      else {
        oppName = oppNameJson.nick;
      }
    }
    const ret = {
      gType: parsedFresp.gType,
      oppName: oppName,
    };
    return (ret);
  }
  else {
    console.error("suffered an error trying to get game info:", parsedFresp.err);
    if (parsedFresp.err === "Player not found in playersMap") {
      const ret = {
        gType: "none",
        oppName: "unknown",
      };
      return (ret);
    }
    const ret = {
      gType: "unknown",
      oppName: "unknown",
    };
    return (ret);
  }
}

async function checkIsInGameWrapper() {
  const checkIsInGameRaw = await checkIsInGame();
  const checkIsInGameRes = await checkIsInGameRaw.text();
  const checkIsInGameObj = JSON.parse(checkIsInGameRes);
  return (checkIsInGameObj?.res);
}

async function checkReadyWrapper() {
  const checkReadyRaw = await checkReady();
  const checkReadyRes = await checkReadyRaw.text();
  const checkReadyObj = JSON.parse(checkReadyRes);
  return (checkReadyObj?.res);
}

async function checkIsInTourWrapper() {
  const checkIsInTourRaw = await checkIsInTournament();
  const checkIsInTourRes = await checkIsInTourRaw.text();
  const checkIsInTourObj = JSON.parse(checkIsInTourRes);
  return (checkIsInTourObj?.res);
}

export async function buttonSetter(state : MetaGameState) {
  switch (state) {
    case MetaGameState.nothing: {
      // 1
      document.getElementById("start-button").disabled = false;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = true;
      document.getElementById("local-play-button").disabled = false;
      break;
    }
    case MetaGameState.waitmmopp: {
      // 2
      //no break
    }
    case MetaGameState.waitmmstart: {
      // 3
      //no break
    }
    case MetaGameState.inmmgame: {
      // 4
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = false;
      document.getElementById("local-play-button").disabled = true;
      break;
    }
    case MetaGameState.waittouropp: {
      // 5
      //no break
    }
    case MetaGameState.waittourstart: {
      // 6
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = true;
      document.getElementById("local-play-button").disabled = true;
      break;
    }
    case MetaGameState.waittourrdy: {
      // 7
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = false;
      document.getElementById("giveup-button").disabled = true;
      document.getElementById("local-play-button").disabled = true;
      break;
    }
    case MetaGameState.waittouropprdy: {
      // 8
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = true;
      document.getElementById("local-play-button").disabled = true;
      break;
    }
    case MetaGameState.intourgame: {
      // 9
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = false;
      document.getElementById("local-play-button").disabled = true;
      break;
    }
    case MetaGameState.losttour: {
      // 10
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = true;
      document.getElementById("local-play-button").disabled = true;
      break;
    }
    case MetaGameState.inlocalgame: {
      // 11
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = false;
      document.getElementById("local-play-button").disabled = true;
    }
    default: {
      //basically "misc"
      //idk if that's a good idea
      document.getElementById("start-button").disabled = false;
      document.getElementById("ready-button").disabled = false;
      document.getElementById("giveup-button").disabled = false;
      document.getElementById("local-play-button").disabled = false;
      break;
    }
  }
}

async function tourCheckAndSetIdlingButtons() {
  let isintour : bool = await checkIsInTourWrapper();
  console.log("isintour:", isintour);
  if (isintour) {
    // no game, but we're in a tournament
    // we're either waiting for it to start, or we've lost it. but the buttons should be the same so...
    buttonSetter(MetaGameState.waittourstart);
  }
  else {
    // no game. allow mm search
    buttonSetter(MetaGameState.nothing);
  }
}

export async function setterUponMetaInfo(gameInfo : HTMLElement, metaInfo : {gType: string, oppName: string}) {
  console.log("ENTERED setterUponMetaInfo");
  console.log("metainfo is:", metaInfo);
  if (metaInfo.gType === "none") {
    gameInfo.innerHTML = "";
    await tourCheckAndSetIdlingButtons();
  }
  else if (metaInfo.gType === "unknown") {
    // some bs happened. must investigate
    console.error("unknown game type");
    buttonSetter(MetaGameState.misc);
  }
  else if (metaInfo.gType === "normal") {
    // we don't check for anything since basically once you get into a game with whatever state it's got, you
    // can only forfeit/escape, unlike the tournament stuff which has some various conditions for getting ready/forfeitting.
    buttonSetter(MetaGameState.inmmgame);
    console.log("ginfo setter 1");
    gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
  }
  else if (metaInfo.gType === "tournament") {
    // ok, it's a tournament
    // there's only ONE situation which requires us to press the ready key.
    // we're in a game of type tournament and we're not ready.
    const isready : bool = await checkReadyWrapper();
    if (!isready) {
      buttonSetter(MetaGameState.waittourrdy);
    }
    else {
      buttonSetter(MetaGameState.intourgame);
    }
    console.log("ginfo setter 2");
    gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
  }
  else if (metaInfo.gType === "local") {
    buttonSetter(MetaGameState.inlocalgame);
    console.log("ginfo setter 3");
    gameInfo.innerHTML = "Game type: " + metaInfo.gType;
  }
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

function triggerBallEffect() {
  const ball = document.getElementById('ball');
  if (!ball) return;
  
  ball.classList.add('animate-ball-pulse');
  setTimeout(() => ball.classList.remove('animate-ball-pulse'), 300);
}
const wrapper = document.getElementById('google-signin-wrapper');
if (wrapper) {
  wrapper.hidden = true;
  if (currentGoogleButtonId) {
    const old = document.getElementById(currentGoogleButtonId);
    if (old) old.remove();
  }
  // currentGoogleButtonId = null; // Removed because it's a read-only import
}

function generalDirectionButtonHandler(arrow: HTMLButtonElement, dir: number, side: string, playerSide: {v: string}) {
  console.log("setting general arrow handling with:", arrow, dir, side, playerSide.v);
  arrow.addEventListener('mousedown', () => {
    if (playerSide.v === "local") {
      localMovePaddleWrapper(dir, side);
    }
    else {
      movePaddleWrapper(dir);
    }
  });

  arrow.addEventListener('mouseup', () => {
    if (playerSide.v === "local") {
      localMovePaddleWrapper(0, side);
    }
    else {
      movePaddleWrapper(0);
    }
  });

  arrow.addEventListener('mouseleave', () => {
    if (playerSide.v === "local") {
      localMovePaddleWrapper(0, side);
    }
    else {
      movePaddleWrapper(0);
    }
  });
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
        <a href="#home" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='home'?'bg-blue-600':'bg-gray-700'}">${t('nav.dashboard')}</a>
        <a href="#profile" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='profile'?'bg-blue-600':'bg-gray-700'}">${t('nav.profile')}</a>
        <a href="#play" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='play'?'bg-blue-600':'bg-gray-700'}">${t('nav.play')}</a>
        <a href="#history" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='history'?'bg-blue-600':'bg-gray-700'}">${t('nav.history')}</a>
        <a href="#tournament" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='tournament'?'bg-blue-600':'bg-gray-700'}">${t('nav.tournament')}</a>
        <a href="#tournamentmanager" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='tournamentmanager'?'bg-blue-600':'bg-gray-700'}">Tournament Management</a>
        <a href="#stats" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='stats'?'bg-blue-600':'bg-gray-700'}">${t('nav.stats')}</a>
      </nav>
      <button id="logout-btn" class="mt-auto w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium">${t('nav.logout')}</button>
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
      <div id="button-area" class="flex flex-col space-y-1">
        <button id="start-button" disabled
        class=
        "
          mt-6 p-3 bg-green-600 rounded-lg hover:bg-green-700 transition text-white font-medium
          disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        ">
          Search for a quick game
        </button>
        <button id="ready-button" disabled
        class=
        "
          mt-6 p-3 bg-green-600 rounded-lg hover:bg-green-700 transition text-white font-medium
          disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        ">
          Confirm participation
        </button>
        <button id="giveup-button" disabled
        class=
        "
          mt-6 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium
          disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        ">
          INSTANTLY forfeit
        </button>
        <button id="local-play-button" disabled
        class=
        "
          mt-6 p-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition text-white font-medium
          disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        ">
          Launch a local 1v1
        </button>
      </div>
      <p id="game-info"></p>
    </div>
  `;

  const leftUpArrow: HTMLElement = document.getElementById("left-up")!;
  const leftDownArrow : HTMLElement = document.getElementById("left-down")!;
  const rightUpArrow : HTMLElement = document.getElementById("right-up")!;
  const rightDownArrow : HTMLElement = document.getElementById("right-down")!;
  const ball : HTMLElement = document.getElementById("ball")!;
  const lpad : HTMLElement = document.getElementById("lpad")!;
  const rpad : HTMLElement = document.getElementById("rpad")!;
  const contentArea = document.getElementById('content-area')!;
  const startButton = document.getElementById('start-button')!;
  const gameArea = document.getElementById('game-area')!;
  const gameWindow = document.getElementById('game-window')!;
  let gameType = "normal";
  const gameInfo : HTMLElement = document.getElementById("game-info");

  document.getElementById("start-button").innerHTML = t("pong-buttons.start-button-text");
  document.getElementById("ready-button").innerHTML = t("pong-buttons.ready-button-text");
  document.getElementById("giveup-button").innerHTML = t("pong-buttons.giveup-button-text");
  document.getElementById("local-play-button").innerHTML = t("pong-buttons.local-play-button-text");
  
  let gameText : HTMLElement | null = document.getElementById("game-text")!;
  if (gameText) {
    gameText.style.visibility = "hidden";
    gameText.classList.remove('opacity-0');
    gameText.classList.remove('animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow');
  }
  // gameText.classList.remove('animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow');
  const scoreText : HTMLElement = document.getElementById("score-text")!;

  let socket : WebSocket;
  let gameState : State = nullState;
  let playerSide = {
    v : "tbd",
  };
  // FIXME unused. remove or use.
  let started : boolean = false;
  let metaInfo = await getGameMetaInfo();
  let reconn : boolean = false;
  if (localStorage.getItem("authToken")) {
    console.log("before the first setter, have:", metaInfo);
    await setterUponMetaInfo(gameInfo, metaInfo);
    if (metaInfo.gType === "tournament" || metaInfo.gType === "normal") {
      console.log("oh snap! reconnect the socket");
      reconn = true;
    }
    socket = new WebSocket(`${API_BASE_URL}/api/pong/game-ws?uuid=${localStorage.getItem("userId")}&authorization=${localStorage.getItem("authToken")}`);
    gameText.classList.remove(
      'animate-win-pulse', 'animate-lose-pulse', 'animate-text-glow',
      'fill-red-400', 'fill-green-400', 'fill-red-500', 'fill-green-500'
    );
    socket.addEventListener("message", async (event) => {
      await i18nReady;
//      console.log("I, a tokened player, receive:", event.data);
      // XXX maybe a try catch? idk if it'd crash or something on a wrong input
      switch (event.data) {
        case "opp joined":
          metaInfo = await getGameMetaInfo();
          if (metaInfo.gType === "unknown") {
            gameInfo.innerHTML = "";
          }
          else {
            gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
          }
          break;
        case "connected":
//          console.log("Welcome to pong.");
          break;
        case "confirmed":
          document.getElementById('ready-button').disabled = true;
          buttonSetter(MetaGameState.intourgame);
          break;
        case "abandon":
          started = false;
          playerSide.v = "tbd";
          leftUpArrow.hidden = true;
          leftDownArrow.hidden = true;
          rightUpArrow.hidden = true;
          rightDownArrow.hidden = true;
          gameText.style.visibility = "visible";
          gameText.innerHTML = `
          <tspan x="640" dy="1.2em">The match has been abandoned</tspan>
          <tspan x="640" dy="1.2em">by either of the two players</tspan>`;
          scoreText.innerHTML = "" + 0 + " : " + 0;
          buttonSetter(MetaGameState.nothing);
          break;
        case "added: L":
          metaInfo = await getGameMetaInfo();
          if (metaInfo.gType === "unknown") {
            gameInfo.innerHTML = "";
          }
          else {
            gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
          }
          await setterUponMetaInfo(gameInfo, metaInfo);
          started = false;
          playerSide.v = "l";
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
          metaInfo = await getGameMetaInfo();
          if (metaInfo.gType === "unknown") {
            gameInfo.innerHTML = "";
          }
          else {
            gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
          }
          await setterUponMetaInfo(gameInfo, metaInfo);
          started = false;
          playerSide.v = "r";
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
        case "local":
          metaInfo = await getGameMetaInfo();
          if (metaInfo.gType === "unknown") {
            gameInfo.innerHTML = "";
          }
          await setterUponMetaInfo(gameInfo, metaInfo);
          playerSide.v = "local";
          rightUpArrow.hidden = false;
          rightDownArrow.hidden = false;
          leftUpArrow.hidden = false;
          leftDownArrow.hidden = false;
          gameText.style.visibility = "hidden";
          scoreText.classList.add('opacity-0');
          setTimeout(() => {
            scoreText.innerHTML = `${gameState.stateScoreL} : ${gameState.stateScoreR}`;

            scoreText.classList.remove('opacity-0');
          }, 150);
        default:
          const newState: State =JSON.parse(event.data);

          ball.setAttribute("cx", "" + newState.stateBall.coords.x);
          ball.setAttribute("cy", "" + newState.stateBall.coords.y);
          lpad.setAttribute("y", "" + newState.stateLP.y);
          rpad.setAttribute("y", "" + newState.stateRP.y);
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
            const playButton = document.getElementById('start-button');
            if (playerSide.v === "l") {
              switch (gameState.stateWhoL) {
                case "left":
                  gameText.innerHTML = `${t("lostRound")}`;
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#f87171");
                  break;
                case "right":
                  gameText.innerHTML = `${t("wonRound")}`;
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#4ade80");
                  break;
                case "left fully":
                  started = false;
                  gameText.innerHTML = `${t("lostgame")}`;
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#f87171");
                  setTimeout(() => triggerRainEffect(), 300);
                  await tourCheckAndSetIdlingButtons();
                  break;
                case "right fully":
                  started = false;
                  gameText.innerHTML = `${t("wongame")}`;
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#4ade80");
                  setTimeout(() => triggerConfetti(), 300);
                  await tourCheckAndSetIdlingButtons();
                  break;
                case "both":
                  started = false;
                  gameText.innerHTML = "In a rare dispay of absense, nobody won";
                  await tourCheckAndSetIdlingButtons();
                  break;
              }
            }
            else if (playerSide.v === "r") {
              switch (gameState.stateWhoL) {
                case "right":
                  gameText.innerHTML = `${t("lostRound")}`;
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#f87171");
                  break;
                case "left":
                  gameText.innerHTML = `${t("wonRound")}`;
                  gameText.classList.remove('fill-white');
                  gameText.setAttribute("fill", "#4ade80");
                  break;
                case "right fully":
                  started = false;
                  gameText.innerHTML = `${t("lostGame")}`;
                  gameText.setAttribute("fill", "#f87171");
                  setTimeout(() => triggerRainEffect(), 300);
                  await tourCheckAndSetIdlingButtons();
                  break;
                case "left fully":
                  started = false;
                  gameText.innerHTML = `${t("wonGame")}`;
                  gameText.setAttribute("fill", "#4ade80");
                  setTimeout(() => triggerConfetti(), 300);
                  await tourCheckAndSetIdlingButtons();
                  break;
                case "both":
                  started = false;
                  gameText.innerHTML = "In a rare dispay of absense, nobody won";
                  await tourCheckAndSetIdlingButtons();
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
    if (reconn) {
      const regPlRawResp = await registerPlayer();
      const regPlResp = await regPlRawResp.text();
      const regPlRespObj = JSON.parse(regPlResp);
      if (regPlRespObj.err !== "nil") {
        console.log(regPlRespObj);
      }
      metaInfo = await getGameMetaInfo();
      await setterUponMetaInfo(gameInfo, metaInfo);
    }

    document.getElementById('start-button')!.addEventListener('click', async () => {
      console.log("after clicking the start-button,");
      const regPlRawResp = await registerPlayer();
      const regPlResp = await regPlRawResp.text();
      const regPlRespObj = JSON.parse(regPlResp);
      if (regPlRespObj.err !== "nil") {
        console.error(regPlRespObj.err);
      }
      metaInfo = await getGameMetaInfo();
      if (metaInfo.gType === "unknown") {
        gameInfo.innerHTML = "";
      }
      else {
        gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
      }
      await setterUponMetaInfo(gameInfo, metaInfo);
    });
    document.getElementById('ready-button')!.addEventListener('click', async () => {
      console.log("after clicking the ready-button,");
      const readyPlRawResp = await confirmParticipation();
      const readyPlResp = await readyPlRawResp.text();
      const readyPlRespObj = JSON.parse(readyPlResp);
      if (readyPlRespObj.err !== "nil") {
        console.error(readyPlRespObj.err);
      }
      else {
        document.getElementById('ready-button').disabled = true;
        // I think it's okay to just do that here instead of the meta way
        // cuz it's a super simple interaction
      }
    });
    document.getElementById('giveup-button')!.addEventListener('click', async () => {
      console.log("after clicking the giveup-button,");
      const forfeitRawResp = await forfeit();
      const forfeitResp = await forfeitRawResp.text();
      const forfeitRespObj = JSON.parse(forfeitResp);
      if (forfeitRespObj.err !== "nil") {
        console.error(forfeitRespObj.err);
      }
      // after giving up we can have various scenarios so
      metaInfo = await getGameMetaInfo();
      if (metaInfo.gType === "unknown") {
        gameInfo.innerHTML = "";
      }
      else {
        gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
      }
      await setterUponMetaInfo(gameInfo, metaInfo);
    });
    document.getElementById('local-play-button')!.addEventListener('click', async () => {
      console.log("after clicking the local-play-button,");
      const localGamingRawResp = await localGaming();
      const localGamingResp = await localGamingRawResp.text();
      const localGamingRespObj = JSON.parse(localGamingResp);
      if (localGamingRespObj.err !== "nil") {
        console.error(localGamingRespObj.err);
      }
      metaInfo = await getGameMetaInfo();
      if (metaInfo.gType === "local") {
        gameInfo.innerHTML = "Game type: " + metaInfo.gType;
      }
      else {
        gameInfo.innerHTML = "Something weird has happened trying to do a local game.";
      }
      await setterUponMetaInfo(gameInfo, metaInfo);
    });

    console.log("playerside:", playerSide.v);
    generalDirectionButtonHandler(leftUpArrow, -2, "l", playerSide);
    generalDirectionButtonHandler(leftDownArrow, 2, "l", playerSide);
    generalDirectionButtonHandler(rightUpArrow, -2, "r", playerSide);
    generalDirectionButtonHandler(rightDownArrow, 2, "r", playerSide);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w'|| e.key === 'W') {
        movePaddleWrapper(-2); // move up
      } else if (e.key === 'ArrowDown' || e.key === 's'|| e.key === 'S') {
        movePaddleWrapper(2); // move down
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
        movePaddleWrapper(0); // stop moving
      }
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
    localStorage.removeItem('authProvider');
    socket.close();
    resetGoogle();
    window.location.hash = 'login';
   // if (googleInitialized) resetGoogle();
   window.location.reload();  
   //route();
  });

  // Render active section
  const hideableElements = {
    contentArea: document.getElementById('content-area')!,
    buttonArea: document.getElementById('button-area')!,
    gameArea: document.getElementById('game-area')!,
    gameWindow: document.getElementById('game-window')!,
    gameInfo: document.getElementById('game-info')!,
  };
  switch (hash) {
    case 'profile':           renderProfileContent(hideableElements);           break;
    case 'play':              renderPlayContent(hideableElements);              break;
    case 'history':           renderHistoryContent(hideableElements);           break;
    case 'tournament':        renderTournamentContent(hideableElements);        break;
    case 'tournamentmanager': renderTournamentManagerContent(hideableElements); break;
    case 'stats':             renderStatsContent(hideableElements);             break;
    default:                  renderHomeContent(hideableElements);
  }
}

// Initialize dashboard only once when starting the app
initDashboard();

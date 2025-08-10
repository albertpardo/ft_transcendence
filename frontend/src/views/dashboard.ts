// src/views/dashboard.ts
import { registerPlayer, forefit, movePaddle, confirmParticipation, checkIsInGame, checkReady, checkIsInTournament } from './buttonClicking';
import { route } from '../router';
import { renderHomeContent, renderPlayContent, renderStatsContent } from './sections';
import { renderHistoryContent, getNicknameForPlayerId } from './history';
import { renderProfileContent } from './profile';
import { renderTournamentContent, renderTournamentManagerContent, getCompleteTournamentInfo } from './tournament';
import { State, nullState } from './pongrender';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

enum MetaGameState {
  nothing,
  waitmmopp,
  waitmmstart,
  inmmgame,
  waittouropp,
  waittourstart,
  waittourrdy,
  waittouropprdy,
  intourgame,
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

async function getGameMetaInfo() {
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

async function buttonSetter(state : MetaGameState) {
  switch (state) {
    case MetaGameState.nothing: {
      // 1
      document.getElementById("start-button").disabled = false;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = true;
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
      break;
    }
    case MetaGameState.waittourrdy: {
      // 7
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = false;
      document.getElementById("giveup-button").disabled = true;
      break;
    }
    case MetaGameState.waittouropprdy: {
      // 8
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = true;
      break;
    }
    case MetaGameState.intourgame: {
      // 9
      document.getElementById("start-button").disabled = true;
      document.getElementById("ready-button").disabled = true;
      document.getElementById("giveup-button").disabled = false;
      break;
    }
    default: {
      // 9
      //basically "misc"
      //idk if that's a good idea
      document.getElementById("start-button").disabled = false;
      document.getElementById("ready-button").disabled = false;
      document.getElementById("giveup-button").disabled = false;
      break;
    }
  }
}

async function setterUponMetaInfo(gameInfo : HTMLElement, metaInfo : {gType: string, oppName: string}) {
  console.log("ENTERED setterUponMetaInfo");
  console.log("metainfo is:", metaInfo);
  if (metaInfo.gType === "none") {
    gameInfo.innerHTML = "";
    let isintour : bool = await checkIsInTourWrapper();
    console.log("isintour:", isintour);
    if (isintour) {
      // no game, but we're in a tournament
      buttonSetter(MetaGameState.waittourstart);
    }
    else {
      // no game. allow mm search
      buttonSetter(MetaGameState.nothing);
    }
  }
  else if (metaInfo.gType === "unknown") {
    // some bs happened. must investigate
    console.error("unknown game type");
    buttonSetter(MetaGameState.misc);
  }
  else if (metaInfo.gType === "normal") {
    // we don't check for anything since basically once you get into a game with whatever state it's got, you
    // can only forefit/escape, unlike the tournament stuff which has some various conditions for getting ready/forefitting.
    buttonSetter(MetaGameState.inmmgame);
    console.log("ginfo setter 1");
    gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
  }
  else {
    // ok, it's a tournament
    // there's only ONE situation which requires us to press the ready key.
    // we're in a game of type tournament and we're not ready.
    //
    // if it's a game and we're ready, just give the forefit button ? TODO to think
    const isready : bool = await checkReadyWrapper();
    if (!isready) {
      buttonSetter(MetaGameState.waittourrdy);
    }
    else {
      buttonSetter(MetaGameState.misc);
    }
    console.log("ginfo setter 2");
    gameInfo.innerHTML = "Game type: " + metaInfo.gType + "; versus: " + metaInfo.oppName;
  }
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
        <a href="#history" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='play'?'bg-blue-600':'bg-gray-700'}">Match History</a>
        <a href="#tournament" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='tournament'?'bg-blue-600':'bg-gray-700'}">Tournament</a>
        <a href="#tournamentmanager" class="nav-link block p-3 md:p-4 rounded-lg text-center font-medium hover:bg-blue-500 transition text-white ${hash==='tournamentmanager'?'bg-blue-600':'bg-gray-700'}">Tournament Management</a>
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
      <div id="button-area" class="flex flex-col space-y-1">
        <button id="start-button" disabled
        class=
        "
          mt-6 p-3 bg-green-600 rounded-lg hover:bg-green-700 transition text-white font-medium
          disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        ">
          Click to join or reconnect
        </button>
        <button id="ready-button" disabled
        class=
        "
          mt-6 p-3 bg-green-600 rounded-lg hover:bg-green-700 transition text-white font-medium
          disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        ">
          Click to set yourself ready
        </button>
        <button id="giveup-button" disabled
        class=
        "
          mt-6 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium
          disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        ">
          INSTANTLY forefit
        </button>
      </div>
      <p id="game-info"></p>
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
  const gameInfo : HTMLElement = document.getElementById("game-info");
  gameText.style.visibility = "hidden";
  // for some reason, doing a .hidden = false or true on this doesn't work.
  const scoreText : HTMLElement = document.getElementById("score-text");
  let gameType = "normal";
//  console.log(ball);
//  console.log(lpad);
//  console.log(rpad);
  //WEBSOCKET TIME!
  let socket : WebSocket;
  let gameState : State = nullState;
  let playerSide : string = "tbd";
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
    socket = new WebSocket(`https://127.0.0.1:8443/api/pong/game-ws?uuid=${localStorage.getItem("userId")}&authorization=${localStorage.getItem("authToken")}`);
    socket.addEventListener("message", async (event) => {
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
          break;
        case "abandon":
          started = false;
          playerSide = "tbd";
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
          playerSide = "l";
          leftUpArrow.hidden = false;
          leftDownArrow.hidden = false;
          rightUpArrow.hidden = true;
          rightDownArrow.hidden = true;
          gameText.style.visibility = "hidden";
          scoreText.innerHTML = "" + 0 + " : " + 0;
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
//          console.log("some error returned from the server");
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
                  buttonSetter(MetaGameState.misc);
                  break;
                case "right fully":
                  started = false;
                  gameText.innerHTML = "You won the game!";
                  buttonSetter(MetaGameState.misc);
                  break;
                case "both":
                  started = false;
                  gameText.innerHTML = "In a rare dispay of absense, nobody won";
                  buttonSetter(MetaGameState.misc);
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
                  buttonSetter(MetaGameState.misc);
                  break;
                case "left fully":
                  started = false;
                  gameText.innerHTML = "You won the game!";
                  buttonSetter(MetaGameState.misc);
                  break;
                case "both":
                  started = false;
                  gameText.innerHTML = "In a rare dispay of absense, nobody won";
                  buttonSetter(MetaGameState.misc);
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
      const forefitRawResp = await forefit();
      const forefitResp = await forefitRawResp.text();
      const forefitRespObj = JSON.parse(forefitResp);
      if (forefitRespObj.err !== "nil") {
        console.error(forefitRespObj.err);
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
  const hideableElements = {
    contentArea: document.getElementById('content-area')!,
    buttonArea: document.getElementById('button-area')!,
    gameArea: document.getElementById('game-area')!,
    gameWindow: document.getElementById('game-window')!,
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

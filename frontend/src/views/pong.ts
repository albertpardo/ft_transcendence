// src/views/pongrender.ts
import { registerPlayer, forefit, movePaddle } from './buttonClicking';

// XXX this is a copypaste from backend for visualization.

interface  Vector2 {
  x: number;
  y: number;
};

interface  Paddle {
  y: number;
  h: number;
  d: number;
};
// d >=  1:     up;
// d <= -1:     down;
// d e (-1, 1): stationary
// since js has no integer type (yes), we'll input values like -2 and 2 to be sure

interface  Ball {
  speed: Vector2;
  coords: Vector2;
};

interface  State {
  stateMsg: string;
  stateBall: Ball;
  stateLP: Paddle;
  stateRP: Paddle;
  stateWhoL: string;
  stateScoreL: number;
  stateScoreR: number;
}

const nullVec2 : Vector2 = {x: 0, y: 0};
const nullBall : Ball = {speed: nullVec2, coords: nullVec2};
const nullPaddle : Paddle = {y: 0, h: 0, d: 0};
const nullState : State = {
  stateMsg: "null",
  stateBall: nullBall,
  stateLP: nullPaddle,
  stateRP: nullPaddle,
  stateWhoL: "null state",
  stateScoreL: 0,
  stateScoreR: 0,
};

// time for some actual code.

export async function renderPlayContent(hideableElements) {
  hideableElements.contentArea.innerHTML = `
  `;
  hideableElements.gameArea.setAttribute("class", "flex flex-col items-center justify-center");
  hideableElements.gameArea.innerHTML = `
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
      <button id="start-button" class="mt-6 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium">Click to join, reconnect or set yourself ready</button>
      <button id="giveup-button" class="mt-6 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium">FOREFIT (INSTANT)</button>
      <div id="game-info"></div>
  `;
  await pongRender();
}

async function pongRender() {
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
    socket = new WebSocket(`https://127.0.0.1:8443/api/pong/game-ws?uuid=${localStorage.getItem("userId")}&authorization=${localStorage.getItem("authToken")}`);
    socket.addEventListener("message", (event) => {
//      console.log("I, a tokened player, receive:", event.data);
      // XXX maybe a try catch? idk if it'd crash or something on a wrong input
      switch (event.data) {
        case "connected":
          console.log("Welcome to pong.");
          break;
        case "connected T":
          console.log("Welcome to pong T.");
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

    document.getElementById('start-button')!.addEventListener('click', () => {
      console.log("after clicking the start-button,");
      registerPlayer(function (error, response) {
        if (error) {
          console.error(error);
        }
        else {
          response?.text().then((result) => {
            console.log(result);
          });
        }
      });
    });
    document.getElementById('giveup-button')!.addEventListener('click', () => {
      console.log("after clicking the giveup-button,");
      forefit(function (error, response) {
        if (error) {
          console.error(error);
        }
        else {
          response?.text().then((result) => {
            console.log(result);
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
}

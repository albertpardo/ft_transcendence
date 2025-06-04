// src/views/pongrender.ts

// XXX this is a copypaste from backend for visualization.

export interface  Vector2 {
  x: number;
  y: number;
};

export interface  Paddle {
  y: number;
  h: number;
  d: number;
};
// d >=  1:     up;
// d <= -1:     down;
// d e (-1, 1): stationary
// since js has no integer type (yes), we'll input values like -2 and 2 to be sure

export interface  Ball {
  speed: Vector2;
  coords: Vector2;
};

export interface  State {
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
export const nullState : State = {
  stateMsg: "null",
  stateBall: nullBall,
  stateLP: nullPaddle,
  stateRP: nullPaddle,
  stateWhoL: "null state",
  stateScoreL: 0,
  stateScoreR: 0,
};

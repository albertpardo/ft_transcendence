const  ALPHA_MAX : number = 5*Math.PI/11;
const  sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const  FRAME_TIME : number = 1/30;
const  FRAME_TIME_MS : number = 1000 * FRAME_TIME;
const  WINDOW_SIZE : Vector2 = {x: 1600, y: 900};
const  PADDLE_H : number = 100;
const  PADDLE_SPEED : number = 100;
const  MIN_BALL_SPEED_Y : number = 100;


export enum PongResponses {
  StartedRunning,
  AlreadyRunning,
  NotRunning,
  StoppedRunning,
  AddedInMap,
  AlreadyInMap,
  NotInMap,
  PMoveOK,
  NoPlayer,
  PlayerRegistered,
  PlayerAlreadyIn,
  AlreadyFull,
  MissingPlayers,
  YoureWaiting,
  YoureWrong,
}
// lol

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

export interface  State {
  stateBall: Ball;
  stateLP: Paddle;
  stateRP: Paddle;
  stateWhoL: string;
}



function makeid(length : number) : string {
   let result : string= '';
   const characters : string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const charactersLength : number = characters.length;
   let counter : number = 0;
   while (counter < length) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
     counter += 1;
   }
   return result;
}

function  checkLoseConditions(ball: Ball) : string {
  if (ball.coords.x < 0) {
    return "left";
  }
  else if (ball.coords.x > WINDOW_SIZE.x) {
    return "right";
  }
  return "none";
}

function  calculateVBounce(ball: Ball, paddle: Paddle) : Vector2 {
  let  proportion : number = (ball.coords.y - paddle.y) / (paddle.h);
  proportion *= 2;
  proportion -= 1;
  if (Math.abs(ball.speed.y) < 0.001) {
    ball.speed.y = MIN_BALL_SPEED_Y;
  }
  return { x: -ball.speed.x, y: Math.sin(ALPHA_MAX * proportion) * Math.abs(ball.speed.y)};
};



class  PongRuntime {
  public LplayerId : string = "";
  public RplayerId : string = "";
  private ball : Ball = { speed: {x: -50, y: 0}, coords: {x: WINDOW_SIZE.x/2, y: WINDOW_SIZE.y/2}};
  private Lpaddle : Paddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, d: 0 };
  private Rpaddle : Paddle = { y: 430, h: PADDLE_H, d: 0 };
  private whoLost : string = "none";

  public LpadMove(d: number) : void {
    this.Lpaddle.d = d;
  }
  public RpadMove(d: number) : void {
    this.Rpaddle.d = d;
  }

  public gstate : State = { stateBall: this.ball, stateLP: this.Lpaddle, stateRP: this.Rpaddle, stateWhoL: this.whoLost };
  public pongStarted : boolean = false;
  public pongDone : boolean = false;

  private updatePositions() : void {
    // ball bounces/fly-outs collision only check
    if (this.ball.speed.x < 0) {
      if (this.ball.speed.x * FRAME_TIME + this.ball.coords.x < 0) {
//        console.log("left exit imminent! paddle: ", this.Lpaddle);
        // we will be exiting the screen if so
        if ((this.ball.coords.y - this.Lpaddle.y >= 0) && (this.ball.coords.y - this.Lpaddle.y <= this.Lpaddle.h)) {
          // bounce off the left pad, to NOT exit the screen then :)
          this.ball.speed = calculateVBounce(this.ball, this.Lpaddle);
        }
        else {
          // missed the pad.
          // TODO some sort of "goal signal"? or do we control that outside?
          // if we control that outside, then just move thru like normal.
        }
      }
    }
    else if (this.ball.speed.x > 0) {
      if (this.ball.speed.x * FRAME_TIME + this.ball.coords.x > WINDOW_SIZE.x) {
        if ((this.ball.coords.y - this.Rpaddle.y >= 0) && (this.ball.coords.y - this.Rpaddle.y <= this.Rpaddle.h)) {
          // bounce off the right pad
          this.ball.speed = calculateVBounce(this.ball, this.Rpaddle);
        }
      }
    }
    if (this.ball.speed.y < 0) {
      if (this.ball.speed.y * FRAME_TIME + this.ball.coords.y < 0) {
        this.ball.speed.y *= -1;
      }
    }
    else if (this.ball.speed.y > 0) {
      if (this.ball.speed.y * FRAME_TIME + this.ball.coords.y > WINDOW_SIZE.y) {
        this.ball.speed.y *= -1;
      }
    }
    this.ball.coords.x += this.ball.speed.x * FRAME_TIME;
    this.ball.coords.y += this.ball.speed.y * FRAME_TIME;

    if (this.Lpaddle.d >= 1) {
      this.Lpaddle.y += FRAME_TIME * PADDLE_SPEED;
    } else if (this.Lpaddle.d <= -1) {
      this.Lpaddle.y -= FRAME_TIME * PADDLE_SPEED;
    }
    if (this.Rpaddle.d >= 1) {
      this.Rpaddle.y += FRAME_TIME * PADDLE_SPEED;
    } else if (this.Rpaddle.d <= -1) {
      this.Rpaddle.y -= FRAME_TIME * PADDLE_SPEED;
    }
    // clamp the paddles
    if (this.Lpaddle.y < 0) {
      this.Lpaddle.y = 0;
    }
    if (this.Rpaddle.y < 0) {
      this.Rpaddle.y = 0;
    }
    if (this.Lpaddle.y + this.Lpaddle.h > WINDOW_SIZE.y) {
      this.Lpaddle.y = WINDOW_SIZE.y - this.Lpaddle.h;
    }
    if (this.Rpaddle.y + this.Rpaddle.h > WINDOW_SIZE.y) {
      this.Rpaddle.y = WINDOW_SIZE.y - this.Rpaddle.h;
    }
  };

  public mainLoop = async () => {
    this.pongStarted = true;
    while (true) {
      this.whoLost = checkLoseConditions(this.ball);
      if (this.whoLost !== "none") {
        this.pongDone = true;
        this.gstate = { stateBall: this.ball, stateLP: this.Lpaddle, stateRP: this.Rpaddle, stateWhoL: this.whoLost };
        return ("ball lost by... " + this.whoLost);
        // in real world, this here would restart the game instead of just breaking.
      }
      this.updatePositions();
//      console.log("ball speed: ", this.ball.speed);
//      console.log("ball coords:", this.ball.coords);
      this.gstate = { stateBall: this.ball, stateLP: this.Lpaddle, stateRP: this.Rpaddle, stateWhoL: this.whoLost };
      await sleep(FRAME_TIME_MS);
    };
  };
};

const gamesMap = new Map();
const playersMap = new Map();
const socksMap = new Map();
const needToSendStartedMap = new Map();
const nullVec2 : Vector2 = {x: 0, y: 0};
const nullBall : Ball = {speed: nullVec2, coords: nullVec2};
const nullPaddle : Paddle = {y: 0, h: 0, d: 0};
const nullState : State = {stateBall: nullBall, stateLP: nullPaddle, stateRP: nullPaddle, stateWhoL: "null state"};

// will always return "you're in queue, awaiting for a game", even if there's enough players in a game already, including you.
// this way, we'll always have to wait for a confirmation signal from the game runtime itself that the game is ready to start.
//
export function addPlayerCompletely(playerId: string, sock: WebSocket) : PongResponses {
  if (playersMap.has(playerId)) {
    return PongResponses.PlayerAlreadyIn;
  }
  socksMap.set(playerId, sock);
  needToSendStartedMap.set(playerId, true);
  for (const [gameId, gameRuntime] of gamesMap) {
    if (gameRuntime.LplayerId === "") {
      gameRuntime.LplayerId = playerId;
      playersMap.set(playerId, gameId);
      sock.send("added: L");
      return PongResponses.YoureWaiting;
    }
    else if (gameRuntime.RplayerId === "") {
      gameRuntime.RplayerId = playerId;
      playersMap.set(playerId, gameId);
      sock.send("added: R");
      return PongResponses.YoureWaiting;
    }
  }
  // no game available!
  const newid : string = makeid(32);
  gamesMap.set(newid, new PongRuntime);
  gamesMap.get(newid).LplayerId = playerId;
  sock.send("added: L");
  return PongResponses.YoureWaiting;
}

export function  getPongDoneness(gameId: string) : PongResponses {
  if (gamesMap.has(gameId)) {
    if (gamesMap.get(gameId).pongStarted && !(gamesMap.get(gameId).pongDone)) {
      return PongResponses.AlreadyRunning;
    }
    if (gamesMap.get(gameId).pongDone) {
      return PongResponses.StoppedRunning;
    }
    return PongResponses.NotRunning;
  }
  console.error("no game found registered at " + gameId);
  return PongResponses.NotInMap;
}

export function  getPongState(gameId: string) : State {
  if (gamesMap.has(gameId)) {
    return (gamesMap.get(gameId).gstate);
  }
  console.error("no game found registered at " + gameId);
  return nullState;
}

export function moveMyPaddle(playerId: string, d: number) : PongResponses {
  if (playersMap.has(playerId)) {
    const gameId = playersMap.get(playerId);
    if (gamesMap.has(gameId)) {
      if (gamesMap.get(gameId).LplayerId === playerId) {
        gamesMap.get(gameId).LpadMove(d);
      } else {
        gamesMap.get(gameId).RpadMove(d);
        // a very fun exploit would be moving the right player's paddle with an invalid player id;
        // however I think the logic prevents us from getting into this fork if we have an invalid
        // id in the first place.
      }
      return PongResponses.PMoveOK;
    }
    return PongResponses.NotInMap;
  }
  return PongResponses.NoPlayer;
}

export const gamesReadyLoopCheck = async () => {
  while (true) {
    for (const [gameId, gameRuntime] of gamesMap) {
      if (gameRuntime.LplayerId !== "" && gameRuntime.RplayerId !== "")  {
        if (gameRuntime.pongStarted !== true
            && needToSendStartedMap.get(gameRuntime.LplayerId) === true
            && needToSendStartedMap.get(gameRuntime.RplayerId) === true) {
          gameRuntime.mainLoop();
          console.log("one game started: " + gameId + ", with left: " + gameRuntime.LplayerId + " and right: " + gameRuntime.RplayerId);
          console.log("sending the appropriate message to both clientis via ws");
          // XXX maybe do a json string here with the gamestate or something.
          socksMap.get(gameRuntime.LplayerId).send("started");
          socksMap.get(gameRuntime.RplayerId).send("started");
          needToSendStartedMap.set(gameRuntime.LplayerId, false);
          needToSendStartedMap.set(gameRuntime.RplayerId, false);
          await sleep(300);
          dataStreamer(gameRuntime.LplayerId);
          dataStreamer(gameRuntime.RplayerId);
        }
      }
    }
    await sleep(5e3);
    console.log("one gamesreadyloop iteration passed");
  }
}

export const dataStreamer = async (playerId) => {
  const sock : WebSocket = socksMap.get(playerId);
  const runtime : PongRuntime = gamesMap.get(playersMap.get(playerId));
  while (true) {
    sock.send(JSON.stringify(runtime.gstate));
    console.log(runtime.gstate);
    await sleep(FRAME_TIME_MS);
  }
}

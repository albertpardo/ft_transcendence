import { addMatch, getAll } from './history';
import { playersParticipatingTourn, tournamentMap } from './tournament';

const ALPHA_MAX : number = 5*Math.PI/11;
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const FRAME_TIME : number = 1/30;
const FRAME_TIME_MS : number = 1000 * FRAME_TIME;
const WINDOW_SIZE : Vector2 = {x: 1280, y: 720};
const PADDLE_H : number = 100;
const PADDLE_X : number = 50;
// a shift for the paddles. makes them be not at the very border
const PADDLE_SPEED : number = 300;
const MIN_BALL_SPEED_Y : number = 100;
const INTER_ROUND_COOLDOWN_TIME_MS : number = 1000 * 3;
const TOURNAMENT_READY_TIMEOUT : number = 10;

export class JoinError extends Error {
  public gType: string;
  public err: string;

  constructor({gType, err,}: {gType: string, err: string,}) {
    super();
    this.gType = gType;
    this.err = err;
  }
}

export interface Vector2 {
  x: number;
  y: number;
};

export interface Paddle {
  y: number;
  h: number;
  d: number;
};
// d >=  1:     up;
// d <= -1:     down;
// d e (-1, 1): stationary
// since js has no integer type (yes), we'll input values like -2 and 2 to be sure

export interface Ball {
  speed: Vector2;
  coords: Vector2;
};

export interface State {
  stateMsg: string;
  stateBall: Ball;
  stateLP: Paddle;
  stateRP: Paddle;
  stateWhoL: string;
  stateScoreL: number;
  stateScoreR: number;
}



export function makeid(length : number) : string {
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

function checkLoseConditions(ball: Ball, LGaveUp: boolean, RGaveUp: boolean) : string {
  if (ball.coords.x < 0 || LGaveUp) {
    return "left";
  }
  else if (ball.coords.x > WINDOW_SIZE.x || RGaveUp) {
    return "right";
  }
  return "none";
}

function calculateVBounce(ball: Ball, paddle: Paddle) : Vector2 {
  let  proportion : number = (ball.coords.y - paddle.y) / (paddle.h);
  proportion *= 2;
  proportion -= 1;
  if (Math.abs(ball.speed.y) < MIN_BALL_SPEED_Y/10) {
    ball.speed.y = MIN_BALL_SPEED_Y;
  }
  return { x: -ball.speed.x, y: Math.sin(ALPHA_MAX * proportion) * Math.abs(ball.speed.y)};
};



class PongRuntime {
  public LplayerId : string = "";
  public RplayerId : string = "";
  private ball : Ball = { speed: {x: -200, y: 0}, coords: {x: WINDOW_SIZE.x/2, y: WINDOW_SIZE.y/2}};
  private Lpaddle : Paddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, d: 0 };
  private Rpaddle : Paddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, d: 0 };
  public whoLost : string = "none";
  private scoreL : number = 0;
  private scoreR : number = 0;
  private LGaveUp : boolean = false;
  private RGaveUp : boolean = false;
  public gameType : string = "normal";
  public leftReady : boolean = false;
  public rightReady : boolean = false;

  private resetGame() : void {
    if (this.whoLost === "right") {
      this.ball = { speed: {x: 200, y: 0}, coords: {x: WINDOW_SIZE.x/2, y: WINDOW_SIZE.y/2}};
    }
    else {
      this.ball = { speed: {x: -200, y: 0}, coords: {x: WINDOW_SIZE.x/2, y: WINDOW_SIZE.y/2}};
    }
    this.Lpaddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, d: 0 };
    this.Rpaddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, d: 0 };
    this.whoLost = "none";
  }

  public forefit(playerId: string) : void {
    if (playerId === this.LplayerId) {
      this.LGaveUp = true;
    }
    else {
      this.RGaveUp = true;
    }
  }

  public LpadMove(d: number) : void {
    this.Lpaddle.d = d;
  }
  public RpadMove(d: number) : void {
    this.Rpaddle.d = d;
  }

  public gstate : State = {
    stateMsg: "default",
    stateBall: this.ball,
    stateLP: this.Lpaddle,
    stateRP: this.Rpaddle,
    stateWhoL: this.whoLost,
    stateScoreL: this.scoreL,
    stateScoreR: this.scoreR,
  };
  public pongStarted : boolean = false;
  public pongDone : boolean = false;

  private updatePositions() : void {
    if (this.ball.speed.x < 0) {
      if (this.ball.speed.x * FRAME_TIME + this.ball.coords.x < PADDLE_X) {
//        console.log("left paddle imminent! : ", this.Lpaddle);
        if ((this.ball.coords.y - this.Lpaddle.y >= 0) && (this.ball.coords.y - this.Lpaddle.y <= this.Lpaddle.h)) {
          // bounce off the left pad
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
      if (this.ball.speed.x * FRAME_TIME + this.ball.coords.x > WINDOW_SIZE.x - PADDLE_X) {
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
    }
    else if (this.Lpaddle.d <= -1) {
      this.Lpaddle.y -= FRAME_TIME * PADDLE_SPEED;
    }
    if (this.Rpaddle.d >= 1) {
      this.Rpaddle.y += FRAME_TIME * PADDLE_SPEED;
    }
    else if (this.Rpaddle.d <= -1) {
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
    if (this.LplayerId === "failed" && this.RplayerId === "failed") {
      this.whoLost = "both";
      this.pongStarted = true;
      this.pongDone = true;
      console.log("both fail");
      return ;
    }
    if (this.LplayerId === "failed") {
      this.whoLost = "left skip";
      addMatch(playersMap.get(this.RplayerId), this.LplayerId, this.RplayerId, this.scoreL, this.scoreR, "R", this.gameType, "absence");
      this.pongStarted = true;
      this.pongDone = true;
      console.log("left fail");
      return ;
    }
    if (this.RplayerId === "failed") {
      this.whoLost = "right skip";
      addMatch(playersMap.get(this.LplayerId), this.LplayerId, this.RplayerId, this.scoreL, this.scoreR, "L", this.gameType, "absence");
      this.pongStarted = true;
      this.pongDone = true;
      console.log("right fail");
      return ;
    }
    if (this.gameType === "tournament") {
      const startDate = Date.now();
      console.log("tournament! st date:", startDate);
      while ((Date.now() - startDate)/1000 < TOURNAMENT_READY_TIMEOUT) {
        if (this.leftReady && this.rightReady) {
          break ;
        }
        console.log("time passed:", (Date.now() - startDate)/1000);
        await sleep(1e3);
      }
      if (this.leftReady && !this.rightReady) {
        this.whoLost = "right fully";
        addMatch(playersMap.get(this.LplayerId), this.LplayerId, this.RplayerId, this.scoreL, this.scoreR, "L", this.gameType, "technical");
        this.pongStarted = true;
        this.pongDone = true;
        return ;
      }
      else if (!this.leftReady && this.rightReady) {
        this.whoLost = "left fully";
        addMatch(playersMap.get(this.LplayerId), this.LplayerId, this.RplayerId, this.scoreL, this.scoreR, "R", this.gameType, "technical");
        this.pongStarted = true;
        this.pongDone = true;
        return ;
      }
      else if (!this.leftReady && !this.rightReady) {
        this.whoLost = "both";
        this.pongStarted = true;
        this.pongDone = true;
        return ;
      }
    }
    else {
      console.log("everything seems normal.");
    }

    // now that the tournament-specific fail condition check is done, begin the cycle.
    this.pongStarted = true;
    while (true) {
      this.whoLost = checkLoseConditions(this.ball, this.LGaveUp, this.RGaveUp);
      if (this.whoLost !== "none") {
        if (this.whoLost === "left") {
          this.scoreR += 1;
        }
        else {
          this.scoreL += 1;
        }
        this.gstate = {
          stateMsg: "default",
          stateBall: this.ball,
          stateLP: this.Lpaddle,
          stateRP: this.Rpaddle,
          stateWhoL: this.whoLost,
          stateScoreL: this.scoreL,
          stateScoreR: this.scoreR,
        };
//        console.log("ball lost by...", this.whoLost);
        await sleep(INTER_ROUND_COOLDOWN_TIME_MS);
        // TODO custom score for tournament?
        if (this.scoreL > 2 || this.scoreR > 2 || this.LGaveUp || this.RGaveUp) {
          this.pongDone = true;
//          console.log("game done.");
          if (this.whoLost === "left") {
            this.gstate.stateWhoL = "left fully";
          }
          else {
            this.gstate.stateWhoL = "right fully";
          }
          if (this.LGaveUp) {
            addMatch(playersMap.get(this.LplayerId), this.LplayerId, this.RplayerId, this.scoreL, this.scoreR, "R", this.gameType, "forefit");
          }
          else if (this.RGaveUp) {
            addMatch(playersMap.get(this.LplayerId), this.LplayerId, this.RplayerId, this.scoreL, this.scoreR, "L", this.gameType, "forefit");
          }
          else {
            addMatch(playersMap.get(this.LplayerId), this.LplayerId, this.RplayerId, this.scoreL, this.scoreR, (this.whoLost === "left" ? "R" : "L"), this.gameType, "normal");
          }
//          this.gstate = nullState;
//          this.gstate.stateScoreL = this.scoreL;
//          this.gstate.stateScoreR = this.scoreR;
          return ;
        }
        this.resetGame();
      }
      this.updatePositions();
      this.gstate = {
        stateMsg: "default",
        stateBall: this.ball,
        stateLP: this.Lpaddle,
        stateRP: this.Rpaddle,
        stateWhoL: this.whoLost,
        stateScoreL: this.scoreL,
        stateScoreR: this.scoreR
      };
      await sleep(FRAME_TIME_MS);
    };
  };
};

export const gamesMap = new Map();
export const playersMap = new Map();
export const socksMap = new Map();
const needToSendStartedMap = new Map();
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
  stateScoreR: 0
};

// will always return "you're in queue, awaiting for a game", even if there's enough players in a game already, including you.
// this way, we'll always have to wait for a confirmation signal from the game runtime itself that the game is ready to start.
//
export function addPlayerCompletely(playerId: string, sock: WebSocket) {
  if (playersMap.has(playerId)) {
//    console.log("oh no! player id", playerId, "already in!");
    if (socksMap.has(playerId) === false) {
      socksMap.set(playerId, sock);
//      console.log("...however, they were most likely disconnected. re-connected now!");
      if (!gamesMap.has(playersMap.get(playerId))) {
        throw "no game found for a located gameid";
      }
      const currentRT : PongRuntime = gamesMap.get(playersMap.get(playerId));
      if (playerId === currentRT.LplayerId) {
        sock.send("added: L");
      }
      else {
        sock.send("added: R");
      }
    }
    if (!gamesMap.has(playersMap.get(playerId))) {
      throw "no game found for a located gameid";
    }
    console.log("so the player was in already");
    const gType = gamesMap.get(playersMap.get(playerId)).gameType;
    throw new JoinError({
      gType: gType,
      err: "Player already in",
    });
  }
  if (socksMap.has(playerId) === false) {
    socksMap.set(playerId, sock);
  }
  needToSendStartedMap.set(playerId, true);
  if (!playersParticipatingTourn.has(playerId)) {
    // default, random MM
    for (const [gameId, gameRuntime] of gamesMap) {
      if (gameRuntime.gameType === "tournament") {
        continue ;
      }
      if (gameRuntime.LplayerId === "") {
        gameRuntime.LplayerId = playerId;
        playersMap.set(playerId, gameId);
        sock.send("added: L");
        if (socksMap.has(gameRuntime.RplayerId)) {
          socksMap.get(gameRuntime.RplayerId).send("opp joined");
        }
        return gameRuntime.gameType;
      }
      else if (gameRuntime.RplayerId === "") {
        gameRuntime.RplayerId = playerId;
        playersMap.set(playerId, gameId);
        sock.send("added: R");
        if (socksMap.has(gameRuntime.LplayerId)) {
          socksMap.get(gameRuntime.LplayerId).send("opp joined");
        }
        return gameRuntime.gameType;
      }
    }
    // no free game available!
    const newid : string = makeid(32);
    gamesMap.set(newid, new PongRuntime);
    gamesMap.get(newid).LplayerId = playerId;
    playersMap.set(playerId, newid);
    sock.send("added: L");
    return gamesMap.get(newid).gameType;
  }
  else {
    throw "Can't join/create normal game for this player since they're a tournament member"
  }
}

export function createTournamentGame(lId: string, rId: string) {
  console.log("starting to create with", lId, "and", rId);
  if (playersMap.has(lId)) {
    throw "L Player already in " + playersMap.get(lId);
  }
  if (playersMap.has(rId)) {
    throw "R Player already in " + playersMap.get(rId);
  }
  const newid : string = makeid(32);
  const prt = new PongRuntime;
  gamesMap.set(newid, prt);
  gamesMap.get(newid).LplayerId = lId;
  gamesMap.get(newid).RplayerId = rId;
  gamesMap.get(newid).gameType = "tournament";
  playersMap.set(lId, newid);
  playersMap.set(rId, newid);
  if (socksMap.has(lId)) {
    socksMap.get(lId).send("added: L");
  }
  else {
    console.error("left disconnected before the tournament game could even be creaeted. whatever. they can reconnect");
  }
  if (socksMap.has(rId)) {
    socksMap.get(rId).send("added: R");
  }
  else {
    console.error("right disconnected before the tournament game could even be creaeted. whatever. they can reconnect");
  }
  needToSendStartedMap.set(lId, true);
  needToSendStartedMap.set(rId, true);
  console.log("the prt object in question", gamesMap.get(newid));
  return (newid);
}

export function removeTheSock(sock: WebSocket) : void {
  for (const [p, s] of socksMap) {
    if (s === sock) {
      // XXX close?
      socksMap.delete(p);
//      console.log("player", p, "got their sock removed");
      return ;
    }
  }
//  console.log("removing sock failed for some reason");
  return ;
}

export function getPongState(gameId: string) : State {
  if (gamesMap.has(gameId)) {
    return (gamesMap.get(gameId).gstate);
  }
//  console.error("no game found registered at " + gameId);
  return nullState;
}

function sendOnAbandon(lp: string, rp: string) {
  if (socksMap.has(lp)) {
    socksMap.get(lp).send("abandon");
  }
  if (socksMap.has(rp)) {
    socksMap.get(rp).send("abandon");
  }
}

export function forefit(playerId: string) {
  if (playersMap.has(playerId)) {
    const gameId = playersMap.get(playerId);
    if (gamesMap.has(gameId)) {
      if (gamesMap.get(gameId).pongStarted === false) {
        const lpid = gamesMap.get(gameId).LplayerId;
        const rpid = gamesMap.get(gameId).RplayerId;
        sendOnAbandon(lpid, rpid);
        playersMap.delete(lpid);
        playersMap.delete(rpid);
        gamesMap.delete(gameId);
        console.log("double deleted the players", lpid, rpid, "and the gid", gameId, "cuz abandon");
        return ;
      }
      gamesMap.get(gameId).forefit(playerId);
      return ;
    }
    return ;
  }
}

export function moveMyPaddle(playerId: string, d: number) {
  if (playersMap.has(playerId)) {
    const gameId = playersMap.get(playerId);
    if (gamesMap.has(gameId)) {
      if (gamesMap.get(gameId).LplayerId === playerId) {
        gamesMap.get(gameId).LpadMove(d);
      } else {
        gamesMap.get(gameId).RpadMove(d);
      }
      return ;
    }
    throw "Game not in map";
  }
  throw "Player not in map";
}

export const gamesReadyLoopCheck = async () => {
  while (true) {
    for (const [gameId, gameRuntime] of gamesMap) {
      if (gameRuntime.LplayerId !== "" && gameRuntime.RplayerId !== "")  {
        if (gameRuntime.pongStarted !== true
        && needToSendStartedMap.get(gameRuntime.LplayerId) === true
        && needToSendStartedMap.get(gameRuntime.RplayerId) === true) {
          if (gameRuntime.gameType === "normal") {
            console.log("I'm so normal.");
            gameRuntime.mainLoop();
//            console.log("one game started: " + gameId + ", with left: " + gameRuntime.LplayerId + " and right: " + gameRuntime.RplayerId);
//            console.log("sending the appropriate message to both clientis via ws");
            needToSendStartedMap.set(gameRuntime.LplayerId, false);
            needToSendStartedMap.set(gameRuntime.RplayerId, false);
            await sleep(10);
            dataStreamer(gameRuntime.LplayerId);
            dataStreamer(gameRuntime.RplayerId);
          }
          else {
            console.log("I'm so not normal!");
            gameRuntime.mainLoop();
//            console.log("one game started: " + gameId + ", with left: " + gameRuntime.LplayerId + " and right: " + gameRuntime.RplayerId);
//            console.log("sending the appropriate message to both clientis via ws");
            needToSendStartedMap.set(gameRuntime.LplayerId, false);
            needToSendStartedMap.set(gameRuntime.RplayerId, false);
            await sleep(10);
            dataStreamer(gameRuntime.LplayerId);
            dataStreamer(gameRuntime.RplayerId);
          }
        }
      }
    }
    await sleep(5e3);
//    getAll();
//    console.log("one gamesreadyloop iteration passed");
  }
}

const waitingForReconnect = async (playerId) => {
  while (socksMap.has(playerId) === false) {
    await sleep(3*1000);
  }
//  console.log("sock was finally detected for", playerId);
}

export const dataStreamer = async (playerId : string) => {
  let sock : WebSocket = socksMap.get(playerId);
  const runtime : PongRuntime = gamesMap.get(playersMap.get(playerId));
  console.log("data streamer", playerId, "says: pm is", playersMap);
  while (true) {
    if (!playersMap.has(playerId)) {
      console.log("player", playerId, "has disappeared from map");
      break ;
    }
    if (!gamesMap.has(playersMap.get(playerId))) {
      console.log("game has disappeared for player", playerId);
      break ;
    }
    if (socksMap.has(playerId) === false) {
      console.log("player", playerId, "has currently no socks available.");
      await waitingForReconnect(playerId);
      sock = socksMap.get(playerId);
      console.log("player", playerId, "found their sock");
    }
    if (runtime.gameType === "tournament" && (runtime.leftReady === false || runtime.rightReady === false) && !runtime.pongDone) {
      console.log(playerId, "is waiting for left:", !runtime.leftReady, "right:", !runtime.rightReady, "; the player is", (runtime.LplayerId === playerId ? "L" : "R"));
      await sleep(1e3);
    }
    else if (runtime.pongDone === false) {
      sock.send(JSON.stringify(runtime.gstate));
//    console.log(runtime.gstate);
    }
    else if (runtime.pongDone === true) {
      if (runtime.LplayerId === playerId) {
        sock.send(JSON.stringify(runtime.gstate));
        if (socksMap.has(runtime.RplayerId)) {
          sock = socksMap.get(runtime.RplayerId);
          sock.send(JSON.stringify(runtime.gstate));
        }
        // only delete the game id if the datastreamer is from the left to avoid double delete
        // XXX TODO leaks?
        // XXX mutex alert.
        if (playersMap.has(runtime.RplayerId)) {
          console.log("deleting rpid", runtime.RplayerId, "from pmap in datastreamer's pongdone thing (being a left player ourselves)");
          playersMap.delete(runtime.RplayerId);
        }
        if (gamesMap.has(playersMap.get(playerId))) {
          console.log("deleting gid", playersMap.get(playerId), "from gmap in datastreamer's pongdone thing (being a left player ourselves)");
          gamesMap.delete(playersMap.get(playerId));
        }
        if (playersMap.has(playerId)) {
          console.log("deleting lpid", playerId, "from pmap in datastreamer's pongdone thing (being a left player ourselves)");
          playersMap.delete(playerId);
        }
      }
      else if (runtime.RplayerId === playerId) {
        if (playersMap.has(playerId)) {
          console.log("deleting rpid", playerId, "from pmap in datastreamer's pongdone thing (being a left player ourselves)");
          playersMap.delete(playerId);
        }
      }
      break ;
    }
    await sleep(FRAME_TIME_MS);
  }
}

export function getGType(pId: string) {
  if (playersMap.has(pId)) {
    const gid = playersMap.get(pId);
    if (typeof gid === "undefined") {
      throw "undefined gameId";
    }
    if (gamesMap.has(gid)) {
      const gr = gamesMap.get(gid);
      if (typeof gr === "undefined") {
        throw "undefined pongruntime";
      }
      return gr.gameType;
    }
    throw "gamesMap doesn't have the player's gameid";
  }
  throw "Player not found in playersMap";
}

export function getOppId(pId: string) {
  if (playersMap.has(pId)) {
    const gid = playersMap.get(pId);
    if (typeof gid === "undefined") {
      throw "undefined gameId";
    }
    if (gamesMap.has(gid)) {
      const gr = gamesMap.get(gid);
      if (typeof gr === "undefined") {
        throw "undefined pongruntime";
      }
      if (gr.LplayerId === pId) {
        return gr.RplayerId;
      }
      if (gr.RplayerId === pId) {
        return gr.LplayerId;
      }
      else {
        throw "as a result of some freak accident, you're neither the left nor the right player in the game, thus, you can't have an opponent.";
      }
    }
    throw "gamesMap doesn't have the player's gameid";
  }
  throw "Player not found in playersMap";
}

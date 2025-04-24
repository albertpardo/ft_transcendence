const	ALPHA_MAX : number = 5*Math.PI/11;
const	sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const	FRAME_TIME : number = 1/30;
const	FRAME_TIME_MS : number = 1000 * FRAME_TIME;
const	WINDOW_SIZE : Vector2 = {x: 1600, y: 900};
const	PADDLE_H : number = 100;
const	MIN_BALL_SPEED_Y : number = 30;



interface	Vector2 {
	x: number;
	y: number;
};

interface	Paddle {
	y: number;
	h: number;
	speed: number;
};

interface	Ball {
	speed: Vector2;
	coords: Vector2;
};

export interface	State {
	stateBall: Ball;
	stateLP: Paddle;
	stateRP: Paddle;
	stateWhoL: string;
}



function	checkLoseConditions(ball: Ball) : string {
	if (ball.coords.x < 0) {
		return "left";
	}
	else if (ball.coords.x > WINDOW_SIZE.x) {
		return "right";
	}
	return "none";
}

function	calculateVBounce(ball: Ball, paddle: Paddle) : Vector2 {
	let	proportion : number = (ball.coords.y - paddle.y) / (paddle.h);
	proportion *= 2;
	proportion -= 1;
	if (Math.abs(ball.speed.y) < 0.001) {
		ball.speed.y = MIN_BALL_SPEED_Y;
	}
	return { x: -ball.speed.x, y: Math.sin(ALPHA_MAX * proportion) * Math.abs(ball.speed.y)};
};



class	PongRuntime {
	private ball : Ball = { speed: {x: -10, y: 0}, coords: {x: WINDOW_SIZE.x/2, y: WINDOW_SIZE.y/2}};
	private Lpaddle : Paddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, speed: 0 };
	private Rpaddle : Paddle = { y: 430, h: PADDLE_H, speed: 0 };
	private	whoLost : string = "none";

	public gstate : State = { stateBall: this.ball, stateLP: this.Lpaddle, stateRP: this.Rpaddle, stateWhoL: this.whoLost };
	public pongStarted : boolean = false;
	public pongDone : boolean = false;

	private updatePositions() : void {
		// ball bounces/fly-outs collision only check
		if (this.ball.speed.x < 0) {
			if (this.ball.speed.x * FRAME_TIME + this.ball.coords.x < 0) {
//				console.log("left exit imminent! paddle: ", this.Lpaddle);
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

		this.Lpaddle.y += this.Lpaddle.speed * FRAME_TIME;
		this.Rpaddle.y += this.Rpaddle.speed * FRAME_TIME;
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
			if (this.whoLost != "none") {
				this.pongDone = true;
				this.gstate = { stateBall: this.ball, stateLP: this.Lpaddle, stateRP: this.Rpaddle, stateWhoL: this.whoLost };
				return ("ball lost by... " + this.whoLost);
				// in real world, this here would restart the game instead of just breaking.
			}
			this.updatePositions();
//			console.log("ball speed: ", this.ball.speed);
//			console.log("ball coords:", this.ball.coords);
			this.gstate = { stateBall: this.ball, stateLP: this.Lpaddle, stateRP: this.Rpaddle, stateWhoL: this.whoLost };
			await sleep(FRAME_TIME_MS);
		};
	};
};

const gamesMap = new Map();
const nullVec2 : Vector2 = {x: 0, y: 0};
const nullBall : Ball = {speed: nullVec2, coords: nullVec2};
const nullPaddle : Paddle = {y: 0, h: 0, speed: 0};
const nullState : State = {stateBall: nullBall, stateLP: nullPaddle, stateRP: nullPaddle, stateWhoL: "null state"};

export const	startThePong = async (gameId: string) => {
	if (gamesMap.has(gameId)) {
		if (gamesMap.get(gameId).pongStarted === true) {
			console.error("game alr running");
			return ;
		}
		gamesMap.get(gameId).mainLoop();
//		console.log("a new game has been started at " + gameId);
//		console.log(gamesMap);
	}
	else {
		console.error("game not found in map");
		console.error(gameId);
		console.error(gamesMap);
	}
}

export function addPongGameId(gameId: string) {
	if (!(gamesMap.has(gameId))) {
		gamesMap.set(gameId, new PongRuntime);
//		console.log("game registred at " + gameId);
//		console.log(gamesMap);
	}
	else {
		console.error("you're already registered at " + gameId);
	}
}

export function	getPongStarted(gameId: string) : boolean {
//	console.log(gamesMap);
//	console.log("getpongstarted");
	if (gamesMap.has(gameId)) {
		return (gamesMap.get(gameId).pongStarted);
	}
	console.error("no game found registered at " + gameId);
	return false;
}

export function	getPongDone(gameId: string) : boolean {
//	console.log(gamesMap);
//	console.log("get pong  done");
	if (gamesMap.has(gameId)) {
		return (gamesMap.get(gameId).pongDone);
	}
	console.error("no game found registered at " + gameId);
	return false;
}

export function	getPongState(gameId: string) : State {
//	console.log(gamesMap);
//	console.log("get pong state");
	if (gamesMap.has(gameId)) {
		return (gamesMap.get(gameId).gstate);
	}
	console.error("no game found registered at " + gameId);
	return nullState;
}

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

interface	State {
	stateBall: Ball;
	stateLP: Paddle;
	stateRP: Paddle;
	stateWhoL: string;
}

const	ALPHA_MAX : number = 5*Math.PI/11;
const	sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const	FRAME_TIME : number = 1/30;
const	FRAME_TIME_MS : number = 1000 * FRAME_TIME;
const	WINDOW_SIZE : Vector2 = {x: 1600, y: 900};
const	PADDLE_H : number = 100;
const	MIN_BALL_SPEED_Y : number = 300;

function	calculateVBounce(ball: Ball, paddle: Paddle) : Vector2 {
	let	proportion : number = (ball.coords.y - paddle.y) / (paddle.h);
	proportion *= 2;
	proportion -= 1;
	if (Math.abs(ball.speed.y) < 0.001) {
		ball.speed.y = MIN_BALL_SPEED_Y;
	}
	return { x: -ball.speed.x, y: Math.sin(ALPHA_MAX * proportion) * Math.abs(ball.speed.y)};
};

function	updatePositions(ball: Ball, Lpaddle: Paddle, Rpaddle: Paddle) : void {
	// ball bounces/fly-outs collision only check
	if (ball.speed.x < 0) {
		if (ball.speed.x * FRAME_TIME + ball.coords.x < 0) {
			console.log("left exit imminent! paddle: ", Lpaddle);
			// we will be exiting the screen if so
			if ((ball.coords.y - Lpaddle.y >= 0) && (ball.coords.y - Lpaddle.y <= Lpaddle.h)) {
				// bounce off the left pad, to NOT exit the screen then :)
				ball.speed = calculateVBounce(ball, Lpaddle);
			}
			else {
				// missed the pad.
				// TODO some sort of "goal signal"? or do we control that outside?
				// if we control that outside, then just move thru like normal.
			}
		}
	}
	else if (ball.speed.x > 0) {
		if (ball.speed.x * FRAME_TIME + ball.coords.x > WINDOW_SIZE.x) {
			if ((ball.coords.y - Rpaddle.y >= 0) && (ball.coords.y - Rpaddle.y <= Rpaddle.h)) {
				// bounce off the right pad
				ball.speed = calculateVBounce(ball, Rpaddle);
			}
		}
	}
	if (ball.speed.y < 0) {
		if (ball.speed.y * FRAME_TIME + ball.coords.y < 0) {
			ball.speed.y *= -1;
		}
	}
	else if (ball.speed.y > 0) {
		if (ball.speed.y * FRAME_TIME + ball.coords.y > WINDOW_SIZE.y) {
			ball.speed.y *= -1;
		}
	}
	ball.coords.x += ball.speed.x * FRAME_TIME;
	ball.coords.y += ball.speed.y * FRAME_TIME;

	Lpaddle.y += Lpaddle.speed * FRAME_TIME;
	Rpaddle.y += Rpaddle.speed * FRAME_TIME;
	// clamp the paddles
	if (Lpaddle.y < 0) {
		Lpaddle.y = 0;
	}
	if (Rpaddle.y < 0) {
		Rpaddle.y = 0;
	}
	if (Lpaddle.y + Lpaddle.h > WINDOW_SIZE.y) {
		Lpaddle.y = WINDOW_SIZE.y - Lpaddle.h;
	}
	if (Rpaddle.y + Rpaddle.h > WINDOW_SIZE.y) {
		Rpaddle.y = WINDOW_SIZE.y - Rpaddle.h;
	}
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

let ourBall : Ball = { speed: {x: -1000, y: 0}, coords: {x: WINDOW_SIZE.x/2, y: WINDOW_SIZE.y/2}};
let ourLpaddle : Paddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, speed: 0 };
let ourRpaddle : Paddle = { y: 430, h: PADDLE_H, speed: 0 };
//let ourRpaddle : Paddle = { y: (WINDOW_SIZE.y - PADDLE_H)/2, h: PADDLE_H, speed: 0 };
let	whoLost : string = "none";
let	state : State = { stateBall: ourBall, stateLP: ourLpaddle, stateRP: ourRpaddle, stateWhoL: whoLost };
let pongStarted : boolean = false;
let pongDone : boolean = false;

export const	pongMain = async () => {
	pongStarted = true;
	while (true) {
		whoLost = checkLoseConditions(ourBall);
		if (whoLost != "none") {
			pongDone = true;
			state = { stateBall: ourBall, stateLP: ourLpaddle, stateRP: ourRpaddle, stateWhoL: whoLost };
			return ("ball lost by... " + whoLost);
			// in real world, this here would restart the game instead of just breaking.
		}
		updatePositions(ourBall, ourLpaddle, ourRpaddle);
		console.log("ball speed: ", ourBall.speed);
		console.log("ball coords:", ourBall.coords);
		state = { stateBall: ourBall, stateLP: ourLpaddle, stateRP: ourRpaddle, stateWhoL: whoLost };
		await sleep(FRAME_TIME_MS);
	};
}

export function	getPongStarted() : boolean {
	return (pongStarted);
}

export function	getPongDone() : boolean {
	return (pongDone);
}

export function	getPongState() : State {
	return (state);
}

//pongMain().catch(console.error);

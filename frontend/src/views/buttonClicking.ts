// src/views/buttonClicking.ts
export function	doSomething() : void {
	console.log("hello everybody");
}

export function registerGame(done: (error: Error | null, res?: Response) => void) {
	fetch(
		"http://127.0.0.1:4000/api/pong",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				gameId: "",
				newGame: false,
			}),
		})
		.then((response) => done(null, response))
		.catch((error) => done(error));
}

import Fastify from 'fastify';
import type { FastifyRequest } from 'fastify';
import { initDB } from './db';
import { PongResponses, State, startThePong, addPongGameId, getPongDoneness, getPongState } from './pong';

interface PongBodyReq {
	gameId: string,
	startGame: boolean,
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

const startServer = async () => {
	const fastify = Fastify({ logger: true });
	const db = await initDB();

	// inyectar la instancia de db para usarla en rutas
	fastify.decorate('db', db);

	//GET HOME
	// TODO get shall have absolutely 0 body
	// TODO gameid is ok, but userid should be the principal way of identifying users trying to do anything
	fastify.get('/', async (request, reply) => {
		reply.headers({
//			"Content-Security-Policy": "default-src 'self'",
			"Content-Type": "text/html",
		});
		return JSON.stringify(request.headers) + "<br>" + JSON.stringify(reply.getHeaders());
	});
	fastify.post('/', async (request: FastifyRequest<{ Body: PongBodyReq }>, reply) => {
		reply.headers({
			"Content-Security-Policy": "default-src 'self'",
			"Content-Type": "application/json",
		});
		if (request.body.gameId === "") {
			let localGameId : string = makeid(32);
			if (addPongGameId(localGameId) === PongResponses.AddedInMap) {
				return {message : "new game created.", gameId : localGameId, success : true};
			}
			return {message : "game creation failed. please, try again.", gameId : "", success : false};
		}
		if (request.body.startGame === true) {
			let startGameResponse : PongResponses = startThePong(request.body.gameId);
			if (startGameResponse === PongResponses.AlreadyRunning) {
				return {message : "game was already running.", gameId : request.body.gameId, success : false};
			}
			else if (startGameResponse === PongResponses.NotInMap) {
				return {message : "game doesn't exist.", gameId : request.body.gameId, success : false};
			}
			return {message : "pong started.", gameId : request.body.gameId, success : true};
		}
		if (request.body.startGame === false) {
			let checkOnGameResponse : PongResponses = getPongDoneness(request.body.gameId);
			if (checkOnGameResponse === PongResponses.AlreadyRunning) {
				return {message : "pong ongoing...", gameState : getPongState(request.body.gameId), success : true};
			}
			else if (checkOnGameResponse === PongResponses.StoppedRunning) {
				return {message : "pong's lost!", gameState : getPongState(request.body.gameId), success : true};
			}
			else if (checkOnGameResponse === PongResponses.NotRunning) {
				return {message : "pong wasn't started yet.", success : true};
			}
			return {message : "game doesn't exist.", gameId : request.body.gameId, success : false};
		}
		return {message : "unknown logical fork. the server is lowk cooked", success : false};
	});

	// GET USERS
	fastify.get('/users', async (request, reply) => {
		const users = await db.all('SELECT * FROM users');
		return users;
	});

	// POST USERS
	fastify.post('/users', async (request, reply) => {
		const { name, email } = request.body as any;
		try {
			await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
			return { success: true };
		} catch (err) {
			reply.code(400);
			return { error: 'Error inserting user', details: err };
		}
	});

	// PUT USERS
	fastify.put('/users/:id', async (request, reply) => {
		const { id } = request.params as any;
		const { name, email } = request.body as any;
		try {
			await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
			return { success: true };
		} catch (err) {
			reply.code(400);
			return { error: 'Error updating user', details: err };
		}
	});

	// DELETE USERS


	await fastify.listen({ port: 4000, host: '0.0.0.0' });
};

startServer().catch(console.error);

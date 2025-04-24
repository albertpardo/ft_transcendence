import Fastify from 'fastify';
import type { FastifyRequest } from 'fastify';
import { initDB } from './db';
import { State, startThePong, addPongGameId, getPongStarted, getPongDone, getPongState } from './pong';

interface PongBodyReq {
	gameId: string,
	newGame: boolean,
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
		if (request.body.gameId === "emptyId") {
			let localGameId : string = makeid(512);
			addPongGameId(localGameId);
			return {message : "new game created.", gameId : localGameId};
		}
		if (request.body.newGame === true) {
			startThePong(request.body.gameId);
			return {message : "pong started."};
		}
		if (request.body.newGame === false) {
			if (getPongDone(request.body.gameId) === true) {
				return {message : "pong's loser is: " + getPongState(request.body.gameId).stateWhoL};
			}
			if (getPongStarted(request.body.gameId) === false) {
				return {message : "pong wasn't started yet..."};
			}
		}
		return {message : "pong ongoing...", gameState : getPongState(request.body.gameId)};
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

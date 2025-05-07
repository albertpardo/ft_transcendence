// Encuentra la línea 28 y asegúrate de que no esté intentando llamar a un String como función.
// Podría ser algo como:
// Incorrecto: fastify.prefix('/api'); -> Si 'prefix' es un String, no una función
// Correcto: fastify.register(async (fastify) => { fastify.prefix('/api'); ... });

import Fastify from 'fastify';
import type { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
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

	await fastify.register(cors, {
		origin: '*'	// para desarrollo; en producción, restringe a tu dominio
	});

	await fastify.register(fastifyStatic, {
		root: path.join(__dirname, '..', 'uploads'),
		prefix: '/uploads/',		 // todas las URLs /uploads/* vendrán de aquí
		decorateReply: false
	});

	const db = await initDB();

	// inyectar la instancia de db para usarla en rutas
	fastify.decorate('db', db);

	// Registra un plugin para prefijar las rutas API con '/api'
	const apiRoutes = async (fastify) => {
		// GET HOME
		fastify.get('/', async (request, reply) => {
			return {message : "Welcome to the transcendence API!"};
		});

		// GET USERS
		fastify.get('/users', async (request, reply) => {
			const users = await db.all('SELECT * FROM users');
			return users;
		});

		// GET USERS BY ID
		fastify.get('/users/id/:id', async (request, reply) => {
			const { id } = request.params as any;
			try {
				const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
				if (!user) {
					reply.code(404);
					return { err: 'User not found' };
				}
				return user;
			} catch (err) {
				reply.code(400);
				return { err: 'Error fetching user', details: err };
			}
		});

		// GET USERS BY NAME
		fastify.get('/users/name/:name', async (request, reply) => {
			const { name } = request.params as any;
			try {
				const user = await db.get('SELECT * FROM users WHERE LOWER(name) = LOWER(?)', [name]);
				if (!user) {
					reply.code(404);
					return { error: 'User not found' };
				}
				return user;
			} catch (err) {
				reply.code(400);
				return { err : 'Error fetching user', details: err };
			}
		});
		
		// POST USERS
		fastify.post('/users', async (request, reply) => {
			const { name, nickname, email, password, avatar } = request.body as any;
			try {
				await db.run('INSERT INTO users (name, nickname, email, password, avatar) VALUES (?, ?, ?, ?, ?)', [name, nickname, email, password, avatar]);
				return { success: true };
			} catch (err) {
				reply.code(400);
				return { error: 'Error inserting user', details: err };
			}
		});

		// PUT USERS
		fastify.put('/users/id/:id', async (request, reply) => {
			const { id } = request.params as any;
			const { name, nickname, email, password, avatar} = request.body as any;
			try {
				const result = await db.run('UPDATE users SET name = ?, nickname = ?, email = ?, password = ?, avatar = ? WHERE id = ?', [name, nickname, email, password, avatar, id]);
				if (result.changes === 0) {
					reply.code(404);
					return { error: 'User not found' };
				}
				return { success: true };
			} catch (err) {
				console.error('Error completo:', err);
				reply.code(400);
				return { error: 'Error updating user', details: err };
			}
		});

		// DELETE USERS
		fastify.delete('/users/id/:id', async (request, reply) => {
			const { id } = request.params as any;
			try {
				const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
				if (result.changes === 0) {
					reply.code(404);
					return { error: 'User not found' };
				}
				return { success: true };
			} catch (err) {
				reply.code(400);
				return { error: 'Error deleting user', details: err };
			}
		});

		// temporary pong logic. permanent logic will have a constant sent-from-server stream of gamestate
		fastify.get('/pong', async (request, reply) => {
			reply.headers({
				"Content-Security-Policy": "default-src 'self'",
				"Content-Type": "text/html",
			});
			return "Welcome to an \"html\" return for firefox testing purposes.<br>Enjoy your stay!";
		});
		fastify.post('/pong', async (request: FastifyRequest<{ Body: PongBodyReq }>, reply) => {
			reply.headers({
				"Content-Security-Policy": "default-src 'self'",
				"Content-Type": "application/json",
			});
			console.log("hooray! new request:");
			console.log(request.body);
			console.log(typeof(request.body.gameId));
			console.log(typeof(request.body.startGame));
			console.log(request.body.gameId);
			console.log(request.body.startGame);
			if (request.body.gameId === "") {
//				console.log("empty id. let's create one");
				let localGameId : string = makeid(32);
				if (addPongGameId(localGameId) === PongResponses.AddedInMap) {
					return {message : "new game created.", gameId : localGameId, success : true};
				}
				return {message : "game creation failed. please, try again.", gameId : "", success : false};
			}
			if (request.body.startGame === true) {
//				console.log("non-empty id, and asked for 'start game'");
				let startGameResponse : PongResponses = startThePong(request.body.gameId);
				if (startGameResponse === PongResponses.AlreadyRunning) {
					return {message : "game was already running.", gameId : request.body.gameId, gameState: getPongState(request.body.gameId), success : false};
				}
				else if (startGameResponse === PongResponses.NotInMap) {
					return {message : "game doesn't exist.", gameId : request.body.gameId, success : false};
				}
				return {message : "pong started.", gameId : request.body.gameId, success : true};
			}
			if (request.body.startGame === false) {
//				console.log("non-empty id, and didn't ask for 'start game'");
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
	};

	fastify.register(apiRoutes, { prefix: '/api' });

	await fastify.listen({ port: 4000, host: '0.0.0.0' });
};

startServer().catch(console.error);

// Encuentra la línea 28 y asegúrate de que no esté intentando llamar a un String como función.
// Podría ser algo como:
// Incorrecto: fastify.prefix('/api'); -> Si 'prefix' es un String, no una función
// Correcto: fastify.register(async (fastify) => { fastify.prefix('/api'); ... });

import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { initDB } from './db';
import { PongResponses, State, addPlayerCompletely, getPongDoneness, getPongState, moveMyPaddle, gamesReadyLoopCheck, dataStreamer } from './pong';

interface PongBodyReq {
  playerId: string,
  getIn: boolean,
  mov: number,
}
// id shall come from the req and be per-user unique and persistent (jwt)
// getIn tells do we wanna move (false) or do we wanna get into a game (true)
// mov tells us where to move and if we wanna

const startServer = async () => {
  const fastify = Fastify({ logger: true });
  await fastify.register(websocket);

  await fastify.register(cors, {
    origin: '*'  // para desarrollo; en producción, restringe a tu dominio
  });

  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',     // todas las URLs /uploads/* vendrán de aquí
    decorateReply: false
  });

  const db = await initDB();

  // inyectar la instancia de db para usarla en rutas
  fastify.decorate('db', db);

  // start the meta loop of checking if any of the games are full enough to be started.
  gamesReadyLoopCheck();

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
        console.error('Error:', err);
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

    fastify.get('/pong', async (request, reply) => {
      reply.headers({
        "Content-Security-Policy": "default-src 'self'",
        "Content-Type": "text/html",
      });
      return "Welcome to an \"html\" return for firefox testing purposes.<br>Enjoy your stay!";
    });
    fastify.get('/pong/game-ws', { websocket: true }, async (sock, req: FastifyRequest<{ Body: PongBodyReq }>) => {
      sock.on('message', message => {
        sock.send("connected: " + message);
        let jsonMsg = JSON.parse(message);
        let playerId = jsonMsg?.playerId;
        let getIn = jsonMsg?.getIn;
        let mov = jsonMsg?.mov;
        if (typeof playerId !== "undefined" && playerId !== "") {
          if (typeof getIn !== "undefined" && getIn === true) {
            const resp : PongResponses = addPlayerCompletely(playerId, sock);
//          if (resp === PongResponses.YoureWaiting) {
//            // TODO FIXME make it only be streaming AFTER the game has started. so, maybe launch it from the gamesreadyloopcheck?
//            dataStreamer(playerId);
//          }
          }
          else if (typeof mov !== "undefined") {
            moveMyPaddle(playerId, mov);
          }
        }
        else {
          sock.send("error: must have a player id (playerId)");
        }
      });
    });
  };

  fastify.register(apiRoutes, { prefix: '/api' });

  await fastify.listen({ port: 4000, host: '0.0.0.0' });
};

startServer().catch(console.error);

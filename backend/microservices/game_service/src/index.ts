import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { PongResponses, State, addPlayerCompletely, removeTheSock, getPongDoneness, getPongState, moveMyPaddle, gamesReadyLoopCheck, dataStreamer } from './pong';

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
    origin: ['https://localhost:3000', 'https://127.0.0.1:3000'],
    credentials: true,
    allowedHeaders: 'Access-Content-Allow-Origin,Content-Type,Authorization,Upgrade',
  });

  // start the meta loop of checking if any of the games are full enough to be started.
  gamesReadyLoopCheck();

  // Registra un plugin para prefijar las rutas API con '/api'
  const apiRoutes = async (fastify) => {
    fastify.get('/pong', async (request, reply) => {
      reply.headers({
        "Content-Security-Policy": "default-src 'self'",
        "Content-Type": "text/html",
      });
      return "Welcome to an \"html\" return for firefox testing purposes.<br>Enjoy your stay!";
    });
    fastify.get('/pong/game-ws', { websocket: true }, async (sock, req: FastifyRequest<{ Body: PongBodyReq }>) => {
      sock.on('message', message => {
        sock.send("connected");
        let jsonMsg = JSON.parse(message);
        let playerId = jsonMsg?.playerId;
        let getIn = jsonMsg?.getIn;
        let mov = jsonMsg?.mov;
        if (typeof playerId !== "undefined" && playerId !== "") {
          if (typeof getIn !== "undefined" && getIn === true) {
            const resp : PongResponses = addPlayerCompletely(playerId, sock);
          }
          else if (typeof mov !== "undefined") {
            moveMyPaddle(playerId, mov);
          }
        }
        else {
          sock.send("error");
        }
      });
      sock.on('close', event => {
        removeTheSock(sock);
      });
    });
  };

  fastify.register(apiRoutes, { prefix: '/api' });

  await fastify.listen({ port: 9002, host: '0.0.0.0' });
};

startServer().catch(console.error);

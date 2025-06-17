import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { PongResponses, State, addPlayerCompletely, removeTheSock, getPongDoneness, getPongState, moveMyPaddle, gamesReadyLoopCheck, dataStreamer } from './pong';
import { historyMain, getHistForPlayerFromDb } from './history';

interface PongBodyReq {
  playerId: string,
  getIn: boolean,
  mov: number,
}
// id shall come from the req and be per-user unique and persistent (jwt)
// getIn tells do we wanna move (false) or do we wanna get into a game (true)
// mov tells us where to move and if we wanna

// TODO extra x-user-id to sock map maybe needs to be literally the same obj
//as the one in the pong.ts file

const upperSocksMap = new Map<string, WebSocket>();
//const qs = fastQuerystring();

const startServer = async () => {
  await historyMain();
  const fastify = Fastify({
    logger: true,
//    querystringParser: str => qs.parse(str),
  });
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
    fastify.get('/pong/game-ws', { websocket: true }, async (sock, req: FastifyRequest<{ Body: PongBodyReq }>) => {
      let playerId : string = req?.url.substring(req.url.search("uuid=") + 5) as string;
      upperSocksMap.set(playerId, sock);
      sock.on('message', message => {
        sock.send("connected");
      });
      sock.on('close', event => {
        removeTheSock(sock);
        upperSocksMap.delete(playerId);
      });
    });
    fastify.get('/pong', async (request, reply) => {
      reply.headers({
        "Content-Security-Policy": "default-src 'self'",
        "Content-Type": "text/html",
      });
      return "Welcome to an \"html\" return for firefox testing purposes.<br>Enjoy your stay!";
    });
    fastify.post('/pong', async (req: FastifyRequest<{ Body: PongBodyReq }>, reply) => {
//      let jsonMsg = JSON.parse(req.body);
      let jsonMsg = req.body;
      // this user id should be completely verified by now.
      let playerId : string = req.headers['x-user-id'] as string;
      let getIn = jsonMsg?.getIn;
      let mov = jsonMsg?.mov;
      let sock : WebSocket;
      if (typeof playerId !== "undefined" && playerId !== "") {
        if (typeof getIn !== "undefined" && getIn === true) {
          if (upperSocksMap.has(playerId) === false) {
            console.error("no associated socket found. this must never happen, i think.");
            return "somehow, the socket hasn't been found";
          }
          sock = upperSocksMap.get(playerId) as WebSocket;
          const resp : PongResponses = addPlayerCompletely(playerId, sock);
        }
        else if (typeof mov !== "undefined") {
          moveMyPaddle(playerId, mov);
        }
      }
      else {
        return "the request is super malformed";
      }
      return "done inerfacing via post";
    });
    // TODO XXX add public pong hist by username?
    fastify.post('/pong/hist', async (req: FastifyRequest<{ Body: {userId: string} }>, reply) => {
      const resp = await getHistForPlayerFromDb(req?.body.userId);
      return JSON.stringify(resp);
    });
  };

  fastify.register(apiRoutes, { prefix: '/api' });

  await fastify.listen({ port: 9002, host: '0.0.0.0' });
};

startServer().catch(console.error);

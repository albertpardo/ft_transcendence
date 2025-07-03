import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
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

  interface CorsOriginCallback {
    (err: Error | null, allow?: boolean): void;
  }

  interface CorsOptions {
    origin: (origin: string | undefined, cb: CorsOriginCallback) => void;
    credentials: boolean;
    allowedHeaders: string;
    methods: string[];
  }

  await fastify.register(cors,
    {
      //origin: "*",
    origin: (origin: string, cb: CorsOriginCallback) => {
      const allowed = [
        '*',
/*         'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://localhost:3000',
        'https://127.0.0.1:3000' */
      ];
      if (!origin || allowed.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed by CORS"), false);
      
    },
    credentials: true,
    allowedHeaders: 'Access-Content-Allow-Origin,Content-Type,Authorization,Upgrade',
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  // start the meta loop of checking if any of the games are full enough to be started.
  gamesReadyLoopCheck();

  // Registra un plugin para prefijar las rutas API con '/api'
  const apiRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/pong', async (request, reply) => {
      reply.headers({
        "Content-Security-Policy": "default-src 'self'",
        "Content-Type": "text/html",
      });
      return "Welcome to an \"html\" return for firefox testing purposes.<br>Enjoy your stay!";
    });
    fastify.get('/pong/game-ws', { websocket: true },(socket /* WebSocket */, req /* FastifyRequest */) => {
    socket.on('message', message => {
      // message.toString() === 'hi from client'
      let jsonMsg: PongBodyReq;
        try {
          jsonMsg = JSON.parse(message.toString()); // corrected
        } catch (e) {
          socket.send("error: invalid JSON"); // corrected
          return; // corrected
        }
        let token = req.headers['authorization']?.replace('Bearer ', '') || '';
        let playerId = ""; // default empty playerId
        // let playerId = jsonMsg?.playerId;
        try {
          const decoded = fastify.jwt.verify(token); // corrected
          playerId = decoded.userId; // corrected — assumes you sign tokens with `{ userId }`
        } catch (err) {
          socket.send('error: invalid token'); // corrected
          return; // corrected
        }
        let getIn = jsonMsg?.getIn;
        let mov = jsonMsg?.mov;
        if (typeof playerId !== "undefined" && playerId !== "") {
          if (typeof getIn !== "undefined" && getIn === true) {
            const resp : PongResponses = addPlayerCompletely (playerId, socket);
          }
          else if (typeof mov !== "undefined") {
            moveMyPaddle(playerId, mov);
          }
        }
        else {
          socket.send("error");
        }
      });
      socket.on('close', event => {
        removeTheSock(socket);
      socket.send('hi from server')
    })
  })

  };

  fastify.register(apiRoutes, { prefix: '/api' });

  await fastify.listen({ port: 9002, host: '0.0.0.0' });
};

startServer().catch(console.error);

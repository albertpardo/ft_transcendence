import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { State, addPlayerCompletely, removeTheSock, getPongState, forefit, moveMyPaddle, gamesReadyLoopCheck, dataStreamer, JoinError } from './pong';
import { historyMain, getHistForPlayerFromDb } from './history';
import { checkAdmining, checkParticipating, addTournament, joinTournament, listAllPublicTournaments, deleteTournament, getFullTournament, confirmParticipation } from './tournament';

// id shall come from the req and be per-user unique and persistent (jwt)
// getIn tells do we wanna move (false) or do we wanna get into a game (true)
// mov tells us where to move and if we wanna

// TODO extra x-user-id to sock map maybe needs to be literally the same obj
//as the one in the pong.ts file
// on the other hand, these two maps perform slightly different functions, so...

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
    fastify.get('/pong/game-ws', { websocket: true }, async (sock, req) => {
      const usp2 = new URLSearchParams(req.url);
      let playerId : string = usp2.get("/api/pong/game-ws?uuid") as string;
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
    fastify.post('/pong/game/add', async (req, reply) => {
      let playerId : string = req.headers['x-user-id'] as string;
      let sock : WebSocket;
      if (typeof playerId !== "undefined" && playerId !== "") {
        if (upperSocksMap.has(playerId) === false) {
          console.error("no associated socket found. this must never happen, i think.");
          return JSON.stringify({
            gType: "",
            err: "somehow, the socket hasn't been found",
          });
        }
        sock = upperSocksMap.get(playerId) as WebSocket;
        try {
          const gtype = addPlayerCompletely(playerId, sock);
          return JSON.stringify({
            gType: gtype,
            err: "nil",
          });
        }
        catch (e) {
          if (e instanceof JoinError) {
            return JSON.stringify({
              gType: e.gType,
              err: e.err,
            });
          }
          else {
            return JSON.stringify({
              gType: "",
              err: e,
            });
          }
        }
      }
      return JSON.stringify({
        gType: "",
        err: "undefined or empty playerId -- failed to verify?",
      });
    });
    fastify.post('/pong/game/move', async (req, reply) => {
      let jsonMsg = req.body;
      let playerId : string = req.headers['x-user-id'] as string;
      let mov = jsonMsg.mov;
      if (typeof playerId !== "undefined" && playerId !== "") {
        if (typeof mov !== "undefined") {
          moveMyPaddle(playerId, mov);
          return JSON.stringify({
            err: "nil",
          });
        }
        return JSON.stringify({
          err: "undefined mov",
        })
      }
      return JSON.stringify({
        err: "undefined or empty playerId -- failed to verify?",
      });
    });
    fastify.post('/pong/game/forefit', async (req, reply) => {
      let playerId : string = req.headers['x-user-id'] as string;
      if (typeof playerId !== "undefined" && playerId !== "") {
        forefit(playerId);
        return JSON.stringify({
          err: "nil",
        });
      }
      return JSON.stringify({
        err: "undefined or empty playerId -- failed to verify?",
      });
    });
    // TODO XXX add public pong hist by username?
    fastify.post('/pong/hist', async (req: FastifyRequest<{ Body: {userId: string} }>, reply) => {
      const resp = await getHistForPlayerFromDb(req?.body.userId);
      return JSON.stringify(resp);
    });
    fastify.post('/pong/tour/admincheck', async (req, reply) => {
      try {
        const resp = checkAdmining(req?.headers['x-user-id'] as string);
        return JSON.stringify({
          tId: resp,
          err: "nil",
        });
      }
      catch (e) {
        return JSON.stringify({
          res: "",
          err: e,
        });
      }
    });
    fastify.post('/pong/tour/participantcheck', async (req, reply) => {
      try {
        const resp = checkParticipating(req?.headers['x-user-id'] as string);
        return JSON.stringify({
          tId: resp,
          err: "nil",
        });
      }
      catch (e) {
        return JSON.stringify({
          res: "",
          err: e,
        });
      }
    });
    fastify.post('/pong/tour/create', async (req: FastifyRequest<{ Body: {tName: string, playersN: number, privacy: boolean} }>, reply) => {
      try {
        console.log("heyyyy");
        console.log(typeof req?.body.playersN);
        const resp = addTournament(req?.body.tName, Number(req?.body.playersN), req?.body.privacy, req?.headers['x-user-id'] as string);
        return JSON.stringify({
          tId: resp,
          err: "nil",
        });
      }
      catch (e) {
        return JSON.stringify({
          res: "",
          err: e,
        });
      }
    });
    fastify.post('/pong/tour/enroll', async (req: FastifyRequest<{ Body: {tId: string} }>, reply) => {
      try {
        const uuid = req?.headers['x-user-id'] as string;
        if (typeof uuid === "undefined") {
          throw "undefined uuid";
        }
        if (!upperSocksMap.has(uuid)) {
          throw "User has no socker in the upper socks map";
        }
        let sock = upperSocksMap.get(uuid);
        if (typeof sock === "undefined") {
          throw "Sock undefined in the server stage";
        }
        const resp = joinTournament(req?.body.tId, uuid, sock);
        return JSON.stringify({
          err: "nil",
        });
      }
      catch (e) {
        return JSON.stringify({
          err: e,
        });
      }
    });
    fastify.get('/pong/tour/all', async (req, reply) => {
      try {
        const resp = listAllPublicTournaments();
        return JSON.stringify({
          res: resp,
        });
      }
      catch {
        console.log("how the hell did this fail");
        return JSON.stringify({
          res: [],
        });
      }
    });
    fastify.get('/pong/tour/delete', async (req, reply) => {
      try {
        deleteTournament(req?.headers['x-user-id'] as string);
        return JSON.stringify({
          err: "nil",
        });
      }
      catch (e) {
        return JSON.stringify({
          err: e,
        });
      }
    });
    fastify.get('/pong/tour/peridinfo', async (req, reply) => {
      try {
        const res = getFullTournament(req?.headers['x-user-id'] as string);
        return JSON.stringify({
          res: res,
          err: "nil",
        });
      }
      catch (e) {
        return JSON.stringify({
          res: {},
          err: e,
        });
      }
    });
    fastify.post('/pong/tour/confirm', async (req, reply) => {
      try {
        confirmParticipation(req?.headers['x-user-id'] as string);
        return JSON.stringify({
          err: "nil",
        });
      }
      catch (e) {
        return JSON.stringify({
          err: e,
        });
      }
    });
  };

  fastify.register(apiRoutes, { prefix: '/api' });

  await fastify.listen({ port: 9002, host: '0.0.0.0' });
};

startServer().catch(console.error);

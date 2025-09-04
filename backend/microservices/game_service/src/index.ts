import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import {
  sleep,
  State,
  addPlayerCompletely,
  createLocalGame,
  removeTheSock,
  getPongState,
  forfeit,
  moveMyPaddle,
  moveMyPaddleLocal,
  gamesReadyLoopCheck,
  dataStreamer,
  JoinError,
  getGType,
  getOppId,
  checkInPong
} from './pong';
import { historyMain, getHistForPlayerFromDb } from './history';
import {
  tournamentsLoopCheck,
  checkAdmining,
  checkParticipating,
  addTournament,
  joinTournament,
  listAllPublicTournaments,
  deleteTournament,
  leaveTournament,
  getFullTournament,
  confirmParticipation,
  getFinalist,
  checkInTour,
  checkTourReady 
} from './tournament';

// Start by apardo-m
import { MICRO_NAME } from './pino_utils/constants';
import { getLogTransportConfig } from '../dist/pino_utils/logTransportConfig';
import { logFormat } from './pino_utils/log_format';
import responseLogger from './pino_utils/plugings/response-logger';
import { setUserStatus } from './utils/status'
// End by apardo-m

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

/*
  const fastify = Fastify({
//    logger: true,
//    querystringParser: str => qs.parse(str),
  });
*/

  const fastify = Fastify({
    logger: {
      transport: getLogTransportConfig(),
      base: {
        appName: MICRO_NAME
      },
    },
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
  // and for the torunaments -- to check on their alive-ness and remove if necessary.
  tournamentsLoopCheck();


  // Registra un plugin para prefijar las rutas API con '/api'

  const PREFIX = '/api';
  const apiRoutes = async (fastify) => {
    let PATH = '/pong/game-ws';
    fastify.get(PATH, { websocket: true }, async (sock, req) => {
      const usp2 = new URLSearchParams(req.url);
      let playerId : string = usp2.get("/api/pong/game-ws?uuid") as string;
      upperSocksMap.set(playerId, sock);
      sock.on('message', message => {
        fastify.log.info(...logFormat( "websocket option 'message' : " + PREFIX + PATH, playerId));
        sock.send("connected");
      });
      sock.on('close', event => {
        let limitReconectionTime : number = 3000;
        let oldPlayerId : string  = playerId;

        fastify.log.info(...logFormat( "websocket option 'close' : " + PREFIX + PATH, playerId));
        removeTheSock(sock);
        upperSocksMap.delete(playerId);
        setTimeout (() => {
          if (upperSocksMap.has(oldPlayerId) === false) {
            setUserStatus(oldPlayerId, "offline");
            fastify.log.info(...logFormat( "websocket option 'close' : " + PREFIX + PATH, oldPlayerId, " is offline!!!"));
          }
        }, limitReconectionTime );
      });
    });
	  PATH = '/pong';
    fastify.get(PATH, {
  	    handler:
          async (request, reply) => {
            reply.headers({
              "Content-Security-Policy": "default-src 'self'",
              "Content-Type": "text/html",
            });
            return "Welcome to an \"html\" return for firefox testing purposes.<br>Enjoy your stay!";
          },
        config: { source: PREFIX + PATH },
	  });
    PATH = '/pong/game/add';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
            let playerId : string = req.headers['x-user-id'] as string;
            let sock : WebSocket;
            if (typeof playerId !== "undefined" && playerId !== "") {
              let retries : number = 5;
              while (upperSocksMap.has(playerId) === false) {
                if (retries <= 0) {
                  req.log.info(...logFormat("game service on " + PATH, playerId, "outta retries."));
                  return JSON.stringify({
                    gType: "",
                    err: "somehow, the socket hasn't been found",
                  });
                }
                req.log.error(...logFormat("game service on " + PATH, "no associated socket found for", playerId, ", probable sync issue. retrying", retries, "more times..."));
                retries--;
                await sleep(1e3);
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
                req.log.error(...logFormat("game service on " + PATH, "whoops on add:", e));
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/game/local';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
            let playerId : string = req.headers['x-user-id'] as string;
            let sock : WebSocket;
            if (typeof playerId !== "undefined" && playerId !== "") {
              let retries : number = 5;
              while (upperSocksMap.has(playerId) === false) {
                if (retries <= 0) {
                  req.log.info(...logFormat("game service on " + PATH, playerId, "outta retries."));
                  return JSON.stringify({
                    gType: "",
                    err: "somehow, the socket hasn't been found",
                  });
                }
                req.log.error(...logFormat("game service on " + PATH, "no associated socket found for", playerId, ", probable sync issue. retrying", retries, "more times..."));
                retries--;
                await sleep(1e3);
              }
              sock = upperSocksMap.get(playerId) as WebSocket;
              try {
                createLocalGame(playerId, sock);
                return JSON.stringify({
                  gType: "local",
                  err: "nil",
                });
              }
              catch (e) {
                req.log.error(...logFormat("game service on " + PATH, "whoops on creation:", e));
                // I think using JoinError here is ok since it's just an error of "gtype & err", which is literally
                //what I'd do for something like "LocalError" as well
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/game/move';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
            let jsonMsg = req.body;
            let playerId : string = req.headers['x-user-id'] as string;
            let mov = jsonMsg.mov;
            if (typeof playerId !== "undefined" && playerId !== "") {
              if (typeof mov !== "undefined") {
                try {
                  moveMyPaddle(playerId, mov);
                  return JSON.stringify({
                    err: "nil",
                  });
                }
                catch (e) {
                  return JSON.stringify({
                    err: e,
                  });
                }
              }
              return JSON.stringify({
                err: "undefined mov",
              })
            }
            return JSON.stringify({
              err: "undefined or empty playerId -- failed to verify?",
            });
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/game/movelocal';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
            let jsonMsg = req.body;
            let playerId : string = req.headers['x-user-id'] as string;
            let mov = jsonMsg.mov;
            let side = jsonMsg.side;
            if (typeof playerId !== "undefined" && playerId !== "") {
              if (typeof mov !== "undefined") {
                try {
                  moveMyPaddleLocal(playerId, mov, side);
                  return JSON.stringify({
                    err: "nil",
                  });
                }
                catch (e) {
                  return JSON.stringify({
                    err: e,
                  });
                }
              }
              return JSON.stringify({
                err: "undefined mov",
              })
            }
            return JSON.stringify({
              err: "undefined or empty playerId -- failed to verify?",
            });
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/game/forfeit';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
            let playerId : string = req.headers['x-user-id'] as string;
            if (typeof playerId !== "undefined" && playerId !== "") {
              forfeit(playerId);
              return JSON.stringify({
                err: "nil",
              });
            }
            return JSON.stringify({
              err: "undefined or empty playerId -- failed to verify?",
            });
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/game/check';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
            const res = checkInPong(req?.headers['x-user-id'] as string);
            return JSON.stringify({
              res: res,
            });
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/game/info';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
            let playerId : string = req.headers['x-user-id'] as string;
            try {
              if (typeof playerId !== "undefined" && playerId !== "") {
                const gType = getGType(playerId);
                const oppId = getOppId(playerId);
                return JSON.stringify({
                  gType: gType,
                  oppId: oppId,
                  err: "nil",
                });
              }
              throw "undefined or empty playerId -- failed to verify?";
            }
            catch (e) {
              return JSON.stringify({
                gType: "",
                oppId: "",
                err: e,
              });
            }
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/hist';
    fastify.post(PATH, {
        handler:
          async (req: FastifyRequest<{ Body: {userId: string} }>, reply) => {
            const resp = await getHistForPlayerFromDb(req?.body.userId);
            return JSON.stringify(resp);
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/admincheck';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/participantcheck';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/create';
    fastify.post(PATH, {
        handler:
          async (req: FastifyRequest<{ Body: {tName: string, playersN: number, privacy: boolean} }>, reply) => {
            try {
              const regex = /[<>\/]+/;
              if (regex.test(req?.body.tName)) {
                throw "Unacceptable characters";
              }
              const uuid = req?.headers['x-user-id'] as string;
              if (typeof uuid === "undefined") {
                throw "bad uuid";
              }
              const sock = upperSocksMap.get(uuid);
              if (typeof sock === "undefined") {
                throw "bad sock";
              }
              const resp = addTournament(req?.body.tName, Number(req?.body.playersN), req?.body.privacy, uuid, sock);
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/enroll';
    fastify.post(PATH, {
        handler:
          async (req: FastifyRequest<{ Body: {tId: string} }>, reply) => {
            try {
              const uuid = req?.headers['x-user-id'] as string;
              if (typeof uuid === "undefined") {
                throw "undefined uuid";
              }
              if (!upperSocksMap.has(uuid)) {
                throw "User has no socket in the upper socks map";
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/all';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
            try {
              const resp = listAllPublicTournaments();
              return JSON.stringify({
                res: resp,
              });
            }
            catch {
              req.log.info(...logFormat("game service on " + PATH, "how the hell did this fail"));
              return JSON.stringify({
                res: [],
              });
            }
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/delete';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/leave';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
            try {
              leaveTournament(req?.headers['x-user-id'] as string);
              return JSON.stringify({
                err: "nil",
              });
            }
            catch (e) {
              req.log.error(...logFormat("game service on " + PATH, "an error on leaving caught. an error which is", e));
              return JSON.stringify({
                err: e,
              });
            }
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/check';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
            const res = checkInTour(req?.headers['x-user-id'] as string);
            return JSON.stringify({
              res: res,
            });
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/checkready';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
            const res = checkTourReady(req?.headers['x-user-id'] as string);
            return JSON.stringify({
              res: res,
            });
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/peridinfo';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/finalist';
    fastify.get(PATH, {
        handler:
          async (req, reply) => {
            try {
              const res = getFinalist(req?.headers['x-user-id'] as string);
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
          },
        config: { source: PREFIX + PATH },
    });
    PATH = '/pong/tour/confirm';
    fastify.post(PATH, {
        handler:
          async (req, reply) => {
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
          },
        config: { source: PREFIX + PATH },
    });
  };

  fastify.register(apiRoutes, { prefix: PREFIX });

  await fastify.listen({ port: 9002, host: '0.0.0.0' });
};

startServer().catch(console.error);

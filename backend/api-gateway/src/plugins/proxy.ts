import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

import { logFormat } from '../pino_utils/log_format'; //by apardo-m

//const CLIENT_ID = '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com';
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

export default fp(async function (fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request, reply) => {
	    const source = "fastify.addHook('onRequest') in proxy.ts";
      request.log.info(...logFormat( source, `🌐 onRequest: ${request.method} ${request.url}`));

      reply.header("Content-Security-Policy", `
        default-src 'self';
        script-src 'self' https://accounts.google.com https://cdnjs.cloudflare.com;
        frame-src 'self' https://accounts.google.com;
        img-src 'self' https://lh3.googleusercontent.com https://i.pravatar.cc;
        connect-src 'self' https://localhost:8443 https://play.google.com;
      `.replace(/\s+/g, ' ').trim());
        
      if (request.method === 'OPTIONS') {
        request.log.info(...logFormat(source, `🔥 CORS Preflight: ${request.headers.origin} → ${request.url}`));
        reply
          .header('Access-Control-Allow-Origin', request.headers.origin || '*')
          .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
          .header('Access-Control-Allow-Headers', 'Content-Type, Authorization, use-me-to-authorize')
          .header('Access-Control-Allow-Credentials', 'true')
          .code(204)
          .send();
        return;
      }
    });

    fastify.register(fastifyHttpProxy, {
        upstream: 'http://user_management:9001',
        prefix: '/api/public/nickname',
        rewritePrefix: '/api/user/public/nickname',
        http2: false,
        preHandler: (req, reply, done) => {
            // Custom logic before proxying the request
            done();
        }
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://user_management:9001',
        prefix: '/api/login',
        rewritePrefix: '/api/user/login',
        http2: false,
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://user_management:9001',
        prefix: '/api/signup',
        rewritePrefix: '/api/user/signup',
        http2: false
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://user_management:9001',
        prefix: '/api/profile',
        rewritePrefix: '/api/user/profile',
        http2: false,
        httpMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        replyOptions: {
            rewriteRequestHeaders: (req, headers) => {
              return {
                ...headers,
                'x-user-id': req.user?.id || headers['x-user-id'],
                authorization: headers.authorization,
              };
            },
        },
        preHandler: async (req, reply) => {
			const source = "fastify.register(fastifyHttpProxy from '/api/profile' to '/api/user/profile'";

             if (req.method === 'OPTIONS') {
              return;
            }

            req.log.info(...logFormat(source, '🚀 rewriteRequestHeaders - forwarded auth:', req.headers.authorization));
            req.log.info(...logFormat(source, '🔐🔐 Authorization Header:', req.headers['authorization']));

            try {
                req.log.info(...logFormat(source, '🔍🔐 Raw Authorization Header:', JSON.stringify(req.headers.authorization)));
                req.log.info(...logFormat(source, '🔍🔐 JWT Secret in use:', process.env.JWT_SECRET));

                await req.jwtVerify();
                req.log.info(...logFormat(source, "🔐 Verified JWT in proxy preHandler"));

                const userId = (req.user as any)?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                    req.log.info(...logFormat(source, `📦 Injected x-user-id = ${userId} into headers`));
                }
            } catch (err: any) {
                reply.log.error(...logFormat(source, '❌ Proxy-level JWT verification failed:', err.message));
                reply.code(401).send({ error: 'Unauthorized in proxy' });
            }
        },
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://user_management:9001',
        prefix: '/api/friends',
        rewritePrefix: '/api/user/friends',
        httpMethods: ['GET', 'PUT'],
        http2: false,
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://user_management:9001',
        prefix: '/api/status',
        rewritePrefix: '/api/user/status',
        httpMethods: ['PUT'],
        http2: false,
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://game_service:9002',
        prefix: '/api/pong',
        rewritePrefix: '/api/pong',
        httpMethods: ['GET'],
        http2: false,
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://game_service:9002',
        prefix: '/api/pong',
        rewritePrefix: '/api/pong',
        httpMethods: ['POST'],
        http2: false,
    });
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://game_service:9002',
        prefix: '/api/pong/game-ws',
        rewritePrefix: '/api/pong/game-ws',
        httpMethods: ['GET'],
        websocket: true,
        http2: false,
    });
    fastify.addHook('onSend', async (req, reply, payload) => {
        if ((req.url.startsWith('/api/login') || req.url.startsWith('/api/signup')) && reply.statusCode === 200) {
		    const source = "fastify.addHook('onSend') in proxy.ts";
            try {
                let body;
                if (payload && typeof (payload as Readable).read === 'function') {
                    const raw = await getRawBody(payload as Readable);
                    body = JSON.parse(raw.toString());
                } else if (typeof payload === 'string') {
                    body = JSON.parse(payload);
                } else {
                    body = payload;
                }
                req.log.info(...logFormat(source, '📦 Final parsed payload:', body));

                if (!body.id || !body.username) {
                    req.log.info(...logFormat(source, '⚠️ No id or username found in payload!'));
                    return payload;
                }

                const token = fastify.jwt.sign({ userId: body.id });

                return JSON.stringify({
                    id: body.id,
                    token: token,
                    user: body.username,
                });
            } catch (err) {
                req.log.error(...logFormat(source, 'Google auth error:', err));
                if (err && typeof err === 'object' && 'stack' in err) {
                    req.log.error(...logFormat(source, 'Full error stack:', (err as { stack?: string }).stack));
                }
                if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string' && (err as any).message.includes('Invalid ID token')) {
                  return reply.status(400).send({ error: 'Invalid Google token' });
                }
                return reply.status(500).send({
                 error: 'Authentication failed',
                 detail: typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string'
                   ? (err as any).message
                   : 'Unknown error',
               });
            }
        }

        return payload; // return original response by default
    });
});

import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';

export default fp(async function (fastify: FastifyInstance) {
    // register proxy: without onResponse
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://user_management:9001',
        prefix: '/api/public/nickname',
        rewritePrefix: '/api/user/public/nickname',
        http2: false,
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
            // Allow preflight CORS manually for OPTIONS
            if (req.method === 'OPTIONS') {
              reply
                .header('Access-Control-Allow-Origin', req.headers.origin || '*')
                .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
                .header('Access-Control-Allow-Headers', 'Content-Type, Authorization, use-me-to-authorize')
                .header('Access-Control-Allow-Credentials', 'true')
                .code(204)
                .send();
              return;
            }
            console.log('🚀 rewriteRequestHeaders - forwarded auth:', req.headers.authorization);
            console.log('🔐🔐 Authorization Header:', req.headers['authorization']);

            try {
                console.log('🔍🔐 Raw Authorization Header:', JSON.stringify(req.headers.authorization));
                console.log('🔍🔐 JWT Secret in use:', process.env.JWT_SECRET);

                await req.jwtVerify();
                console.log("🔐 Verified JWT in proxy preHandler");

                const userId = (req.user as any)?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                    console.log(`📦 Injected x-user-id = ${userId} into headers`);
                }
            } catch (err: any) {
                console.error('❌ Proxy-level JWT verification failed:', err.message);
                reply.code(401).send({ error: 'Unauthorized in proxy' });
            }
        },
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
//        preHandler: async (req, reply) => {
//          console.log("prehandler pong POST");
//          console.log(req.headers);
//        }
    });

    fastify.register(fastifyHttpProxy, {
        upstream: 'http://game_service:9002',
        prefix: '/api/pong/game-ws',
        rewritePrefix: '/api/pong/game-ws',
        httpMethods: ['GET'],
        websocket: true,
        http2: false,
//        preHandler: async (req, reply) => {
//          console.log("prehandler ws");
//          console.log(req.headers);
//          console.log("and the url is: ", req.url);
//        }
    });

    // 2FA Skip
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://auth_service:9003',
        prefix: '/api/auth/2fa/skip',
        rewritePrefix: '/api/security/auth/2fa/skip',
        http2: false,
        preHandler: async (req, reply) => {
            try {
                await req.jwtVerify();
                const userId = (req.user as any)?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                }
            } catch (err) {
                reply.code(401).send({ error: 'Unauthorized' });
            }
        },
    });

    // 2FA Enable
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://auth_service:9003',
        prefix: '/api/auth/2fa/enable',
        rewritePrefix: '/api/security/auth/2fa/enable',
        http2: false,
        preHandler: async (req, reply) => {
            try {
                await req.jwtVerify();
                const userId = (req.user as any)?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                }
            } catch (err) {
                reply.code(401).send({ error: 'Unauthorized' });
            }
        },
    });

    // 2FA Disable
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://auth_service:9003',
        prefix: '/api/auth/2fa/disable',
        rewritePrefix: '/api/security/auth/2fa/disable',
        http2: false,
        preHandler: async (req, reply) => {
            try {
                await req.jwtVerify();
                const userId = (req.user as any)?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                }
            } catch (err) {
                reply.code(401).send({ error: 'Unauthorized' });
            }
        },
    });

    // Finalize login after successful 2FA
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://auth_service:9003',
        prefix: '/api/auth/2fa/finalize-login',
        rewritePrefix: '/api/security/auth/2fa/finalize-login',
        http2: false,
    });

    // Check the status of user's 2FA
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://auth_service:9003',
        prefix: '/api/auth/2fa/status',
        rewritePrefix: '/api/security/auth/2fa/status',
        http2: false,
        preHandler: async (req, reply) => {
            try {
                await req.jwtVerify();
                const userId = (req.user as any)?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                }
            } catch (err) {
                reply.code(401).send({ error: 'Unauthorized' });
            }
        },
    });
    
    // Verify 2FA
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://auth_service:9003',
        prefix: '/api/auth/2fa/verify',
        rewritePrefix: '/api/security/auth/2fa/verify',
        http2: false,
        preHandler: async (req, reply) => {
            try {
                await req.jwtVerify();
                const userId = (req.user as any)?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                }
            } catch (err) {
                reply.code(401).send({ error: 'Unauthorized' });
            }
        },
    });    

    // inject token: for login & token generation after signup
    // block and modify response
    fastify.addHook('onSend', async (req, reply, payload) => {
        if ((req.url.startsWith('/api/login') || 
            req.url.startsWith('/api/signup') || 
            req.url.startsWith('/api/auth/2fa/finalize-login')) && 
            reply.statusCode === 200) {
            try {
                let body;
                //if payload is Readable, transform it into string with raw-bady
                if (payload && typeof (payload as Readable).read === 'function') {
                    const raw = await getRawBody(payload as Readable);
                    body = JSON.parse(raw.toString());
                } else if (typeof payload === 'string') {
                    body = JSON.parse(payload);
                } else {
                    body = payload;
                }
                console.log('📦 Final parsed payload:', body);
 
            //    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
            //    console.log('📦 Login/signup response payload:', data);

                const userId = body.id || body.userId;
            //    if (!body.id || !body.userId || !body.username) {
                if (!userId) {
                    console.warn('⚠️ No id (or userId) or username found in payload!');
                    return payload;
                }

                // include has_2fa in token if present
                //const tokenPayload: any = { userId: body.id };
                const tokenPayload: any = { userId };
                if (typeof body.has_2fa === 'boolean') {
                    tokenPayload.has_2fa = body.has_2fa;
                }

                const token = fastify.jwt.sign(tokenPayload);
//                const token = fastify.jwt.sign({ userId: body.id });

                // return new JSON response
                return JSON.stringify({
                //    id: body.id,
                    id: userId,
                    token,
                    user: body.username, // 注意有些 finalize-login 不带 username，所以可以为 undefined
                    has_2fa: body.has_2fa ?? false,
                });
            } catch (err) {
                console.error('⚠️ Failed to parse payload or generate token:', err);
                return payload; // fallback to original
            }
        }

        return payload; // return original response by default
    });
});

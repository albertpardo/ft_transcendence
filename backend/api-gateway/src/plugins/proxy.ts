import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';
import { FastifyRequest, FastifyReply } from 'fastify';

const userManagementUrl = process.env.USER_MANAGEMENT_URL;
if (!userManagementUrl) {
    throw new Error('USER_MANAGEMENT_URL environment variable is not set');
}

export default fp(async function (fastify: FastifyInstance) {
    // register proxy: without onResponse
    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/login',
        rewritePrefix: '/api/user/login',
        http2: false,
    });

    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/signup',
        rewritePrefix: '/api/user/signup',
        http2: false
    });

    interface ProxyReplyOptions {
        rewriteRequestHeaders: (req: import('fastify').FastifyRequest, headers: Record<string, any>) => Record<string, any>;
    }

/*     interface ProxyPreHandlerRequest extends FastifyRequest {
        user: { userId: string };
        jwtVerify: () => Promise<void>;
    }
 */
    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/profile',
        rewritePrefix: '/api/user/profile',
        http2: false,
        httpMethods: ['GET', 'POST', 'PUT', 'DELETE'],

        preHandler: async (req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => {
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
                // await req.jwtVerify(); <- option removing redundance below 
                await (req as FastifyRequest).jwtVerify();
                console.log("🔐 Verified JWT in proxy preHandler");
                //same here, we can use req.user directly
                // const userId = req.user?.userId; <- option removing redundance below
                const userId = (req as FastifyRequest).user?.userId;
                if (userId) {
                    req.headers['x-user-id'] = String(userId);
                    console.log(`📦 Injected x-user-id = ${userId} into headers`);
                }
            } catch (err: any) {
                console.error('❌ Proxy-level JWT verification failed:', err.message);
                reply.code(401).send({ error: 'Unauthorized in proxy' });
                return;
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
        prefix: '/api/pong/game-ws',
        rewritePrefix: '/api/pong/game-ws',
        httpMethods: ['GET'],
        websocket: true,
        http2: false,
    });

    // inject token: for login & token generation after signup
    // block and modify response
    interface LoginSignupPayload {
        id?: string;
        username?: string;
        [key: string]: any;
    }

    interface OnRequestFastifyRequest extends FastifyRequest {
        headers: {
            origin?: string;
            [key: string]: any;
        };
    } 

    fastify.addHook('onRequest', async (req: OnRequestFastifyRequest, reply: FastifyReply): Promise<void> => {
      reply.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      reply.header('Access-Control-Allow-Credentials', 'true');
    });

    fastify.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply, payload: unknown): Promise<unknown> => {
        if ((req.url.startsWith('/api/login') || req.url.startsWith('/api/signup')) && reply.statusCode === 200) {
            try {
                let body: LoginSignupPayload;
                //if payload is Readable, transform it into string with raw-body
                if (payload && typeof (payload as Readable).read === 'function') {
                    const raw = await getRawBody(payload as Readable);
                    body = JSON.parse(raw.toString()); 
                } else if (typeof payload === 'string') {
                    body = JSON.parse(payload) as LoginSignupPayload;
                } else {
                    body = payload as LoginSignupPayload;
                }
                console.log('📦 Final parsed payload:', body);

                if (!body.id || !body.username) {
                    console.warn('⚠️ No id or username found in payload!');
                    return payload;
                }

                const token: string = fastify.jwt.sign({ userId: body.id });

                // return new JSON response
                return JSON.stringify({
                    id: body.id,
                    token: token,
                    user: body.username,
                });
            } catch (err) {
                console.error('⚠️ Failed to parse payload or generate token:', err);
                return payload; // fallback to original
            }
        }

        return payload; // return original response by default
    });
});

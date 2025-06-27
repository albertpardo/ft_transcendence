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

interface ProxyReplyOptions {
    rewriteRequestHeaders: (req: import('fastify').FastifyRequest, headers: Record<string, any>) => Record<string, any>;
}

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

export default fp(async function (fastify: FastifyInstance): Promise<void> {
    fastify.get('/health', async (req: FastifyRequest, reply: FastifyReply): Promise<{ status: string }> => {
        return { status: 'ok' };
    });

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

    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/profile',
        rewritePrefix: '/api/user/profile',
        http2: false,
        httpMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        preHandler: async (
            req: FastifyRequest,
            reply: FastifyReply
        ): Promise<void> => {
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
            const auth = req.headers['authorization'];
            if (!auth) {
                console.warn('❌ No Authorization header found in request');
                return reply.code(401).send({ error: 'Missing Authorization header' });
            }
            console.log('🚀 rewriteRequestHeaders - forwarded auth:', req.headers.authorization);
            console.log('🔐🔐 Authorization Header:', req.headers['authorization']);

            try {
               // console.log('🔍🔐 Raw Authorization Header:', JSON.stringify(req.headers.authorization));
                console.log('🔍🔐 JWT Secret in use:', process.env.JWT_SECRET);
                console.log(`🔍🔐 Aurthorization header**** -> : ${auth}`);
                await req.jwtVerify();
                // await (req as FastifyRequest).jwtVerify();
                console.log("🔐 Verified JWT in proxy preHandler");
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

    fastify.addHook('onRequest', async (req: OnRequestFastifyRequest, reply: FastifyReply): Promise<void> => {
        reply.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        reply.header('Access-Control-Allow-Credentials', 'true');
    });

    fastify.addHook('onSend', async (
        req,
        reply,
        payload
    ) => {
        if ((req.url.startsWith('/api/login') || req.url.startsWith('/api/signup') ) && reply.statusCode === 200) {
            try {
                console.log("entered the try block");
                let body;
                if (payload && typeof (payload as Readable).read === 'function') {
                    console.log("if number 1");
                    console.log("*************", payload);
                    console.log("*************");
                    const raw: Buffer = await getRawBody(payload as Readable);
                    console.log("getrawbody success");
                    console.log(raw);
                    console.log("and now, raw to string:");
                    console.log('utf8', raw.toString('utf8'));
                    console.log('lat1', raw.toString('latin1'));
                    console.log('asc', raw.toString('ascii'));
                    console.log('hex', raw.toString('hex'));
                    console.log('64', raw.toString('base64'));
                    body = JSON.parse(raw.toString());
                    console.log("json parse success");
                } else if (typeof payload === 'string') {
                    console.log("if number 2");
                    console.log("payload found to be", payload);
                    body = JSON.parse(payload);
                    console.log("json parse success");
                } else {
                    console.log("if number 3");
                    body = payload;
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
                return payload;
            }
        }
        return payload;
    });
});
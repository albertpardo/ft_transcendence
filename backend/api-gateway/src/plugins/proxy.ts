import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';

export default fp(async function (fastify: FastifyInstance) {
    // register proxy: without onResponse
    fastify.register(fastifyHttpProxy, {
        
        upstream: process.env.USER_MANAGEMENT_URL,
        prefix: '/api/login',
        rewritePrefix: '/api/user/login',
        http2: false,
    });

    fastify.register(fastifyHttpProxy, {
        upstream: process.env.USER_MANAGEMENT_URL,
        prefix: '/api/signup',
        rewritePrefix: '/api/user/signup',
        http2: false
    });

    fastify.register(fastifyHttpProxy, {
        upstream: process.env.USER_MANAGEMENT_URL,
        prefix: '/api/profile',
        rewritePrefix: '/api/user/profile',
        http2: false
    });

    fastify.addHook('onSend', async (req, reply, payload) => {
        if ((req.url.startsWith('/api/login') || req.url.startsWith('/api/signup')) && reply.statusCode === 200) {
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
                console.log('📦 Final parsed payload:', body);
 
                if (!body.id || !body.username) {
                    console.warn('⚠️ No id or username found in payload!');
                    return payload;
                }

                const token = fastify.jwt.sign({ userId: body.id });

                return JSON.stringify({
                    token,
                    user: body.username
                });
            } catch (err) {
                console.error('⚠️ Failed to parse payload or generate token:', err);
                return payload; // fallback to original
            }
        }

        return payload; // return original response by default
    });
});

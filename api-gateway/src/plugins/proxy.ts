import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
    // register proxy: without onResponse
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://localhost:9001',
        prefix: '/api/login',
        rewritePrefix: '/api/user/login',
        http2: false,
    });

    // block and modify response
    fastify.addHook('onSend', async (req, reply, payload) => {
        if (req.url.startsWith('/api/login') && reply.statusCode === 200) {
            try {
                const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
                const token = fastify.jwt.sign({ user: data.username });

                // return new JSON response
                return JSON.stringify({
                    token,
                    user: data.username
                });
            } catch (err) {
                console.error('⚠️ Failed to parse payload or generate token:', err);
                return payload; // fallback to original
            }
        }

        return payload; // return original response by default
    });
});

/*
export default fp(async function (fastify: FastifyInstance) {
    //login proxy: forward /api/login to /api/user/login of the microservice user_management
    fastify.register(fastifyHttpProxy, {
        upstream: 'http://localhost:9001',
        prefix: '/api/login',
        rewritePrefix: '/api/user/login', //rewrite the path
        http2: false,

        replyOptions: {
            onResponse: async (req, reply, res) => {
                const stream = res as unknown as NodeJS.ReadableStream;
                const buffers: Buffer[] = [];
                for await (const chunk of stream) {
                    buffers.push(chunk as Buffer);
                }
                const body = Buffer.concat(buffers).toString('utf-8');
                const data = JSON.parse(body);
                
          
                if (reply.statusCode === 200) {
                  const token = fastify.jwt.sign({ user: data.username });
                  reply.send({ token, user: data.username });
                } else {
                  reply.code(reply.statusCode || 500).send(data);
                }
            }
        }
    });
});
*/
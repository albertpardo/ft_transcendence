import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';

export default fp(async function (fastify: FastifyInstance) {
    // register proxy: without onResponse
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
        http2: false
    });

    // inject token: for login & token generation after signup
    // block and modify response
    fastify.addHook('onSend', async (req, reply, payload) => {
        if ((req.url.startsWith('/api/login') || req.url.startsWith('/api/signup')) && reply.statusCode === 200) {
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

                if (!body.id || !body.username) {
                    console.warn('⚠️ No id or username found in payload!');
                    return payload;
                }

                const token = fastify.jwt.sign({ userId: body.id });

                // return new JSON response
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
    /*
    //decode token: for userId injection of profile request
    fastify.addHook('onRequest', async (req, reply) => {
        if (req.url.startsWith('api/profile')) {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader) return reply.code(401).send({ error: 'No token provided' });

                const token = authHeader.replace('Bearer ', '');
                const decoded = fastify.jwt.verify(token) as { user: string };

                //get userId from username: store userId in JWT, realize query with userId in the profile of frontend
                req.headers['x-user-id'] = decoded.user; //micoservice queries database according to the field
            } catch (err) {
                return reply.code(401).send({ error: 'Invalid token' });
            }
        }
    });
    */
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
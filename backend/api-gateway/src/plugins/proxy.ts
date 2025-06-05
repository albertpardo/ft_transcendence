import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';

export default fp(async function (fastify: FastifyInstance) {
    const userManagementUrl = process.env.USER_MANAGEMENT_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://user-management-lsdg.onrender.com' 
        : 'http://user_management:9001');
    console.log(`🔌 Proxying to user service at: ${userManagementUrl}`);
    // register proxy: without onResponse
    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        //  upstream: 'http://user_management:9001',
      //  upstream: process.env.USER_MANAGEMENT_URL || 'http://user_management:9001',

        prefix: '/api/login',
        rewritePrefix: '/api/user/login',
        http2: false,
    });

    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        //  upstream: 'http://user_management:9001',
        // upstream: process.env.USER_MANAGEMENT_URL || 'http://user_management:9001',
        prefix: '/api/signup',
        rewritePrefix: '/api/user/signup',
        http2: false
    });

    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        // upstream: 'http://user_management:9001',
        // upstream: process.env.USER_MANAGEMENT_URL || 'http://user_management:9001',
        prefix: '/api/profile',
        rewritePrefix: '/api/user/profile',
        http2: false
    });

    // inject token: for login & token generation after signup
    // block and modify response
    fastify.addHook('onSend', async (req, reply, payload) => {

    if ((req.url.includes('/api/login') || req.url.includes('/api/signup')) && reply.statusCode === 200) {


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
    } //?? this and line 37 are questionable.. 
        return payload; // return original response by default
    });
});

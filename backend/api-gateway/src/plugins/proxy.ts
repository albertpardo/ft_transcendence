import fp from 'fastify-plugin';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const CLIENT_ID = '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

export default fp(async function (fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request, reply) => {
       fastify.log.info(`🌐 onRequest: ${request.method} ${request.url}`);

         reply.header("Content-Security-Policy", `
          default-src 'self';
          script-src 'self' https://accounts.google.com https://cdnjs.cloudflare.com;
          frame-src 'self' https://accounts.google.com;
          img-src 'self' https://lh3.googleusercontent.com https://i.pravatar.cc;
          connect-src 'self' https://localhost:8443 https://play.google.com;
        `.replace(/\s+/g, ' ').trim());
        
        
    if (request.method === 'OPTIONS') {
          fastify.log.info(`🔥 CORS Preflight: ${request.headers.origin} → ${request.url}`);
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
/*       fastify.post('/api/auth/google', async (request, reply) => {
      fastify.log.info('🔥 Received Google auth request');
      fastify.log.info('📬 Request body:', request.body);
      const { token } = request.body as { token: string };
      if (!token) {
        fastify.log.error('❌ No token in request body');
        return reply.status(400).send({ error: 'Google ID token is required' });
      }
      try {
        fastify.log.info('🔐 Verifying Google token...');
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
        });
      
        const payload = ticket.getPayload();
        if (!payload) {
          fastify.log.error('❌ Invalid Google token payload');
          return reply.status(400).send({ error: 'Invalid Google token' });
        }
      
        fastify.log.info('✅ Google token verified:', payload);
        const { email, name, picture, sub: googleId } = payload;
      
        if (!email) {
          fastify.log.error('❌ No email in payload');
          return reply.status(400).send({ error: 'Email is required' });
        }

        let userRes;
        try {
          userRes = await fetch('http://user_management:9001/api/user/upsert-google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, picture, googleId }),
          });
          fastify.log.info('👤 User service response:', userRes.status);
          if (userRes.statusCode !== 200) {
            throw new Error('User service failed');
          }
          let user;
          try {
             user = JSON.parse(userRes.payload.toString());
             fastify.log.info('✅ Parsed user:', user);
           } catch (err) {
             fastify.log.error('Failed to parse user response:', err);
             throw new Error('Invalid JSON from user service');
           }
        } catch (err) {
          fastify.log.error('❌ Failed to upsert user:', err);
          return reply.status(500).send({ error: 'User creation failed' });
        }
        const user = userRes.json();
        const authToken = fastify.jwt.sign({ userId: user.id }, { expiresIn: '7d' });
      
        reply.setCookie('authToken', authToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      
        return reply.send({
          id: user.id,
          token: authToken,
          user: user.username,
        });
      } catch (err: any) {
        fastify.log.error('🚨 Google auth error:', err.message);
        fastify.log.error('Full error:', err.stack);
        return reply.status(500).send({
          error: 'Authentication failed',
          detail: err.message
        });
      }
    }); */
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
             if (req.method === 'OPTIONS') {
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
                    id: body.id,
                    token: token,
                    user: body.username,
                });
            } catch (err) {
                fastify.log.error('Google auth error:', err);
                if (err && typeof err === 'object' && 'stack' in err) {
                    fastify.log.error('Full error stack:', (err as { stack?: string }).stack);
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

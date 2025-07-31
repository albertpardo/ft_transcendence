import fp from 'fastify-plugin';
import fastifyCookie from 'fastify-cookie';
import { gunzipSync, brotliDecompressSync } from 'zlib';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const CLIENT_ID = '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

export default fp(async function (fastify: FastifyInstance): Promise<void> {
  // Register cookie support
  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'supersecret',
  });

  // CORS & Security Headers
  fastify.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info(`🌐 onRequest: ${req.method} ${req.url}`);

    const allowedOrigin = process.env.API_FRONTEND_URL || 'https://frontend-7nt4.onrender.com';
    const origin = req.headers.origin;

    if (origin === allowedOrigin) {
      reply.header('Access-Control-Allow-Origin', allowedOrigin);
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, use-me-to-authorize');
      reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    }

    if (req.method === 'OPTIONS') {
      fastify.log.info(`🔥 CORS Preflight: ${origin} → ${req.url}`);
      reply.code(204).send();
      return;
    }

    reply.header("Content-Security-Policy", `
      default-src 'self';
      script-src 'self' https://accounts.google.com https://cdnjs.cloudflare.com;
      frame-src 'self' https://accounts.google.com;
      img-src 'self' https://lh3.googleusercontent.com https://i.pravatar.cc;
      connect-src 'self' https://localhost:8443 https://play.google.com;
    `.replace(/\s+/g, ' ').trim());
  });

  // Health Check
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Google OAuth2 Login Route
  fastify.post('/api/auth/google', async (req: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) => {
    try {
      const { token } = req.body;
      const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
      const payload = ticket.getPayload();

      if (!payload) {
        return reply.status(400).send({ error: 'Invalid Google token payload' });
      }

      const { sub: googleId, email, name, picture } = payload;

      // Register or login user via user management service
      const userRes = await fetch(`${process.env.USER_MANAGEMENT_URL}/api/user/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId, email, name, picture }),
      });

      if (!userRes.ok) {
        throw new Error('User service failed');
      }

      const userData = await userRes.json();
      const userId = userData.id;

      const authToken = fastify.jwt.sign({ userId });

      return reply
        .setCookie('authToken', authToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
        })
        .send({ ...userData, token: authToken });
    } catch (err: any) {
      fastify.log.error('Google auth error:', err);
      return reply.status(500).send({
        error: 'Authentication failed',
        detail: err.message || 'Unknown error',
      });
    }
  });

  // Local Login Route
  fastify.post('/api/login', async (req, reply) => {
    return await proxyToUserService(req, reply, '/api/user/login');
  });

  // Local Signup Route
  fastify.post('/api/signup', async (req, reply) => {
    return await proxyToUserService(req, reply, '/api/user/signup');
  });

  // Helper: Proxy to User Service + Inject JWT Cookie
  const proxyToUserService = async (
    req: FastifyRequest,
    reply: FastifyReply,
    upstreamPath: string
  ) => {
    try {
      const res = await fetch(`${process.env.USER_MANAGEMENT_URL}${upstreamPath}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Accept-Encoding': 'identity' },
        body: JSON.stringify(req.body),
      });

      const encoding = res.headers.get('content-encoding');
      const contentType = res.headers.get('content-type');
      const buf = await res.arrayBuffer();
      let rawBuf = Buffer.from(buf);

      if (!contentType?.includes('application/json')) {
        const text = rawBuf.toString('utf-8');
        console.error('🔥 Upstream error (non-JSON):', text.slice(0, 300));
        return reply.code(502).send({ error: 'Invalid response from upstream' });
      }

      let payload: string;
      try {
        if (encoding === 'br') {
          payload = brotliDecompressSync(rawBuf).toString('utf-8');
        } else if (encoding === 'gzip') {
          payload = gunzipSync(rawBuf).toString('utf-8');
        } else {
          payload = rawBuf.toString('utf-8');
        }
      } catch (err) {
        console.warn('⚠️ Decompress failed:', err);
        payload = rawBuf.toString('utf-8');
      }

      const body = JSON.parse(payload);
      if (!body.id || !body.username) {
        return reply.code(502).send({ error: 'Malformed user data' });
      }

      const token = fastify.jwt.sign({ userId: body.id });
      reply
        .setCookie('authToken', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
        })
        .type('application/json')
        .status(res.status)
        .send({ ...body, token });
    } catch (err) {
      console.error('❌ Proxy handler crashed:', err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  };

  // Proxy: Public Nickname (no auth needed)
  fastify.register(fastifyHttpProxy, {
    upstream: process.env.USER_MANAGEMENT_URL || 'http://user_management:9001',
    prefix: '/api/public/nickname',
    rewritePrefix: '/api/user/public/nickname',
    http2: false,
  });

  // Proxy: Profile & Authenticated User Routes
  fastify.register(fastifyHttpProxy, {
    upstream: process.env.USER_MANAGEMENT_URL || 'http://user_management:9001',
    prefix: '/api/profile',
    rewritePrefix: '/api/user/profile',
    http2: false,
    httpMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    preHandler: async (req, reply) => {
      if (req.method === 'OPTIONS') return;

      // Inject auth from cookie if missing
      if (!req.headers.authorization && req.cookies?.authToken) {
        req.headers.authorization = `Bearer ${req.cookies.authToken}`;
        fastify.log.info('🍪 Injected Authorization from authToken cookie');
      }

      if (!req.headers.authorization) {
        return reply.code(401).send({ error: 'Missing Authorization header' });
      }

      try {
        await req.jwtVerify();
        const userId = (req.user as any)?.userId;
        if (userId) {
          req.headers['x-user-id'] = String(userId);
          fastify.log.info(`📦 Injected x-user-id = ${userId}`);
        }
      } catch (err: any) {
        fastify.log.error('❌ JWT verification failed:', err.message);
        return reply.code(401).send({ error: 'Unauthorized' });
      }
    },
  });

  // Proxy: Game Service (REST)
  const gameServiceUrl = process.env.GAME_SERVICE_URL || 'http://game_service:9002';
  fastify.register(fastifyHttpProxy, {
    upstream: gameServiceUrl,
    prefix: '/api/pong',
    rewritePrefix: '/api/pong',
    httpMethods: ['GET', 'POST'],
    http2: false,
  });

  // Proxy: Game WebSocket
  fastify.register(fastifyHttpProxy, {
    upstream: gameServiceUrl,
    prefix: '/api/pong/game-ws',
    rewritePrefix: '/api/pong/game-ws',
    websocket: true,
    http2: false,
  });

  // onSend: Final payload manipulation (e.g., inject token)
  fastify.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply, payload: string | Buffer | Readable) => {
    const url = (req as any).url || '';
    if (reply.statusCode !== 200) return payload;

    if (['/api/login', '/api/signup'].some(path => url.startsWith(path))) {
      let raw: string;

      if (typeof payload === 'string') {
        raw = payload;
      } else if ((payload as Readable).read) {
        const buffer = await getRawBody(payload as Readable);
        const encoding = reply.getHeader('content-encoding');
        if (encoding === 'br') {
          raw = brotliDecompressSync(buffer).toString('utf-8');
        } else if (encoding === 'gzip') {
          raw = gunzipSync(buffer).toString('utf-8');
        } else {
          raw = buffer.toString('utf-8');
        }
      } else {
        raw = (payload as Buffer).toString('utf-8');
      }

      try {
        const body = JSON.parse(raw);
        if (!body.id || !body.username) return payload;

        const token = fastify.jwt.sign({ userId: body.id });
        reply
          .type('application/json')
          .setCookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
          });

        return JSON.stringify({ ...body, token });
      } catch (err) {
        fastify.log.error('Failed to parse JSON in onSend:', err);
      }
    }

    return payload;
  });
});
/*
import fp from 'fastify-plugin';
import fastifyCookie from 'fastify-cookie'; 
import { gunzipSync, brotliDecompressSync } from 'zlib';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';
***** mergeme-into-renderresponsive
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
****
import { FastifyRequest, FastifyReply } from 'fastify';
import { Buffer } from 'buffer';


const userManagementUrl = process.env.USER_MANAGEMENT_URL || 'http://user_management:9001';
console.log('🚀 USER_MANAGEMENT_URL:', userManagementUrl);
if (!userManagementUrl) {
    throw new Error('USER_MANAGEMENT_URL environment variable is not set');
}



interface OnRequestFastifyRequest extends FastifyRequest {
    method: string;
    headers: { 
        origin?: string;
        [key: string]: any;
    };
}


// Register cookie plugin 


export default fp(async function (fastify: FastifyInstance): Promise<void> {
    fastify.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET || 'supersecret', // optional for signed cookies
    });
    fastify.addHook('onRequest', async (req: OnRequestFastifyRequest, reply: FastifyReply) => {
        const allowedOrigin = process.env.API_FRONTEND_URL || 'https://frontend-7nt4.onrender.com';
        if (req.headers.origin === allowedOrigin) {
            reply.header('Access-Control-Allow-Origin', allowedOrigin);
            reply.header('Access-Control-Allow-Credentials', 'true');
            reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
              //  reply.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        }
        if (req.method === 'OPTIONS') {
            reply.code(200).send();
            return;
        }
    });

    
    fastify.get('/health', async (req: FastifyRequest, reply: FastifyReply): Promise<{ status: string }> => {
        return { status: 'ok' };
    });
    

fastify.post('/api/login', async (req: FastifyRequest<{ Body: { username: string; password: string } }>, reply: FastifyReply) => {
  try {
    const res = await fetch(`${userManagementUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify(req.body),
    });

    const encoding = res.headers.get('content-encoding');
    const contentType = res.headers.get('content-type');
    const buf = await res.arrayBuffer();
    let rawBuf = Buffer.from(buf);

    if (!contentType?.includes('application/json')) {
      const text = rawBuf.toString('utf-8');
      console.error('🔥 Upstream error response (non-JSON):', text.slice(0, 300));
      return reply.code(502).send({ error: 'Invalid response from upstream service' });
    }
    let payload: string;
    try {
      if (encoding === 'br') {
        console.log('🧊 Brotli decompressing login response...');
        payload = brotliDecompressSync(rawBuf).toString('utf-8');
      } else if (encoding === 'gzip') {
        console.log('🔄 Gzip decompressing login response...');
        payload = gunzipSync(rawBuf).toString('utf-8');
      } else {
        console.log('📦 No compression detected or decoding not needed.');
        payload = rawBuf.toString('utf-8');
      }
    } catch (err) {
      console.warn('⚠️ Failed to decompress:', err);
      payload = rawBuf.toString('utf-8'); // fallback to rawBuf
    }

    // const raw = rawBuf.toString('utf-8');
    let json;
    try {
      json = JSON.parse(payload);
    } catch (err) {
      console.error('❌ Failed to parse JSON from upstream:', err);
      return reply.code(502).send({ error: 'Invalid JSON response from upstr eam' });
    }

    const token = fastify.jwt.sign({ userId: json.id });

    reply
      .setCookie('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      })
      .type('application/json')
      .send({ ...json, token });

  } catch (err) {
    console.error('❌ Login handler crashed:', err);
    reply.code(500).send({ error: 'Internal Server Error during login' });
  }
});

    fastify.post('/api/signup', async (req: FastifyRequest<{ Body: { username: string; password: string } }>, reply: FastifyReply) => {

  try {
    const res = await fetch(`${userManagementUrl}/api/user/signup`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify(req.body),
    });

    const encoding = res.headers.get('content-encoding');
    const contentType = res.headers.get('content-type');
    const buf = await res.arrayBuffer();
    let rawBuf = Buffer.from(buf);

    if (!contentType?.includes('application/json')) {
      const text = rawBuf.toString('utf-8');
      console.error('🔥 Upstream error response (non-JSON):', text.slice(0, 300));
      return reply.code(502).send({ error: 'Invalid response from upstream service' });
    }

    let payload: string;
    try {
      const encoding = res.headers.get('content-encoding');
      if (encoding === 'br') {
        console.log('🧊 Brotli decompressing signup response...');
        payload = brotliDecompressSync(rawBuf).toString('utf-8');
      } else if (encoding === 'gzip') {
        console.log('🔄 Gzip decompressing signup response...');
        payload = gunzipSync(rawBuf).toString('utf-8');
      } else {
        console.log('📦 No compression detected or decoding not needed.');
        payload = rawBuf.toString('utf-8');
      }
    } catch (err) {
      console.warn('⚠️ Failed to decompress:', err);
      return reply.code(502).send({ error: 'Decompression error from upstream' });
    }
  
    let json;
    try {
      json = JSON.parse(payload);
    } catch (err) {
      console.error('❌ Failed to parse JSON from upstream:', err);
      return reply.code(502).send({ error: 'Invalid JSON response from upstream' });
    }

    const token = fastify.jwt.sign({ userId: json.id });

    reply
      .setCookie('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      })
      .type('application/json')
      .send({ ...json, token });

  } catch (err) {
    console.error('❌ Signup handler crashed:', err);
    reply.code(500).send({ error: 'Internal Server Error during signup' });
  }
});
    
**** render-responsiv
    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/public/nickname',
        rewritePrefix: '/api/user/public/nickname',
        http2: false,
    });
**** mergeme-into-renderresponsive
****


**** render-responsiv
    fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/profile',
        rewritePrefix: '/api/user/profile',
        http2: false,
        httpMethods: ['GET', 'POST', 'PUT', 'DELETE'],
**** mergeme-into-renderresponsive
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
****
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
            console.log('🧪 req.url:', req.url);
            console.log('🧪 req.raw.url:', req.raw.url);


            const auth = req.headers['authorization'];

            if (!auth && req.cookies?.authToken) {
                req.headers.authorization = `Bearer ${req.cookies.authToken}`;
                console.log('🍪 Injected Authorization header from authToken cookie')
**** render-responsiv
            }
            console.log('🚀 rewriteRequestHeaders - forwarded auth:', req.headers.authorization);
            console.log('🔐🔐 Authorization Header:', req.headers['authorization']);
            if (!req.headers['authorization']) {
                console.warn('❌ No Authorization header found in request');
                return reply.code(401).send({ error: 'Missing Authorization header' });
            }

            try {
                console.log('🔍🔐 JWT Secret in use:', process.env.JWT_SECRET);
****mergeme-into-renderresponsive
                await req.jwtVerify();
                console.log("🔐 Verified JWT in proxy preHandler");
                const userId = (req.user as any)?.userId;
****
                console.log(`🔍🔐 Authorization header: ${auth}`);
                console.log(`🔍🔐 cookie 🍪🍪 Authorization header: ${req.headers.authorization} 🍪🍪`);
                await req.jwtVerify();
                console.log("🔐 Verified JWT in proxy preHandler");
                const userId = (req as FastifyRequest).user?.userId;
**** render-responsiv
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
**** mergeme-into-renderresponsive
****
    const gameServiceUrl = process.env.GAME_SERVICE_URL || 'http://game_service:9002';
**** render-responsiv
    fastify.register(fastifyHttpProxy, {
        upstream: gameServiceUrl,
        prefix: '/api/pong',
        rewritePrefix: '/api/pong',
        httpMethods: ['GET'],
        http2: false,
    });
    fastify.register(fastifyHttpProxy, {
        upstream: gameServiceUrl,
        prefix: '/api/pong',
        rewritePrefix: '/api/pong',
        httpMethods: ['POST'],
        http2: false,
**** mergeme-into-renderresponsive
****

    });
**** render-responsiv

    });
    fastify.register(fastifyHttpProxy, {
        upstream: gameServiceUrl,
        prefix: '/api/pong/game-ws',
        rewritePrefix: '/api/pong/game-ws',
        httpMethods: ['GET'],
        websocket: true,
        http2: false,
**** mergeme-into-renderresponsive

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
****
    });


    interface OnSendRequest extends FastifyRequest {
        url: string;
    }

    interface LoginSignupResponseBody {
        id?: string;
        username?: string;
        [key: string]: any;
    }

    fastify.addHook('onSend', async (
        req: OnSendRequest,
        reply: FastifyReply,
        payload: string | Buffer | Readable
    ): Promise<string | Buffer | Readable> => {
        console.log(`📡 [onSend] URL: ${req.url}, statusCode: ${reply.statusCode}`);//debug log
        if ((req.url.startsWith('/api/login') || req.url.startsWith('/api/signup') || req.url.startsWith('/api/profile')) && reply.statusCode === 200) {
            try {
              // Only decode in dev if payload is a string
              if (typeof payload === 'string') {
                console.log('📝 Payload is string');
                const body: LoginSignupResponseBody = JSON.parse(payload);
                if (!body.id || !body.username) return payload;
                const token = fastify.jwt.sign({ userId: body.id });
                reply.type('application/json');
                return JSON.stringify({ ...body, token });
              }

              const contentType = reply.getHeader('content-type');
              if (
                  (payload as Readable)?.read &&
                  typeof contentType === 'string' &&
                  contentType.includes('application/json')
                ) {
                console.log('📦 Payload is Readable stream');

                const rawBuffer: Buffer = await getRawBody(payload as Readable);
                
                const encoding = reply.getHeader('content-encoding');
                let raw: string;

                if (typeof encoding === 'string') {
                    if (encoding.includes('gzip')) {
                        try {
                            console.log('🔄 Decompressing gzip stream...');
                            const decompressed = gunzipSync(rawBuffer);
                            raw = decompressed.toString('utf-8');
                            console.log('✅ GZIP Decompressed:', raw.slice(0, 200));
                        } catch (err) {
                            console.warn('❌ Failed to decompress gzip stream:', err);
                            raw = rawBuffer.toString('utf-8');
                        }
                    } else if (encoding.includes('br')) {
                        try {
                            console.log('🧊 Decompressing Brotli stream...');
                            const decompressed = brotliDecompressSync(rawBuffer);
                            raw = decompressed.toString('utf-8');
                            console.log('✅ Brotli Decompressed:', raw.slice(0, 200));
                        } catch (err) {
                            console.warn('❌ Failed to decompress Brotli stream:', err);
                            raw = rawBuffer.toString('utf-8');
                        }
                    } else {
                        raw = rawBuffer.toString('utf-8');
                    }
                } else {
                    raw = rawBuffer.toString('utf-8');
**** render-responsiv
                }
               
                //console.log('📜 Raw body from stream:', raw);//deleteme
                try {
                  const body: LoginSignupResponseBody = JSON.parse(raw);
                  //console.log('🧾 Parsed JSON from stream:', body);
                  if (req.url.startsWith('/api/profile')) {
                      console.log('🧾 Profile response, skipping token injection');
                      reply
                        .type('application/json')
                        .header('content-encoding', null);
                      return JSON.stringify(body);
                    }
                  if (!body.id || !body.username) {
                    console.log('⚠️ Missing id or username, returning raw JSON without token');
                    return typeof raw === 'string' ? raw : JSON.stringify(body);
                  }

                const token = fastify.jwt.sign({ userId: body.id });
                reply
                    .type('application/json')
                    .setCookie('authToken', token, {
                      path: '/',
                      httpOnly: true,
                      secure: true,
                      sameSite: 'none',
                    });
                return JSON.stringify({ ...body, token });
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

        return payload;
    });
});
*/

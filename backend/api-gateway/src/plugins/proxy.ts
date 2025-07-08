import fp from 'fastify-plugin';
import fastifyCookie from 'fastify-cookie'; 
import { gunzipSync, brotliDecompressSync } from 'zlib';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyInstance } from 'fastify';
import getRawBody from 'raw-body';
import { Readable } from 'stream';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Buffer } from 'buffer';

const userManagementUrl = process.env.USER_MANAGEMENT_URL || 'http://user_management:9001';
console.log('🚀 USER_MANAGEMENT_URL:', userManagementUrl);
if (!userManagementUrl) {
    throw new Error('USER_MANAGEMENT_URL environment variable is not set');
}

/* interface ProxyReplyOptions {
    rewriteRequestHeaders: (req: import('fastify').FastifyRequest, headers: Record<string, any>) => Record<string, any>;
}

interface LoginSignupPayload {
    id?: string;
    username?: string;
    [key: string]: any;
} */

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
    

    /* fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/login',
        rewritePrefix: '/api/user/login',
        http2: false,
    });
 */
// fastify.post('/api/login', async (req, reply) => {
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
    console.error('❌ Login handler crashed:', err);
    reply.code(500).send({ error: 'Internal Server Error during login' });
  }
});
    /* fastify.register(fastifyHttpProxy, {
        upstream: userManagementUrl,
        prefix: '/api/signup',
        rewritePrefix: '/api/user/signup',
        http2: false
    }); */

    //fastify.post('/api/signup', async (req, reply) => {
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
    /* try {
      if (encoding === 'br') {
        console.log('🧊 Brotli decompressing signup response...');
        rawBuf = brotliDecompressSync(rawBuf);
      } else if (encoding === 'gzip') {
        console.log('🔄 Gzip decompressing signup response...');
        rawBuf = gunzipSync(rawBuf);
      } else {
        console.log('📦 No compression detected or decoding not needed.');
      }
    } catch (err) {
      console.warn('⚠️ Failed to decompress:', err);
      return reply.code(502).send({ error: 'Decompression error from upstream' });
      // fallback to rawBuf
    } */

    // const raw = rawBuf.toString('utf-8');
    // const json = JSON.parse(raw);
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
            console.log('🧪 req.url:', req.url);
            console.log('🧪 req.raw.url:', req.raw.url);


            const auth = req.headers['authorization'];

            if (!auth && req.cookies?.authToken) {
                req.headers.authorization = `Bearer ${req.cookies.authToken}`;
                console.log('🍪 Injected Authorization header from authToken cookie')
            }
            console.log('🚀 rewriteRequestHeaders - forwarded auth:', req.headers.authorization);
            console.log('🔐🔐 Authorization Header:', req.headers['authorization']);
            if (!req.headers['authorization']) {
                console.warn('❌ No Authorization header found in request');
                return reply.code(401).send({ error: 'Missing Authorization header' });
            }

            try {
               // console.log('🔍🔐 Raw Authorization Header:', JSON.stringify(req.headers.authorization));
                console.log('🔍🔐 JWT Secret in use:', process.env.JWT_SECRET);
                console.log(`🔍🔐 Authorization header: ${auth}`);
                console.log(`🔍🔐 cookie 🍪🍪 Authorization header: ${req.headers.authorization} 🍪🍪`);
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

 /*    fastify.addHook('onRequest', async (req: OnRequestFastifyRequest, reply: FastifyReply): Promise<void> => {
        reply.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        reply.header('Access-Control-Allow-Credentials', 'true');
    }); */

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
                }
               
                console.log('📜 Raw body from stream:', raw);
                try {
                  const body: LoginSignupResponseBody = JSON.parse(raw);
                  console.log('🧾 Parsed JSON from stream:', body);
                  if (req.url.startsWith('/api/profile')) {
                      console.log('🧾 Profile response, skipping token injection');
                      reply
                        .type('application/json')
                        .header('content-encoding', null);
                      return JSON.stringify(body);
                      // return body;
                    }
                  if (!body.id || !body.username) {
                    console.log('⚠️ Missing id or username, returning raw JSON without token');
                    return typeof raw === 'string' ? raw : JSON.stringify(body);
                  }

                  const token = fastify.jwt.sign({ userId: body.id });
                  console.log('🔑 Token generated:', token);
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
                  console.warn('❌ Not JSON (probably compressed or encrypted), skipping JWT injection.');
                  console.warn('🔎 Raw body (truncated):', raw?.slice?.(0, 300));
                  reply.type('application/json');
                  return raw;
                }
              }
              console.log('ℹ️ Payload is unknown type, returning as is');
              return payload;
            } catch (e) {
              console.error('🛑 Error in onSend:', e);
              return payload;
            }
        }
            // debugg until 249 
            if (typeof payload === 'string') {
                console.log('✅ Final payload returned to client (string):', payload);
            } else if (Buffer.isBuffer(payload)) {
                console.log('✅ Final payload returned to client (buffer):', payload.toString());
            } else if (typeof payload === 'object') {
                try {
                    console.log('✅ Final payload returned to client (json):', JSON.stringify(payload));
                } catch {
                    console.log('✅ Final payload returned to client (object):', payload);
                }
            } else {
                console.log('✅ Final payload returned to client (unknown type):', payload);
            }
            console.log('↪️ About to return payload of type:', typeof payload);
        return payload;
    });
});


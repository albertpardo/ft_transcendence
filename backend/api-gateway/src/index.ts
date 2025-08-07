
/// <reference path="./types/fastify-jwt.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
require('dotenv').config({ path: __dirname + '/../.env' }); 
const Fastify = require('fastify');
const http = require('http');
const fastifyJWT = require('@fastify/jwt');
const { jwt, authHook } = require('./plugins/jwt');
const fastifyRateLimit = require('@fastify/rate-limit');
const fastifyCors = require('@fastify/cors');
const { tlsConfig } = require('./config/tls')
// const proxyPlugin = require('@fastify/http-proxy');
const proxyPlugin = require('./plugins/proxy');
const { rateLimitPlugin } = require('./plugins/rateLimit');
const exampleRoutes = require('./routes/example');
const isDev = process.env.NODE_ENV === 'development';
import fortyTwoAuthPlugin from './plugins/fortytwo';
import { rewriteRequestHeaders } from './middlewares/auth';

const server = isDev
    ? Fastify({
        logger: {
            level: 'debug',
        },
        https: tlsConfig,
        // ignoreTrailingSlash: true
    })
    : Fastify({
        logger: true,
        ignoreTrailingSlash: true
    });

const healthServer = Fastify({
    logger: false,
    ignoreTrailingSlash: true
});


interface HealthResponse {
    status: string;
    timestamp: string;
    processId: number;
}

healthServer.route({
    method: ['GET', 'HEAD'],
    url: '/health',
    handler: (_: FastifyRequest, reply: FastifyReply) => {
        reply.header('Cache-Control', 'no-cache');
        const response: HealthResponse = { 
            status: 'ok',
            timestamp: new Date().toISOString(),
            processId: process.pid
        };
        return reply.code(200).send(response);
    }
});

interface RootHealthResponse {
    status: string;
    timestamp: string;
    processId: number;
}

healthServer.route({
    method: ['GET', 'HEAD'],
    url: '/',
    handler: (_: FastifyRequest, reply: FastifyReply): FastifyReply => {
        reply.header('Cache-Control', 'no-cache');
        const response: RootHealthResponse = { 
            status: 'ok',
            timestamp: new Date().toISOString(),
            processId: process.pid
        };
        return reply.code(200).send(response);
    }
});

interface RenderDebugConnectionInfo {
    remoteAddress: string | undefined;
    localPort: number | undefined;
}

interface RenderDebugResponse {
    headers: Record<string, any>;
    connection: RenderDebugConnectionInfo;
    time: Date;
}

healthServer.get('/render-debug', (request: FastifyRequest, reply: FastifyReply) => {
    const connection: RenderDebugConnectionInfo = {
        remoteAddress: request.socket?.remoteAddress,
        localPort: request.socket?.localPort
    };
    const response: RenderDebugResponse = {
        headers: request.headers,
        connection,
        time: new Date()
    };
    reply.send(response);
}); 

async function registerPlugin() {
    interface CorsOriginCallback {
        (err: Error | null, allow?: boolean): void;
    }

    interface CorsOptions {
        origin: (origin: string | undefined, cb: CorsOriginCallback) => void;
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
        preflightContinue: boolean;
        optionsSuccessStatus: number;
    }

    
    await server.register(fastifyCors, {
      //origin: '*',
      origin: (origin: string | undefined, cb: CorsOriginCallback) => {
        try {
          if (!origin) return cb(null, true);
          
          const allowedOrigins = new Set([
            "https://frontend-7nt4.onrender.com",
            "https://localhost:3000",
            "http://localhost:3000",
            "https://127.0.0.1:3000",
            "http://127.0.0.1:3000"
          ]);
          
          if (allowedOrigins.has(origin)) {
            cb(null, true);
          } else {
            console.error(`CORS blocked request from origin: ${origin}`);
            cb(new Error("Not allowed by CORS"), false);
          }
        } catch (err) {
          console.error("CORS error:", err);
          cb(new Error("CORS processing error"), false);
        }
      },

      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Access-Control-Allow-Origin",
        "Content-Type",
        "Authorization",
        "Upgrade",
        "use-me-to-authorize",
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    //JWT middleware 
    server.addHook("onRequest", rewriteRequestHeaders);
    await server.register(jwt)
    await server.register(rateLimitPlugin)
    await server.register(authHook)
    await server.register(proxyPlugin)
    await server.register(fortyTwoAuthPlugin);
}

//start service (using HTTPS)
async function start() {
    if (process.env.NODE_ENV === 'production') {
        console.log("🚀 Fastify is booting up...");
    }
    try {
    await healthServer.listen({
        port: Number(process.env.HEALTH_PORT),
        host: '0.0.0.0',
        listenTextResolver: (address: string): string => {
            // This verifies the actual bound address
            console.log(`ACTUAL BINDING: ${address}`);
            return `Health server listening on ${address}`;
        }
    });

        await registerPlugin()

        //register routes
        await server.register(exampleRoutes, { prefix: '/api' })

        // print all the routes
        await server.ready();
        const address = await server.listen({ port: Number(process.env.PORT), host: '0.0.0.0' });
        server.log.info(`Server listening on ${address}`)

        console.log(`HTTP health check server listening on ${process.env.HEALTH_PORT}`);
        console.log(server.printRoutes());
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()

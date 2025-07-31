
/// <reference path="./types/fastify-jwt.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
require('dotenv').config({ path: __dirname + '/../.env' }); 
const Fastify = require('fastify');

import fastifyJWT from '@fastify/jwt';
import googleAuthPlugin from './services/google';
import { jwt, authHook } from './plugins/jwt';
const fastifyRateLimit = require('@fastify/rate-limit');
const fastifyCors = require('@fastify/cors');
const { tlsConfig } = require('./config/tls')
//import fastifyHttpProxy from '@fastify/http-proxy';
import proxyPlugin from './plugins/proxy';
import * as fs from 'fs';
import * as path from 'path';
import fastifyCookie from '@fastify/cookie';

console.log('🔐 TLS Key type:', typeof tlsConfig.key);
console.log('🔐 TLS Cert type:', typeof tlsConfig.cert);
console.log('🔐 TLS Key length:', tlsConfig.key?.length);
console.log('🔐 TLS Cert length:', tlsConfig.cert?.length);

const http = require('http');





/* const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
  };
  */
 //const fastify = require('fastify')({ logger: true, https: httpsOptions });
 delete require.cache[require.resolve('./middlewares/auth')];
 
 if (!tlsConfig.key || !tlsConfig.cert) {
   console.error('❌ TLS config is missing key or cert');
   
 }
 
 if (typeof tlsConfig.key !== 'string' || typeof tlsConfig.cert !== 'string') {
   console.error('❌ TLS key or cert is not a string');
 }
const { rateLimitPlugin } = require('./plugins/rateLimit');
const exampleRoutes = require('./routes/example');

console.log('🔐 TLS Key length:', tlsConfig.key?.length);
console.log('🔐 TLS Cert length:', tlsConfig.cert?.length);
/*
const server = Fastify({
    logger: true,
    https: tlsConfig,
})*/
const isDev = process.env.NODE_ENV === 'development';

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


async function registerPlugin() {

    
    await server.register(fastifyCors, {
          origin: (origin: string | undefined, cb: CorsOriginCallback) => {

            if (!origin) return cb(null, true);

            const allowedOrigins = new Set([
                'https://frontend-7nt4.onrender.com',
                'https://localhost:3000',
                'http://localhost:3000',
                'https://127.0.0.1:3000',
                'https://your-app.onrender.com',
                'http://127.0.0.1:3000',
                '*',
            ]);
            if (allowedOrigins.has(origin)) {
                cb(null, true);
            } else {
                cb(new Error("Not allowed by CORS"), false);
            }
        }, 

        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Access-Content-Allow-Origin',
            'Content-Type',
            'Authorization',
            'Upgrade',
            'use-me-to-authorize',
        ],
        preflightContinue: false,
        optionsSuccessStatus: 204
    })
    await server.register(jwt);
    await server.register(fastifyCookie, {
     secret: process.env.COOKIE_SECRET || 'super-secret-key-for-signing-cookies',
     parseOptions: {}
   });
    await server.register(rateLimitPlugin);
    await server.register(authHook);
    await server.register(googleAuthPlugin);
    await server.register(proxyPlugin); //JWT middleware 
   
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

        /* server.listen({ port:8443, host: '0.0.0.0' }, (err: Error, address: string) => {
            if (err) {
                server.log.error(err)
                process.exit(1)
            }
            server.log.info(`Server listening on ${address}`)
        })
 */        console.log(`HTTP health check server listening on ${process.env.HEALTH_PORT}`);
        console.log(server.printRoutes());
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()

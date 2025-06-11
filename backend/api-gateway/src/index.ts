
/// <reference path="./types/fastify-jwt.d.ts" />
require('dotenv').config({ path: __dirname + '/../.env' });
const Fastify = require('fastify');
const http = require('http');
import fastifyJWT from '@fastify/jwt';
import { jwt, authHook } from './plugins/jwt';
const fastifyRateLimit = require('@fastify/rate-limit');
const fastifyCors = require('@fastify/cors');
const { tlsConfig } = require('./config/tls')
//import fastifyHttpProxy from '@fastify/http-proxy';
import proxyPlugin from './plugins/proxy';

//delete require.cache[require.resolve('./middlewares/auth')];

const { rateLimitPlugin } = require('./plugins/rateLimit');
const exampleRoutes = require('./routes/example');

const server = Fastify ({
    logger: {
        level: 'info',
    },
    https: tlsConfig,
})

const healthServer = Fastify({
    // logger: true,
    logger: false,
    ignoreTrailingSlash: true
});
/* const healthResponse = () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),  // Fixed typo in "timestamp"
    uptime: process.uptime()
}); */

/* healthServer.get('/health', async () => {
    return { 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };

});

healthServer.get('/', async () => {
    return {
        status: 'ok',
        timestap: new Date().toISOString(),
        uptime: process.uptime()
    };
}); */

healthServer.route({
    method: ['GET', 'HEAD'],
    url: '/health',
    handler: (_, reply) => {
        reply.header('Cache-Control', 'no-cache');
        return reply.code(200).send({ 
            status: 'ok',
            timestamp: new Date().toISOString(),
            processId: process.pid
        });
    }
});

healthServer.route({
    method: ['GET', 'HEAD'],
    url: '/',
    handler: (_, reply) => {
        reply.header('Cache-Control', 'no-cache');
        return reply.code(200).send({ 
            status: 'ok',
            timestamp: new Date().toISOString(),
            processId: process.pid
        });
    }
});

healthServer.get('/render-debug', (_, reply) => {
    reply.send({
        headers: _.headers,
        connection: {
            remoteAddress: _.socket.remoteAddress,
            localPort: _.socket.localPort
        },
        time: new Date()
    });
}); 

async function registerPlugin() {
    await server.register(fastifyCors, {
        origin: (origin, cb) => {
        const allowedOrigins = new Set([
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://localhost:3000',
            'https://127.0.0.1:3000'
        ]);
            // allow no origin (like curl) or dev frontend origins
        if (!origin || allowedOrigins.has(origin)) {
              cb(null, true);
            } else {
              cb(new Error("Not allowed by CORS"), false);
            }
          },

        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//        allowedHeaders: 'Access-Content-Allow-Origin,Content-Type,Authorization,Upgrade,use-me-to-authorize',
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
    //JWT middleware
    await server.register(jwt)
    await server.register(rateLimitPlugin)
    await server.register(authHook)
    await server.register(proxyPlugin)
}

//start service (using HTTPS)
async function start() {
    try {
        // const HEALTH_PORT = process.env.RENDER ? 10000 : 8080;
        const HEALTH_PORT = 10000;
        // await healthServer.listen({ port: 8080, host: '0.0.0.0' });
      //  await healthServer.listen({ port: HEALTH_PORT, host: '0.0.0.0' });
    await healthServer.listen({
        port: HEALTH_PORT,
        host: '0.0.0.0',
        listenTextResolver: (address) => {
        // This verifies the actual bound address
        console.log(`ACTUAL BINDING: ${address}`);
        return `Health server listening on ${address}`;
        }
    });

        await registerPlugin()

        //register routes
        await server.register(exampleRoutes, { prefix: '/api' })

        // print all the routes
        await server.ready()
        server.listen({ port:8443, host: '0.0.0.0' }, (err: Error, address: string) => {
            if (err) {
                server.log.error(err)
                process.exit(1)
            }
            server.log.info(`Server listening on ${address}`)
        })
        console.log(`HTTP health check server listening on ${HEALTH_PORT}`);
        console.log(server.printRoutes());
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()

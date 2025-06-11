
/// <reference path="./types/fastify-jwt.d.ts" />
require('dotenv').config({ path: __dirname + '/../.env' });
const Fastify = require('fastify');
import fastifyJWT from '@fastify/jwt';
import { jwt, authHook } from './plugins/jwt';
const fastifyRateLimit = require('@fastify/rate-limit');
const fastifyCors = require('@fastify/cors');
const { tlsConfig } = require('./config/tls')
//import fastifyHttpProxy from '@fastify/http-proxy';
import proxyPlugin from './plugins/proxy';

delete require.cache[require.resolve('./middlewares/auth')];

const { rateLimitPlugin } = require('./plugins/rateLimit');
const exampleRoutes = require('./routes/example');

const server = Fastify ({
    logger: true,
    https: tlsConfig,
})

//register plugins
async function registerPlugin() {
    await server.register(fastifyCors, {
        origin: (origin, cb) => {
            // allow no origin (like curl) or dev frontend origins
            if (!origin || [
              'http://localhost:3000', 
              'http://127.0.0.1:3000',
              'https://localhost:3000', 
              'https://127.0.0.1:3000'
                ].includes(origin)) {
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
        await registerPlugin()

        //register routes
        await server.register(exampleRoutes, { prefix: '/api' })

        // print all the routes
        await server.ready()
        console.log(server.printRoutes())
        server.listen({ port:8443, host: '0.0.0.0' }, (err: Error, address: string) => {
            if (err) {
                server.log.error(err)
                process.exit(1)
            }
            server.log.info(`Server listening on ${address}`)
        })
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()


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

// what i want:
/*     fastify.options('*', async (request, reply) => {
        reply
            .header('Access-Control-Allow-Origin', '*')
            .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
            .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            .header('Access-Control-Allow-Credentials', 'true')
            .code(204)
            .send();
    });
    */

//register plugins
async function registerPlugin() {
    await server.register(fastifyCors, {
    //    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        origin: "*",
//        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
        allowedHeaders: 'Content-Type,Authorization',
    })
    //JWT middleware
    await server.register(jwt)
    await server.register(rateLimitPlugin)

    await server.register(authHook)

    console.log("if you get here, then it should start working!");
    await server.register(proxyPlugin)
    console.log("if you get here, then it should stop working!");
}

//start service (using HTTPS)
async function start() {
    try {
        await registerPlugin()

        //register routes
        server.register(exampleRoutes, { prefix: '/api' })

        // print all the routes
        await server.ready()
        console.log(server.printRoutes())
        server.listen({ port:8443 }, (err: Error, address: string) => {
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

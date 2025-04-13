//require('dotenv').config();
/// <reference path="./types/fastify-jwt.d.ts" />
require('dotenv').config({ path: __dirname + '/../.env' });
const Fastify = require('fastify');
//const fastifyJWT = require('@fastify/jwt');
import fastifyJWT from '@fastify/jwt';
//import { authHookPlugin } from './plugins/jwt';
import { jwt, authHook } from './plugins/jwt';
const fastifyRateLimit = require('@fastify/rate-limit');
const fastifyCors = require('@fastify/cors');
const { tlsConfig } = require('./config/tls')

delete require.cache[require.resolve('./middlewares/auth')];
//const { authMiddleware } = require('./middlewares/auth');
//const { jwtPlugin } = require('./plugins/jwt');
const { rateLimitPlugin } = require('./plugins/rateLimit');
const exampleRoutes = require('./routes/example');

const server = Fastify ({
    logger: true,
    https: tlsConfig,
})

//register plugins
async function registerPlugin() {
    await server.register(fastifyCors, {
    //    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
    })
    await server.register(jwt)
    await server.register(rateLimitPlugin)

    await server.register(authHook)
}

//start service (using HTTPS)
async function start() {
    try {
        await registerPlugin()

        //JWT middleware
//        server.addHook('onRequest', authMiddleware)
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

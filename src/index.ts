const Fastify = require('fastify');
const fastifyJWT = require('@fastify/jwt');
const fastifyRateLimit = require('@fastify/rate-limit');
const fastifyCors = require('@fastify/cors');
/*
const fs = require('fs');
const path = require('path');
*/
const { tlsConfig } = require('./config/tls')

const { authMiddleware } = require('./middlewares/auth');
const { jwtPlugin } = require('./plugins/jwt');
const { rateLimitPlugin } = require('./plugins/rateLimit');
const exampleRoutes = require('./routes/example');
//import Fastify from 'fastify'
//import fastifyJWT from '@fastify/jwt'
//import fastifyRateLimit from '@fastify/rate-limit'
//import fastifyCors from '@fastify/cors'
//import fs from 'fs'
//import path from 'path'

//import { authMiddleware } from './middlewares/auth.ts'
//import { jwtPlugin } from './plugins/jwt.ts'
//import { rateLimitPlugin } from './plugins/rateLimit.ts'
//import exampleRoutes from './routes/example.ts'

/*
const tlsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
}
*/

const server = Fastify ({
    logger: true,
    https: tlsConfig,
})

//register plugins
async function registerPlugin() {
    await server.register(fastifyCors)
    await server.register(jwtPlugin)
    await server.register(rateLimitPlugin)
}

//JWT middleware
server.addHook('onRequest', authMiddleware)

//register routes
server.register(exampleRoutes, { prefix: '/api' })

//start service (using HTTPS)
async function start() {
    try {
        await registerPlugin()
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

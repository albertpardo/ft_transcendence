
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

import { getLogTransportConfig } from '../dist/pino_utils/logTransportConfig';

const appName = "api_gateway"

//const pino = require('pino');
//const logger = pino(getLogTransportConfig());

/*
const server = Fastify ({
    logger: true,
    https: tlsConfig,
})
*/

const server = Fastify ({
    logger: {
      transport: getLogTransportConfig(),
      base: {
        appName: appName
      },
    },
    https: tlsConfig,
});


//register plugins
/*
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
*/

async function registerPlugin() {
    await server.register(fastifyCors, {
        origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
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
        //console.log(server.printRoutes())
		//sever.log.info(server.printRoutes())   // by apardo  da error porque lleva mucho tiempo
        server.listen({ port:8443, host: '0.0.0.0' }, (err: Error, address: string) => {
            if (err) {
                server.log.error(err)
                process.exit(1)
            }
           // server.log.info(`Server listening on ${address}`)
            server.log.info({
			  source: "start function",
			},`Server listening on ${address}`)
        })

		//console.log.info("Mi mensaje------------<>");
		server.log.info({
			source: "start function",
		},"---Start () info ----")

    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()

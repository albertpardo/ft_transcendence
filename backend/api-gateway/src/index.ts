
/// <reference path="./types/fastify-jwt.d.ts" />
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

/*  by apardo-m
console.log('🔐 TLS Key type:', typeof tlsConfig.key);
console.log('🔐 TLS Cert type:', typeof tlsConfig.cert);
console.log('🔐 TLS Key length:', tlsConfig.key?.length);
console.log('🔐 TLS Cert length:', tlsConfig.cert?.length);
*/

/* const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
  };
 */
/* by apardo-m
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

const server = Fastify({
    logger: true,
    https: tlsConfig,
})
*/

// Start by apardo-m
const { rateLimitPlugin } = require('./plugins/rateLimit');
const exampleRoutes = require('./routes/example');
// End by apardo-m

// Start by apardo-m for LOGS
import { getLogTransportConfig } from '../dist/pino_utils/logTransportConfig';
import { logFormat } from './pino_utils/log_format';
import { MICRO_NAME } from './pino_utils/constants';
import responseLogger from './pino_utils/plugings/response-logger';
// End by apardo-m

// Start by apardo-m for LOGS
const server = Fastify({
    logger: {
        transport: getLogTransportConfig(),
        base: {
            appName: MICRO_NAME
        },
    },
    https: tlsConfig,
});
// End by apardo-m

// Start by apardo-m for LOGS
const localSource = "index.ts"

server.log.info(...logFormat( localSource, '🔐 TLS Key type:', typeof tlsConfig.key));
server.log.info(...logFormat( localSource, '🔐 TLS Cert type:', typeof tlsConfig.cert));
server.log.info(...logFormat( localSource, '🔐 TLS Key length:', tlsConfig.key?.length));
server.log.info(...logFormat( localSource, '🔐 TLS Cert length:', tlsConfig.cert?.length));
// End by apardo-m

//register plugins
async function registerPlugin() {
     await server.register(fastifyCors, {
        origin: (origin, cb) => {
            // allow no origin (like curl) or dev frontend origins
            if (!origin || [
              'http://localhost:3000', 
              'http://127.0.0.1:3000',
              'https://localhost:3000', 
              'https://127.0.0.1:3000',
              'https://your-app.onrender.com'
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
    await server.register(jwt);
    await server.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET || 'super-secret-key-for-signing-cookies',
      parseOptions: {}
    });
    await server.register(rateLimitPlugin);
    await server.register(authHook);
    await server.register(googleAuthPlugin);
    await server.register(proxyPlugin);
    await server.register(responseLogger); // apardo-m 
}

//start service (using HTTPS)
async function start() {
	const source = start.name;

    try {
        await registerPlugin()

        //register routes
        await server.register(exampleRoutes, { prefix: '/api' })

        // print all the routes
        await server.ready()
        //console.log(server.printRoutes())
        server.log.info(...logFormat(source, server.printRoutes()));
        server.listen({ port:8443, host: '0.0.0.0' }, (err: Error, address: string) => {
            if (err) {
                server.log.error(err)
                process.exit(1)
            }
           // server.log.info(`Server listening on ${address}`)
           server.log.info(...logFormat(source, server.printRoutes()));
        })
    } catch (err) {
       // server.log.error(err)
        server.log.error(...logFormat(source, err));
        process.exit(1)
    }
}

start()

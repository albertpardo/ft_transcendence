const fastify = require('fastify')({ logger: true });
//const seen2faRoute = require('./routes/seen2fa');
const path = require('path');
import dotenv from 'dotenv';
dotenv.config();
//require('dotenv').config(); // for commonJS

// allow cors (for development)
fastify.register(require('fastify-cors'), {
  origin: '*'
});

// register routes
//fastify.register(seen2faRoute);
fastify.register(require('./routes/seen2fa'));
fastify.register(require('./routes/enable'));
fastify.register(require('./routes/verify'));
fastify.register(require('./routes/disable'));
fastify.register(require('./routes/status'));
fastify.register(require('./routes/skip'));
fastify.register(require('./routes/finalize'));


// start
const start = async () => {
  try {
    await fastify.listen({ port: 9003, host: '0.0.0.0' });
    console.log('Auth service running on port 9003');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

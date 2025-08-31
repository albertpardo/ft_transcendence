require('dotenv').config();
//const fastify = require('fastify')({ logger: true });

//Start by apardo-m
const { MICRO_NAME } = require('./pino_utils/constants.js');
const getLogTransportConfig = require('./pino_utils/logTransportConfig.js');
const logFormat = require('./pino_utils/log_format.js');
const fastify = require('fastify')({
    logger: {
      transport: getLogTransportConfig(),
      base: {
        appName: MICRO_NAME
      },
    }
});
const responseLogger = require('./pino_utils/plugings/response-logger.js');
//end  by apardo-m

const userRoutes = require('./routes/user');

fastify.register(responseLogger); // apardo-m 

const start = async () => {
    await fastify.register(userRoutes);

	const source = start.name;

    try {
        await fastify.listen({ port: process.env.PORT || 9001, host: '0.0.0.0' });
        //console.log(`User management service running at https://localhost:${process.env.PORT || 9001}`);
        fastify.log.info(...logFormat(source, `User management service running at https://localhost:${process.env.PORT || 9001}`));
    } catch (err) {
        //fastify.log.error(err);
        fastify.log.error(...logFormat(source, err));
        process.exit(1);
    }
};

start();

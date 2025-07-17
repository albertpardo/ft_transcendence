require('dotenv').config();
const getLogTransportConfig = require('./pino_utils/logTransportConfig.js');
//const fastify = require('fastify')({ logger: true });
//Start by apardo-m
const appName = "user_management";
const logFormat = require('./pino_utils/log_format.js');
const fastify = require('fastify')({
    logger: {
      transport: getLogTransportConfig(),
      base: {
        appName: appName
      },
    }
});
//end  by apardo-m
const userRoutes = require('./routes/user');

fastify.register(userRoutes);

const start = async () => {
    try {
/*
		fastify.log.info({
			source: start.name,
		},"---Start () info ----");
*/
        fastify.log.info(logFormat(start.name,"---Start () info test ----"));
        await fastify.listen({ port: process.env.PORT || 9001, host: '0.0.0.0' });
        //console.log(`User management service running at https://localhost:${process.env.PORT || 9001}`);
        fastify.log.info(logFormat(start.name,`User management service running at https://localhost:${process.env.PORT || 9001}`));
    } catch (err) {
        //fastify.log.error(err);
        fastify.log.error(logFormat(start.name,err));
        process.exit(1);
    }
};

start();

require('dotenv').config();
const getLogTransportConfig = require('./pino_utils/logTransportConfig.js');
//const fastify = require('fastify')({ logger: true });
const appName = "user_management";
const fastify = require('fastify')({
    logger: {
      transport: getLogTransportConfig(),
      base: {
        appName: appName
      },
    }
});
const userRoutes = require('./routes/user');

fastify.register(userRoutes);

const start = async () => {
    try {
		fastify.log.info({
			source: "start",
		},"---Start () info ----");
        await fastify.listen({ port: process.env.PORT || 9001, host: '0.0.0.0' });
        console.log(`User management service running at https://localhost:${process.env.PORT || 9001}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

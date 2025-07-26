require('dotenv').config();
//const fastify = require('fastify')({ logger: true });

//Start by apardo-m
const appName = "user_management";
const getLogTransportConfig = require('./pino_utils/logTransportConfig.js');
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

//Start by apardo-m
// ✅ Hook global used for log in request and reply
fastify.addHook('onSend', async (request, reply, payload) => {
  if (request.routeOptions.config?.source) {
    const log = reply.log || request.log;
    const statusCode = reply.statusCode;

    // payload es un string, intenta parsearlo si es JSON
    let responseBody;

    try {
      responseBody = JSON.parse(payload);
    } catch {
      responseBody = payload;
    }
  
    const logData = {
      statusCode,
      route: request.routerPath || request.url,
	  source: request.routeOptions.config.source,
      payload: responseBody
    };

    if (statusCode >= 400) {
      log.error(logData, 'Response error');
    } else {
      log.info(logData, 'Response sent');
    }
  }
  return payload;
});
//end  by apardo-m

/*
const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 9001, host: '0.0.0.0' });
        console.log(`User management service running at https://localhost:${process.env.PORT || 9001}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
*/

const start = async () => {

	const source = start.name;

    try {
        await fastify.listen({ port: process.env.PORT || 9001, host: '0.0.0.0' });
        fastify.log.info(logFormat(source, `User management service running at https://localhost:${process.env.PORT || 9001}`));
    } catch (err) {
        fastify.log.error(logFormat(source, err));
        process.exit(1);
    }
};
start();

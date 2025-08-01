const fp = require('fastify-plugin');

async function responseLogger(fastify, opts) {
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (request.routeOptions.config?.source) {
      const log = reply.log || request.log;
      const statusCode = reply.statusCode;

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
        logData.message = "Response error";
        log.error(logData);
      } else {
        logData.message = "Response sent";
        log.info(logData);
      }
    }

    return payload;
  });
}

module.exports = fp(responseLogger);


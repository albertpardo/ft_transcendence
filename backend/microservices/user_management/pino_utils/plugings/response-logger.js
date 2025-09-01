const fp = require('fastify-plugin');

async function responseLogger(fastify, opts) {
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (request.routeOptions.config?.source) {
      const log = reply.log || request.log;
      const statusCode = reply.statusCode;

      let responseBody;

      if ( typeof payload ===  "string") {
        responseBody = payload;
      } else {
        try {
          responseBody = JSON.parse(payload);
        } catch (error) {
          responseBody = payload;
          log.error({ error, payload }, "Failed to parse response payload");
        }
      }

      const logData = {
        statusCode,
        route: request.routerPath || request.url,
        source: request.routeOptions.config.source,
        payload: responseBody
      };
      if (statusCode >= 400) {
        log.error(logData, "Response error");
      } else {
        log.info(logData, "Response sent");
      }
    }
    return payload;
  });
}

module.exports = fp(responseLogger);


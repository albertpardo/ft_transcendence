import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';

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

      const logData: {
        statusCode: number;
        route: string;
        source: string;
        payload: any;
        message?: string;   
      } = {
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

export default fp(responseLogger);


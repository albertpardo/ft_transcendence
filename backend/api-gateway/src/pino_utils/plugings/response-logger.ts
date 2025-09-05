import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';

async function responseLogger(fastify: any , opts: any ) {
  fastify.addHook('onSend', async (request: any, reply: any, payload: any) => {
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
      } = {
        statusCode,
        route: request.routerPath || request.url,
        source: request.routeOptions.config.source,
        payload: responseBody
      };

      if (statusCode >= 400) {
        log.error(logData, "Response error" );
      } else {
        log.info(logData, "Response sent");
      }
    }

    return payload;
  });
}

export default fp(responseLogger);


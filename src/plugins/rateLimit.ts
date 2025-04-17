
import { FastifyInstance } from 'fastify';
const fastifyRateLimit = require('@fastify/rate-limit');


module.exports.rateLimitPlugin = async function (app: FastifyInstance) {
    app.register(fastifyRateLimit, {
        max: 100,
        timeWindow: '1 minute'
    });
};

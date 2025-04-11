/*
import { FastifyInstance } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit"

export async function rateLimitPlugin(app: FastifyInstance) {
    //TODO: Add rate limiting configuration later
    app.register(fastifyRateLimit, {
        max: 100,
        timeWindow: '1 minute'
    })
}
*/

import { FastifyInstance } from 'fastify';
const fastifyRateLimit = require('@fastify/rate-limit');

// 通过 module.exports 导出函数
module.exports.rateLimitPlugin = async function (app: FastifyInstance) {
    // TODO: Add rate limiting configuration later
    app.register(fastifyRateLimit, {
        max: 100,
        timeWindow: '1 minute'
    });
};

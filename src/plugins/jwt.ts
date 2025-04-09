/*
import { FastifyInstance } from 'fastify'
import fastifyJWT from '@fastify/jwt'

export async function jwtPlugin(app: FastifyInstance) {
    app.register(fastifyJWT, {
        secret: "super-secret-key", // 🚨 To be managed with .env file later!!!
    })
}
*/

const fastifyJWT = require('@fastify/jwt');

// 使用 module.exports 导出函数
module.exports.jwtPlugin = async function (app) {
    app.register(fastifyJWT, {
        secret: "super-secret-key", // 🚨 To be managed with .env file later!!!
    });
};

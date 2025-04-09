/*
import { FastifyInstance } from 'fastify'
import fastifyJWT from '@fastify/jwt'

export async function jwtPlugin(app: FastifyInstance) {
    app.register(fastifyJWT, {
        secret: "super-secret-key", // 🚨 To be managed with .env file later!!!
    })
}
*/

//Fastify configuration for JWT verification 
const fastifyJWT = require('@fastify/jwt');
require('dotenv').config(); // load environment variable

// 使用 module.exports 导出函数
module.exports.jwtPlugin = async function (app) {
    app.register(fastifyJWT, {
        secret: process.env.JWT_SECRET, // 🚨 To get secret from .env file
    });
};

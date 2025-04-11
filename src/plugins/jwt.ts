//Fastify configuration for JWT verification 
//const fastifyJWT = require('@fastify/jwt');
import fastifyJWT from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
require('dotenv').config(); // load environment variable

// 使用 module.exports 导出函数
module.exports.jwtPlugin = async function (app: FastifyInstance) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    app.register(fastifyJWT, {
        secret: process.env.JWT_SECRET, // 🚨 To get secret from .env file
    });
    console.log('✅ JWT_SECRET:', process.env.JWT_SECRET);
};

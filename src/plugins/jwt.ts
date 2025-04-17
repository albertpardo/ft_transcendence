//Fastify configuration for JWT verification 

import fp from 'fastify-plugin';
import fastifyJWT from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth';
require('dotenv').config(); // load environment variable

async function jwtPlugin(app: FastifyInstance) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    app.register(fastifyJWT, {
        secret: process.env.JWT_SECRET, // 🚨 To get secret from .env file
    });
    console.log('✅ JWT_SECRET:', process.env.JWT_SECRET);
};

async function authHookPlugin(app: FastifyInstance) {
    console.log('🔥 onRequest hook reached');
    app.addHook('onRequest', authMiddleware);
}

export const jwt = fp(jwtPlugin);
export const authHook = fp(authHookPlugin);

//const { generateToken } = require('../services/authServices');
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

console.log('✅ exampleRoutes is registered');
// define a route and export a function
module.exports = async function exampleRoutes(fastify: FastifyInstance) {

    // handle GET request
    fastify.get('/example', async (request: FastifyRequest, reply: FastifyReply) => {
        return { 
            message: '✅Hello, Fastify with TypeScript!',
            user: request.user
         };
    });

    // define more routes
    fastify.post('/example', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as { name: string };
        return { message: `✅✅Hello, ${body.name}` };
    });
    fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
        // Health check endpoint
        console.log('Health check endpoint hit');
        reply.header('Content-Type', 'application/json');
        return { status: 'ok' };
    });
};

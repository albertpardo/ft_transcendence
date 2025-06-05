//const { generateToken } = require('../services/authServices');
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

console.log('✅ exampleRoutes is registered');
// define a route and export a function
module.exports = async function exampleRoutes(fastify: FastifyInstance) {
    /*
    fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
        console.log("🔍 Body received at backend:", request.body);

        const { username, password } = request.body as { username: string, password: string };

        if (username === 'admin' && password === 'password') {
            //produce JWT with authService
            const token = generateToken(username);
            console.log('Arrive at generateTocken: ', token);
            return { token };
        } else {
            return reply.code(401).send({ error: 'Invalid username or password' });
        }
    });
    */

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
    fastify.get('/api/health', async (request: FastifyRequest, reply: FastifyReply) => {
        // Health check endpoint
        console.log('Health check endpoint hit');
        reply.header('Content-Type', 'application/json');
        return { status: 'ok' };
    });
   /*  fastify.get('/health', async (request, reply) => {
    // Health check endpoint
    console.log('Health check endpoint hit');
    reply.header('Content-Type', 'application/json');

  return { status: 'ok' };
}); */
};

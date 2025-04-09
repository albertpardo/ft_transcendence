/*
import { FastifyInstance } from "fastify";

//define a route and export a function
export default async function exampleRoutes(fastify: FastifyInstance) {
    // handle GET request
    fastify.get('/example', async(request, reply) => {
        return { message: 'Hello, Fastify with TypeScript!' };
    });

    // define more routes
    fastify.post('/example', async(request, reply) => {
        const body = request.body as { name: string };
        return { message: `Hello, ${body.name}` };
    });
}
*/

//import { FastifyInstance } from "fastify";

const { generateToken } = require('../services/authService');
const fastify = require('fastify');
const { FastifyInstance, FastifyRequest, FastifyReply } = require('fastify');

// define a route and export a function
module.exports = async function exampleRoutes(fastify: FastifyInstance) {
    fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
        const { username, password } = request.body as { username: string, password: string };

        if (username === 'admin' && password === 'password') {
            //produce JWT with authService
            const token = generateToken(username);
            return { token };
        } else {
            return reply.code(401).send({ error: 'Invalid username or password' });
        }
    });

    // handle GET request
    fastify.get('/example', async (request: FastifyRequest, reply: FastifyReply) => {
        return { message: 'Hello, Fastify with TypeScript!' };
    });

    // define more routes
    fastify.post('/example', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as { name: string };
        return { message: `Hello, ${body.name}` };
    });
};

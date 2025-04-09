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

const fastify = require('fastify');
const { FastifyInstance, FastifyRequest, FastifyReply } = require('fastify');

// define a route and export a function
/** @type {import('fastify').FastifyInstance} */
module.exports = async function exampleRoutes(fastify) {
    // handle GET request
    fastify.get('/example', async (request, reply) => {
        /** @type {import('fastify').FastifyReply} */
        return { message: 'Hello, Fastify with TypeScript!' };
    });

    // define more routes
    fastify.post('/example', async (request, reply) => {
        const body = request.body;
        return { message: `Hello, ${body.name}` };
    });
};

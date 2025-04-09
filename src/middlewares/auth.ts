/*
import { FastifyRequest, FastifyReply } from 'fastify'

export const authMiddleware = async (req: FastifyRequest, reply: FastifyReply) => {
    //TODO: Add JWT validation later
    if (req.url?.startsWith('./api/public')) return // jump over auth

    try {
        await req.jwtVerify()
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' })
    }
    console.log('Auth middleware triggered')
}
*/


const { FastifyRequest, FastifyReply } = require('fastify');

// JWT verification using authMiddleware
module.exports.authMiddleware = async function (req, reply) {

    if (req.url?.startsWith('./api/public')) return // if requested URL is public, skip auth

    try {
        await req.jwtVerify(); //verfication by secret automatically
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
    console.log('Auth middleware triggered');
};

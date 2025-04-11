//const { FastifyRequest, FastifyReply } = require('fastify');
import { FastifyRequest, FastifyReply } from 'fastify';

console.log("🛡️ Auth middleware loaded!");
// JWT verification using authMiddleware
module.exports.authMiddleware = async function (req: FastifyRequest, reply: FastifyReply) {

    console.log("🔍 Incoming request URL:", req.url);

    //if (req.url?.startsWith('/api/login') || req.url?.startsWith('/api/public')) return // if requested URL is public, skip auth

    const publicPaths = ['/api/login', '/api/public'];
    if (publicPaths.some(path => req.url?.startsWith(path))) return;
    
    try {
        await req.jwtVerify(); //verfication by secret automatically
        console.log('✅ JWT verified, user:', req.user);
    } catch (err: any) {
        console.error('❌ JWT verification failed:', err.message);
        reply.code(401).send({ error: 'Unauthorized' });
        return;
    }
    console.log('✅ Auth middleware triggered!');
};

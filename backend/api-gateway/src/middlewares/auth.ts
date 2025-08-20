/// <reference path="../types/fastify-jwt.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';

console.log("🛡️ Auth middleware loaded!");
let itwasasocket : boolean = false;

// JWT verification using authMiddleware
export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {

    itwasasocket = false;
    console.log("🔍 Incoming request URL:", req.url);
//    console.log("🔍 jwtVerify type in middleware:", typeof req.jwtVerify);
//    console.log("🔍🔍🔍 All keys on req:", Object.keys(req));

//    console.log('🔍 Full headers before jwtVerify:', req.headers);
//    console.log('🔍 Authorization Header outside try:', String(req.headers['authorization']));


    // if requested URL is public, skip auth
    const publicPaths = ['/api/signup', '/api/login', '/api/public', '/api/auth/google', '/api/user/upsert-google'];
    if (req.url && publicPaths.some(path => req.url?.startsWith(path))) {
      console.log(`🔓 Public path skipped: ${req.url}`);
      return;
    }

    try {
//        if (req?.headers['sec-websocket-protocol'] !== null) {
        const usp1 = new URLSearchParams(req.url);
        if (req.headers["upgrade"] === "websocket") {
          itwasasocket = true;
          req.headers["authorization"] = "Bearer " + usp1.get("authorization");
        }
       
//        console.log('🔍 Raw Authorization Header inside try00:', String(req.headers['authorization']));
        if (!req.headers['authorization'] || 
            (req.headers['authorization'] === "Bearer undefined" && req.headers['use-me-to-authorize'])) {
//            req.headers['authorization'] = req.headers['use-me-to-authorize'];
//            delete req.headers['use-me-to-authorize'];
            if (req.headers['use-me-to-authorize']) {
                req.headers['authorization'] = `Bearer ${req.headers['use-me-to-authorize'].replace(/^Bearer\s*/, '')}`;
                delete req.headers['use-me-to-authorize'];
            }
        }
//        console.log('🔍 Raw Authorization Header inside try:', String(req.headers['authorization']));
//        console.log('🔍 JWT Secret in use:', process.env.JWT_SECRET);

        await req.jwtVerify(); //verfication by secret automatically
//        console.log('✅ JWT verified, user:', req.user);
//        console.log('req.url was:', req.url);

        //inject user ID or username into headers (for downstream services)
        const userId = (req.user as any)?.userId;
        if (userId) {
            if (itwasasocket) {
              if (usp1.get("/api/pong/game-ws?uuid") !== userId) {
                throw "uuid mismatch";
              }
            }
            req.headers['x-user-id'] = String(userId);
//            console.log(`📦 Injected x-user-id = ${userId} into headers`);
//            console.log(req.headers);
        }
    } catch (err: any) {
//        console.error('❌ JWT verification failed:', err.message);
        reply.code(401).send({ error: 'Unauthorized' });
        return;
    }
//    console.log('✅ Auth middleware triggered!');
};

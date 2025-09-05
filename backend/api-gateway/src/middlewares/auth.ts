/// <reference path="../types/fastify-jwt.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';

import { logFormat } from '../pino_utils/log_format'; //by apardo-m

// console.log("🛡️ Auth middleware loaded!");
let itwasasocket : boolean = false;

// JWT verification using authMiddleware
export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {

    const source = authMiddleware.name;

    itwasasocket = false;

    req.log.info(...logFormat(source, "🔍 Incoming request URL:", req.url));
    req.log.info(...logFormat(source, "🔍 jwtVerify type in middleware:", typeof req.jwtVerify));
    req.log.info(...logFormat(source, "🔍🔍🔍 All keys on req:", Object.keys(req)));
    req.log.info(...logFormat(source, '🔍 Full headers before jwtVerify:', JSON.stringify(req.headers)));
    req.log.info(...logFormat(source, '🔍 Authorization Header outside try:', String(req.headers['authorization'])));

    // if requested URL is public, skip auth
    const publicPaths = ['/api/signup', '/api/login', '/api/public', '/api/auth/google', '/api/user/upsert-google'];
    if (req.url && publicPaths.some(path => req.url?.startsWith(path))) {
      // console.log(`🔓 Public path skipped: ${req.url}`);
      return;
    }

    try {
        const usp1 = new URLSearchParams(req.url);
        if (req.headers["upgrade"] === "websocket") {
          itwasasocket = true;
          req.headers["authorization"] = "Bearer " + usp1.get("authorization");
        }
       
        req.log.info(...logFormat(source, '🔍 Raw Authorization Header inside try00:', String(req.headers['authorization'])));
		
        if (!req.headers['authorization'] || 
            (req.headers['authorization'] === "Bearer undefined" && req.headers['use-me-to-authorize'])) {
//            req.headers['authorization'] = req.headers['use-me-to-authorize'];
//            delete req.headers['use-me-to-authorize'];
            if (req.headers['use-me-to-authorize']) {
                req.headers['authorization'] = `Bearer ${req.headers['use-me-to-authorize'].replace(/^Bearer\s*/, '')}`;
                delete req.headers['use-me-to-authorize'];
            }
        }
        req.log.info(...logFormat(source, '🔍 Raw Authorization Header inside try:', String(req.headers['authorization'])));
        req.log.info(...logFormat(source, '🔍 JWT Secret in use:', process.env.JWT_SECRET));

        await req.jwtVerify(); //verfication by secret automatically
        req.log.info(...logFormat(source, '✅ JWT verified, user:', JSON.stringify(req.user)));

        //inject user ID or username into headers (for downstream services)
        const userId = (req.user as any)?.userId;
        if (userId) {
            if (itwasasocket) {
              if (usp1.get("/api/pong/game-ws?uuid") !== userId) {
                throw "uuid mismatch";
              }
            }
            req.headers['x-user-id'] = String(userId);
            req.log.info(...logFormat(source, `📦 Injected x-user-id = ${userId} into headers`));
        }
	  } catch (err: any) {
      req.log.error(...logFormat(source, "❌ JWT verification failed: ",  err));
      reply.log.error(...logFormat(source, "Unauthorized"));
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }
    req.log.info(...logFormat(source, '✅ Auth middleware triggered!'));
};

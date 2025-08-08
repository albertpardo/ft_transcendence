/// <reference path="../types/fastify-jwt.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';

console.log("🛡️ Auth middleware loaded!");
let itwasasocket : boolean = false;

export function clearAuthTokens() {
  // Clear localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");

  // Clear cookie
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";

  console.log("✅ Cleared all auth tokens");
}

export async function rewriteRequestHeaders(
  req: FastifyRequest,
  reply: FastifyReply
) {
  // Handle WebSocket connections
  if (req.headers["upgrade"] === "websocket") {
    const usp = new URLSearchParams(req.url);
    const authToken = usp.get("authorization");
    if (authToken) {
      req.headers["authorization"] = `Bearer ${authToken}`;
    }
  }

  // CRITICAL FIX: Handle authToken cookie for regular requests
  if (!req.headers.authorization && req.cookies?.authToken) {
    req.headers.authorization = `Bearer ${req.cookies.authToken}`;
    console.log("🍪 Injected Authorization header from authToken cookie");
  }

  return;
}

// JWT verification using authMiddleware
export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {

  await rewriteRequestHeaders(req, reply);

  itwasasocket = false;

  if (!(req.url?.startsWith('/health'))) {
    console.log("🔍 Incoming request URL:", req.url);
    console.log("🔍 jwtVerify type in middleware:", typeof req.jwtVerify);
    console.log("🔍🔍🔍 All keys on req:", Object.keys(req));
    console.log('🔍 Full headers before jwtVerify:', req.headers);
    console.log('🔍 Authorization Header outside try:', String(req.headers['authorization']));
  }

  // if requested URL is public, skip auth
  const publicPaths = [
    "/api/signup",
    "/api/login",
    "/api/public",
    "/api/health",
    "/api/auth/42",
  ];
  if (req.headers["x-internal-request"] === "true") {
    return;
  }
  if (publicPaths.some(path => req.url?.startsWith(path))) return;
  
  if (req.url?.startsWith('/health')) return; // allow health check without auth

  try {
       
    console.log('🔍 Raw Authorization Header inside try00:', String(req.headers['authorization']));
    if (!req.headers['authorization'] || 
        (req.headers['authorization'] === "Bearer undefined" && req.headers['use-me-to-authorize'])) {

        if (req.headers['use-me-to-authorize']) {
                const useMeToAuthorize = req.headers['use-me-to-authorize'];
                req.headers['authorization'] = `Bearer ${
                    typeof useMeToAuthorize === 'string' ? useMeToAuthorize.replace(/^Bearer\s*/, '') : ''
            }`;
            delete req.headers['use-me-to-authorize'];
        }
    }
    console.log('🔍 Raw Authorization Header inside try:', String(req.headers['authorization']));
    console.log('🔍 JWT Secret in use:', process.env.JWT_SECRET);

    await req.jwtVerify(); // verification by secret automatically
    console.log('✅ JWT verified, user:', req.user);

    const userId = (req.user as any)?.userId;
    if (userId) {
        req.headers['x-user-id'] = String(userId);
        console.log(`📦 Injected x-user-id = ${userId} into headers`);
    }
  } catch (err: any) {
    console.error('❌ JWT verification failed:', err.message);
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  console.log('✅ Auth middleware triggered!');
};
import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { user: string };
        user: { user: string };
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        jwtVerify(): Promise<void>;
        user: { user: string };
    }
}
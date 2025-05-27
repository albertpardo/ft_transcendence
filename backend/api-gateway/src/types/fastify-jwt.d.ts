import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { userId: number };
        user: { userId: number };
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        jwtVerify(): Promise<void>;
        user: { user: string };
    }
}
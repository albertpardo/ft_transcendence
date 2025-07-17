import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { userId: string };
        user: { userId: string };
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        jwtVerify(): Promise<void>;
        user: { user: string };
    }
}

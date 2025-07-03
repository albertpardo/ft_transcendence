import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { userId: string; has_2fa?: boolean };
        user: { userId: string; has_2fa?: boolean };
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        jwtVerify(): Promise<void>;
        user: { user: string };
    }
}

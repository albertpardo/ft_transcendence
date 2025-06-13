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

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string;
            JWT_EXPIRATION?: string; // Optional, if not set, default is used
            JWT_ISSUER?: string; // Optional, if not set, default is used
            JWT_AUDIENCE?: string; // Optional, if not set, default is used
            USER_MANAGEMENT_URL?: string; // URL for user management service
            API_BASE_URL?: string; // Base URL for the API gateway
        }
    }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId?: string;
      id?: string;
    };
    jwtVerify: () => Promise<void>; // You can augment this too if needed
  }
}


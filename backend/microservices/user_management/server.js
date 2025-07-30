require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const userRoutes = require('./routes/user');

process.on('unhandledRejection', (err) => {
    fastify.log.error(err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    fastify.log.error(err);
    process.exit(1);
});

// Health check route
fastify.get('/health', async (req, reply) => {
    return { status: 'ok', time: new Date().toISOString() };
});

const start = async () => {
    await fastify.register(userRoutes, { prefix: "/api/user" });

    try {
        await fastify.listen({ port: process.env.PORT || 9001, host: '0.0.0.0' });
        // console.log(`User management service running at ${fastify.server.address().address}:${process.env.PORT || 9001}`);
        const address = fastify.server.address();
        if (typeof address === 'object' && address !== null) {
          console.log(`User management service running at http://${address.address}:${address.port}`);
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
 
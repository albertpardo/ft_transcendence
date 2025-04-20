require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const userRoutes = require('./routes/user');

fastify.register(userRoutes);

const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 9001, host: '0.0.0.0' });
        console.log(`User management service running at http://localhost:${process.env.PORT || 9001}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

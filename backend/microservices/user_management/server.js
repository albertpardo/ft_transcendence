require('dotenv').config();
const fastify = require('fastify')({ 
    logger: true,
    trustProxy: true
 });
const userRoutes = require('./routes/user');

fastify.register(require('@fastify/cors'), {
    origin: [
        process.env.FRONTEND_URL || 'https://frontend-7nt4.onrender.com',
        'https://localhost:3000',
    ],
    credentials: true,
});

fastify.register(userRoutes);

const start = async () => {
    try {
        await fastify.listen({ 
            port: process.env.PORT || 9001,  
            host: '0.0.0.0' }
        );
        console.log(`User management service running on port:${process.env.PORT || 9001}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

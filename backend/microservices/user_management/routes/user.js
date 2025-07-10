const userController = require('../controllers/userController');

async function userRoutes(fastify, options) {
    /* 
    fastify.post('/api/user/signup', userController.signup);
    fastify.post('/api/user/login', userController.login);
    fastify.get('/api/user/profile', userController.getProfile);
    fastify.put('/api/user/profile', userController.updateProfile);
    fastify.delete('/api/user/profile', userController.deleteProfile);
    */
    console.log("Registering user routes...");
    fastify.post('/signup', userController.signup);
    fastify.post('/login', userController.login);
    fastify.get('/profile', userController.getProfile);
    fastify.put('/profile', userController.updateProfile);
    fastify.delete('/profile', userController.deleteProfile);
    fastify.get('/health', async (req, reply) => {
        return { status: 'ok', time: new Date().toISOString() };
    });

    fastify.all('*', async (req, reply) => {
        console.log(`No route matched for ${req.method} ${req.url}`);
        reply.code(404).send({ error: 'Not found' });
    });

}

module.exports = userRoutes;

const userController = require('../controllers/userController');

async function userRoutes(fastify, options) {
    console.log('✅ Registering user routes...');
    //fastify.post('/api/user/public/nickname', userController.getPublicNickname);


    console.log("Registering user routes...");
    fastify.post('/signup', userController.signup);
    fastify.post('/login', userController.login);
    fastify.post('/public/nickname', userController.getPublicNickname);
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

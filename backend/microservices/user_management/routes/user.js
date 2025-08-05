const userController = require('../controllers/userController');

async function userRoutes(fastify, options) {
    console.log('✅ Registering user routes...');
    fastify.post('/api/user/public/nickname', userController.getPublicNickname);
    fastify.post('/api/user/signup', userController.signup);
    fastify.post('/api/user/login', userController.login);
    fastify.get('/api/user/profile', userController.getProfile);
    fastify.put('/api/user/profile', userController.updateProfile);
    fastify.delete('/api/user/profile', userController.deleteProfile);

    fastify.post('/api/user/upsert-google', userController.upsertGoogle);
    console.log('✅ Registered POST /api/user/upsert-google');
}

module.exports = userRoutes;

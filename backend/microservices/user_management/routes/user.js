const userController = require('../controllers/userController');

async function userRoutes(fastify, options) {
    fastify.post('/api/user/signup', userController.signup);
    fastify.post('/api/user/login', userController.login);
    fastify.get('/api/user/profile', userController.getProfile);
/*    
    fastify.get('/api/user/profile', async (req, reply) => {
        const userId = req.headers['x-user-id'];
        if (!userId) return reply.code(401).send({ error: 'Unauthorized'});

        //mock user information
        return {
            userId,
            nickname: 'testing user',
            email: 'test@example.com'
        };
    });
*/
}

module.exports = userRoutes;
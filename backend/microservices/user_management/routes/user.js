//user.js
const userController = require('../controllers/userController');
const userService = require('../services/userService');

async function userRoutes(fastify, options) {
    fastify.post('/api/user/public/nickname', userController.getPublicNickname);
    fastify.post('/api/user/signup', userController.signup);
    fastify.post('/api/user/login', userController.login);
    fastify.get('/api/user/profile', userController.getProfile);
    fastify.put('/api/user/profile', userController.updateProfile);
    fastify.delete('/api/user/profile', userController.deleteProfile);

    // 🆕 NEW: Find user by email (for Google OAuth) - FASTIFY SYNTAX
    fastify.get('/users/by-email/:email', async (request, reply) => {
        try {
            const { email } = request.params;
            
            if (!email) {
                return reply.status(400).send({ message: 'Email is required' });
            }

            const user = await userService.findUserByEmail(email);
            
            if (!user) {
                return reply.status(404).send({ message: 'User not found' });
            }

            return reply.send(user);
        } catch (error) {
            console.error('Error finding user by email:', error);
            return reply.status(500).send({ message: 'Internal server error' });
        }
    });

    // 🆕 NEW: Create user (for Google OAuth) - FASTIFY SYNTAX  
    fastify.post('/users', async (request, reply) => {
        try {
            const { 
                nickname, 
                username, 
                email, 
                password, 
                avatar = '',
                provider = 'local',
                providerId = null 
            } = request.body;

            // Validation
            if (!nickname || !username || !email) {
                return reply.status(400).send({ message: 'Nickname, username, and email are required' });
            }

            // For Google OAuth users, password can be a placeholder
            if (provider === 'local' && !password) {
                return reply.status(400).send({ message: 'Password is required for local accounts' });
            }

            const userData = {
                nickname,
                username,
                email,
                password: password || 'oauth_placeholder',
                avatar,
                provider,
                providerId
            };

            const user = await userService.createGoogleUser(userData);
            if (user.error) {
                return reply.status(400).send({ message: user.error });
            }

            return reply.status(201).send(user);
        } catch (error) {
            console.error('Error creating user:', error);
            return reply.status(500).send({ message: 'Internal server error' });
        }
    });

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
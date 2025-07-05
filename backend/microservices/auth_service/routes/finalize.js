const db = require('../db');

//const SECRET_KEY = 'your_jwt_secret'; 

async function routes(fastify) {
  fastify.post('/api/security/auth/2fa/finalize-login', async (req, reply) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return reply.code(400).send({ error: 'Missing user ID' });

    const user = db.prepare('SELECT has_2fa, has_seen_2fa_prompt FROM users WHERE id = ?').get(userId);
    if (!user) return reply.code(403).send({ error: 'User not found' });

    if (user.has_2fa && !user.has_seen_2fa_prompt) {
      return reply.code(403).send({ error: '2FA required' });
    }

//    const token = jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: '1h' });
    return reply.send({ id: userId, has_2fa: user.has_2fa ?? false  });
  });
}

module.exports = routes;

const db = require('../db');

async function routes(fastify) {
  fastify.get('/api/security/auth/2fa/status', async (req, reply) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return reply.code(400).send({ error: 'Missing user ID' });

    const user = db.prepare('SELECT has_2fa, has_seen_2fa_prompt FROM users WHERE id = ?').get(userId);
    if (!user) return reply.send({ has_2fa: false, has_seen_2fa_prompt: false });

    return reply.send(user);
  });
}

module.exports = routes;

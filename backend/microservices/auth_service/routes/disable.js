const db = require('../db');

async function routes(fastify) {
  fastify.post('/api/security/auth/2fa/disable', async (req, reply) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return reply.code(400).send({ error: 'Missing user ID' });

    db.prepare('UPDATE users SET has_2fa = 0, twofa_secret = NULL WHERE id = ?').run(userId);
    return reply.send({ success: true });
  });
}

module.exports = routes;

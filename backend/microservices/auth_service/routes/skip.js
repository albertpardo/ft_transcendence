const db = require('../db');

async function routes(fastify) {
  fastify.post('/api/security/auth/2fa/skip', async (req, reply) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return reply.code(400).send({ error: 'Missing user ID' });

    db.prepare(`
      INSERT INTO users (id, has_2fa, has_seen_2fa_prompt)
      VALUES (?, 0, 1)
      ON CONFLICT(id) DO UPDATE SET has_2fa=0, has_seen_2fa_prompt=1
    `).run(userId);

    return reply.send({ success: true });
  });
}

module.exports = routes;

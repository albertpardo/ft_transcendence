const db = require('../db');

async function routes(fastify, options) {
  fastify.post('/api/security/auth/2fa/seen-2fa-prompt', async (req, reply) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return reply.code(400).send({ error: 'Missing x-user-id header' });
    }

    try {
      // make sure the user exists (if it dosen't exist, create it)
      const existing = db
        .prepare('SELECT id FROM users WHERE id = ?')
        .get(userId);

      if (!existing) {
        db.prepare('INSERT INTO users (id, has_seen_2fa_prompt) VALUES (?, 1)').run(userId);
      } else {
        db.prepare('UPDATE users SET has_seen_2fa_prompt = 1 WHERE id = ?').run(userId);
      }

      return reply.code(204).send();
    } catch (err) {
      console.error('DB Error:', err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}

module.exports = routes;

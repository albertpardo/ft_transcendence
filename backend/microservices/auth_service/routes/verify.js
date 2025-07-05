const speakeasy = require('speakeasy');
const db = require('../db');

async function routes(fastify) {
  fastify.post('/api/security/auth/2fa/verify', async (req, reply) => {
    const userId = req.headers['x-user-id'];
    const { token } = req.body;

    if (!userId || !token) return reply.code(400).send({ error: 'Missing fields' });

    const user = db.prepare('SELECT twofa_secret FROM users WHERE id = ?').get(userId);
    if (!user || !user.twofa_secret) return reply.code(400).send({ error: 'No 2FA setup' });

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) return reply.code(401).send({ error: 'Invalid token' });

    db.prepare('UPDATE users SET has_2fa = 1, has_seen_2fa_prompt = 1 WHERE id = ?').run(userId);

    return reply.send({ success: true });
  });
}

module.exports = routes;

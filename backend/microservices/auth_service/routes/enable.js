const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const db = require('../db');

async function routes(fastify) {
  fastify.post('/api/security/auth/2fa/enable', async (req, reply) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return reply.code(400).send({ error: 'Missing x-user-id header' });

    const secret = speakeasy.generateSecret({
      name: `Transcendence (${userId})`,
    });

    // store secret
    db.prepare(`
      INSERT INTO users (id, twofa_secret)
      VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET twofa_secret=excluded.twofa_secret
    `).run(userId, secret.base32);

    const qrDataURL = await qrcode.toDataURL(secret.otpauth_url);

    return reply.send({
      otpauth_url: secret.otpauth_url,
      qr_code: qrDataURL,
    });
  });
}

module.exports = routes;

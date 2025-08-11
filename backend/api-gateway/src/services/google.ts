import { FastifyPluginAsync } from 'fastify';
import { OAuth2Client } from 'google-auth-library';

import { logFormat } from '../pino_utils/log_format'; // by apardo-m

const CLIENT_ID = '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const googleAuthPlugin: FastifyPluginAsync = async (fastify) => {

  const PATH = '/api/auth/google';
  fastify.post(PATH, { 
    handler: async (request, reply) => {
      const source = "/api/auth/google";  //by apardo-m

      const { token } = request.body as { token: string };

      if (!token) {
        return reply.status(400).send({ error: 'Google ID token is required' });
      }

      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
          return reply.status(400).send({ error: 'Invalid Google token' });
        }

        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
          return reply.status(400).send({ error: 'Email is required' });
        }

        const nickname = payload.given_name || (payload.name ? payload.name.split(' ')[0] : 'Google User');

        let user: any;
        try {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch('http://user_management:9001/api/user/upsert-google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, picture, googleId }),
          });

          fastify.log.info('👤 User service response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            //fastify.log.error('User service error:', errorText);
            request.log.error(logFormat(source, 'User service error:', errorText));
            throw new Error(`User service failed: ${response.status}`);
          }

          user = await response.json();
          //fastify.log.info('✅ User upsert successful:', user);
          request.log.info(logFormat(source, '✅ User upsert successful:', user));
        } catch (err: any) {
          //fastify.log.error('❌ Failed to upsert user:', err);
          request.log.error(logFormat(source, '❌ Failed to upsert user:', err));
          return reply.status(500).send({ error: 'User creation failed' });
        }

        const authToken = await fastify.jwt.sign(
          { userId: user.id },
          { expiresIn: '7d' }
        );

        reply.setCookie('authToken', authToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return reply.send({
          id: user.id,
          token: authToken,
          user: user.username,
          avatar: user.avatar,
        });
      } catch (err: any) {
        //fastify.log.error('🚨 Google auth error:', err.message);
        //fastify.log.error('Full error stack:', err.stack);
        request.log.error(logFormat(source, '🚨 Google auth error:', err.message));
        request.log.error(logFormat(source, 'Full error stack:', err.stack));

        if (err.message.includes('Invalid ID token')) {
          return reply.status(400).send({ error: 'Invalid Google token' });
        }

        return reply.status(500).send({
          error: 'Authentication failed',
          detail: err.message || 'Unknown error',
          stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        });
      }
    },
	config: { source: PATH }
  });
};

export default googleAuthPlugin;

/*
const googleAuthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/auth/google', async (request, reply) => {

	const source = "/api/auth/google";  //by apardo-m

    const { token } = request.body as { token: string };

    if (!token) {
      return reply.status(400).send({ error: 'Google ID token is required' });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return reply.status(400).send({ error: 'Invalid Google token' });
      }

      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      const nickname = payload.given_name || (payload.name ? payload.name.split(' ')[0] : 'Google User');

      let user: any;
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://user_management:9001/api/user/upsert-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, picture, googleId }),
        });

        fastify.log.info('👤 User service response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          //fastify.log.error('User service error:', errorText);
          request.log.error(logFormat(source, 'User service error:', errorText));
          throw new Error(`User service failed: ${response.status}`);
        }

        user = await response.json();
        //fastify.log.info('✅ User upsert successful:', user);
        request.log.info(logFormat(source, '✅ User upsert successful:', user));
      } catch (err: any) {
        //fastify.log.error('❌ Failed to upsert user:', err);
        request.log.error(logFormat(source, '❌ Failed to upsert user:', err));
        return reply.status(500).send({ error: 'User creation failed' });
      }

      const authToken = await fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: '7d' }
      );

      reply.setCookie('authToken', authToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return reply.send({
        id: user.id,
        token: authToken,
        user: user.username,
        avatar: user.avatar,
      });
    } catch (err: any) {
      //fastify.log.error('🚨 Google auth error:', err.message);
      //fastify.log.error('Full error stack:', err.stack);
      request.log.error(logFormat(source, '🚨 Google auth error:', err.message));
      request.log.error(logFormat(source, 'Full error stack:', err.stack));

      if (err.message.includes('Invalid ID token')) {
        return reply.status(400).send({ error: 'Invalid Google token' });
      }

      return reply.status(500).send({
        error: 'Authentication failed',
        detail: err.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
      });
    }
  });
};

export default googleAuthPlugin;
*/

/* 
import { FastifyPluginAsync } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';

const CLIENT_ID = '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}
async function googleAuthPlugin(fastify) {
  fastify.post('/api/auth/google', async (request, reply) => {
    const { token } = request.body as { token: string; };

    if (!token) {
      return reply.status(400).send({ error: 'Google ID token is required' });
    }

    try {
      // 1. Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return reply.status(400).send({ error: 'Invalid Google token' });
      }
      
      const { email, name, picture, sub: googleId } = payload;
      
      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      // 2. Call user_management via HTTP (not inject)
      let user: any;
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://user_management:9001/api/user/upsert-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, picture, googleId }),
        });

        fastify.log.info('👤 User service response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          fastify.log.error('User service error:', errorText);
          throw new Error(`User service failed: ${response.status}`);
        }

        user = await response.json();
        fastify.log.info('✅ User upsert successful:', user);
      } catch (err: any) {
        fastify.log.error('🚨 Google auth error:', err.message);
        fastify.log.error('Full error stack:', err.stack);
        return reply.status(500).send({
          error: 'User creation failed',
          detail: err.message || 'Unknown error',
          stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        });
      }

      // 3. Generate JWT
      const authToken = await fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: '7d' }
      );

      // 4. Set secure cookie
      reply.setCookie('authToken', authToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      
      // 5. Send response
      return reply.send({
        id: user.id,
        token: authToken,
        user: user.username,
        avatar: user.avatar,
      });
    } catch (err: any) {
      fastify.log.error('🚨 Google auth error:', err.message);
      fastify.log.error('Full error stack:', err.stack);

      if (err.message.includes('Invalid ID token')) {
        return reply.status(400).send({ error: 'Invalid Google token' });
      }

      return reply.status(500).send({
        error: 'Authentication failed',
        detail: err.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
      });
    }
  });
}

export default googleAuthPlugin; */

/* import { FastifyPluginAsync } from 'fastify';
      import { OAuth2Client } from 'google-auth-library';
      
      // Use your actual Google Client ID
      const CLIENT_ID = '142914619782-scgrlb1fklqo43g9b2901hemub6hg51h.apps.googleusercontent.com';
      
      const client = new OAuth2Client(CLIENT_ID);
      
      const googleAuthPlugin: FastifyPluginAsync = async (fastify) => {
        fastify.post('/api/auth/google', async (request, reply) => {
          const { token } = request.body as { token: string };
      
          if (!token) {
            return reply.status(400).send({ error: 'Google ID token is required' });
          }
      
          try {
            // 1. Verify the Google ID token
            const ticket = await client.verifyIdToken({
              idToken: token,
              audience: CLIENT_ID,
            });
      
            const payload = ticket.getPayload();
            if (!payload) {
              return reply.status(400).send({ error: 'Invalid Google token' });
            }
      
            const { email, name, picture, sub: googleId } = payload;
      
            if (!email) {
              return reply.status(400).send({ error: 'Email is required' });
            }
      
            // 2. Forward to user-service to handle DB logic
            // We use fastify.httpProxy to forward, or call user-service directly
            let user: any;
      
            try {
              const userRes = await fastify.inject({
                method: 'POST',
                url: 'http://user_management:9001/api/user/upsert-google',
                payload: { email, name, picture, googleId },
              });
      
              if (userRes.statusCode !== 200) {
                throw new Error('User service failed');
              }
      
              user = userRes.json();
            } catch (err) {
              fastify.log.error('Failed to upsert user:', err);
              return reply.status(500).send({ error: 'User creation failed' });
            }
      
            // 3. Generate your app's JWT
            const authToken = await fastify.jwt.sign(
              { userId: user.id },
              { expiresIn: '7d' }
            );
      
            // 4. Set secure HTTP-only cookie (optional but recommended)
            reply.setCookie('authToken', authToken, {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            });
      
            // 5. Send response to frontend
            return reply.send({
              authToken,
              userId: user.id,
              username: user.username,
              avatar: user.avatar,
            });
          } catch (err: any) {
            fastify.log.error('Google auth error:', err);
            fastify.log.error('Full error stack:', err.stack);
            if (err.message.includes('Invalid ID token')) {
              return reply.status(400).send({ error: 'Invalid Google token' });
            }
            return reply.status(500).send({
             error: 'Authentication failed',
             detail: err.message || 'Unknown error',
             stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
           });
          }
        });
      };
      
      export default googleAuthPlugin; */

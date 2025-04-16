import Fastify from 'fastify';
import { initDB } from './db';
import { pongMain } from './pong';


const startServer = async () => {
  const fastify = Fastify({ logger: true });
  const db = await initDB();

  // inyectar la instancia de db para usarla en rutas
  fastify.decorate('db', db);

  //GET HOME
  fastify.get('/', async (request, reply) => {
	  pongMain().catch(console.error);
      return {message : "Welcome to the transcendence API!"};
  });

  // GET USERS
  fastify.get('/users', async (request, reply) => {
    const users = await db.all('SELECT * FROM users');
    return users;
  });

  // POST USERS
  fastify.post('/users', async (request, reply) => {
    const { name, email } = request.body as any;
    try {
      await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
      return { success: true };
    } catch (err) {
      reply.code(400);
      return { error: 'Error inserting user', details: err };
    }
  });

  // PUT USERS
  fastify.put('/users/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { name, email } = request.body as any;
    try {
      await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
      return { success: true };
    } catch (err) {
      reply.code(400);
      return { error: 'Error updating user', details: err };
    }
  });

  // DELETE USERS


  await fastify.listen({ port: 4000, host: '0.0.0.0' });
};

startServer().catch(console.error);

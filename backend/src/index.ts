import Fastify from 'fastify';
import { initDB } from './db';


const startServer = async () => {
  const fastify = Fastify({ logger: true });
  const db = await initDB();

  // inyectar la instancia de db para usarla en rutas
  fastify.decorate('db', db);

  //GET HOME
  fastify.get('/', async (request, reply) => {
      return {message : "Welcome to the transcendence API!"};
  });

  // GET USERS
  fastify.get('/users', async (request, reply) => {
    const users = await db.all('SELECT * FROM users');
    return users;
  });

  //GET USERS BY ID
  fastify.get('/users/id/:id', async (request, reply) => {
    const { id } = request.params as any;
    try {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
      if (!user) {
        reply.code(404);
        return { err: 'User not found' };
      }
      return user;
    } catch (err) {
      reply.code(400);
      return { err: 'Error fetching user', details: err };
    }
  });

  //GET USERS BY NAME
  fastify.get('/users/name/:name', async (request, reply) => {
    const { name } = request.params as any;
    try {
      const user = await db.get('SELECT * FROM users WHERE LOWER(name) = LOWER(?)', [name]);
      if (!user) {
        reply.code(404);
        return { error: 'User not found' };
      }
      return user;
    } catch (err) {
      reply.code(400);
      return { err : 'Error fetching user', details: err };
    }
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
  fastify.put('/users/id/:id', async (request, reply) => {
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

  //DELETE USERS
  fastify.delete('/users/id/:id', async (request, reply) => {
    const { id } = request.params as any;
    try {
      const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
      if (result.changes === 0) {
        reply.code(404);
        return { error: 'User not found' };
      }
      return { success: true };
    } catch (err) {
      reply.code(400);
      return { error: 'Error deleting user', details: err };
    }
  });


  await fastify.listen({ port: 4000, host: '0.0.0.0' });
};

startServer().catch(console.error);


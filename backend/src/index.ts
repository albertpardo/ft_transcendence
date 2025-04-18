import Fastify from 'fastify';
import { initDB } from './db';
import { pongMain, getPongStarted, getPongDone, getPongState } from './pong';


const startServer = async () => {
  const fastify = Fastify({ logger: true });
  const db = await initDB();

  // inyectar la instancia de db para usarla en rutas
  fastify.decorate('db', db);

  //GET HOME
  fastify.get('/', async (request, reply) => {
	  if (getPongDone() === true) {
      	return {message : "pong's loser is: " + getPongState().stateWhoL};
	  }
	  if (getPongStarted() === false) {
		  pongMain();
		  return {message : "pong wasn't started... well, now it is!"};
	  }
	  return {message : "pong ongoing;", state : getPongState()};
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

import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true
});

// Registrar CORS
fastify.register(cors, {
  origin: '*'
});

// ruta báse
fastify.get('/', async (request, reply) => {
  return { message: 'Welcome to the ft_transcendence API!' };
});

// Ruta para verificar que el servicio esté activo
fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Iniciar el servidor
const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('Server running on port 4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();


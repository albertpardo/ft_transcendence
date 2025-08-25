const userController = require('../controllers/userController');

const logFormat = require('../pino_utils/log_format.js');
/*
async function userRoutes(fastify, options) {
    console.log('✅ Registering user routes...');
    fastify.post('/api/user/public/nickname', userController.getPublicNickname);
    fastify.post('/api/user/signup', userController.signup);
    fastify.post('/api/user/login', userController.login);
    fastify.get('/api/user/profile', userController.getProfile);
    fastify.put('/api/user/profile', userController.updateProfile);
    fastify.delete('/api/user/profile', userController.deleteProfile);

    fastify.post('/api/user/upsert-google', userController.upsertGoogle);
    console.log('✅ Registered POST /api/user/upsert-google');
}*/

async function userRoutes(fastify, options) {

  const addRouteWithSource = (method, url, handler) => {
    fastify[method](url, {
      handler,
      config: { source: url }
    });
  };
  
  const source = userRoutes.name;
  
  fastify.log.info(...logFormat(source, '✅ Registering user routes...'));
  addRouteWithSource('post', '/api/user/public/nickname', userController.getPublicNickname);
  addRouteWithSource('post', '/api/user/signup', userController.signup);
  addRouteWithSource('post', '/api/user/login', userController.login);
  addRouteWithSource('get', '/api/user/profile', userController.getProfile);
  addRouteWithSource('put', '/api/user/profile', userController.updateProfile);
  addRouteWithSource('delete', '/api/user/profile', userController.deleteProfile);
  addRouteWithSource('get', '/api/user/friends', userController.getFriends);
  addRouteWithSource('put', '/api/user/friends', userController.putFriend);

  addRouteWithSource('post', '/api/user/upsert-google', userController.upsertGoogle);
  fastify.log.info(...logFormat(source,'✅ Registered POST /api/user/upsert-google'));  
}

module.exports = userRoutes;

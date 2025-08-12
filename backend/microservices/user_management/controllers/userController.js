const userService = require('../services/userService');

const logFormat = require('../pino_utils/log_format');

exports.getPublicNickname = async (request, reply) => {
	const source = exports.getPublicNickname.name;    //Recommended way to get function name dynamically.
	const { userId } = request.body;
	const result = await userService.getPublicNickname(userId);
	//console.log("hit from backend/microservices/user_management/controllers/userController.js", result);
    request.log.info(...logFormat(source, "hit from backend/microservices/user_management/controllers/userController.js", result));
	if (result.error) {
		return reply.code(400).send(result);
	}
	return reply.send(result);
};

exports.signup = async (request, reply) => {
    const { username, password, nickname, email } = request.body;
    const result = await userService.signup(username, password, nickname, email);
    if (result.error) return reply.code(400).send(result);
    return reply.send(result);
};

exports.login = async (request, reply) => {
	const source =exports.login.name;
    const { username, password } = request.body;
    const result = await userService.login(username, password);
    if (result.error) {
        return reply.code(401).send({ error: '🧸 Invalid credentials' });
    }
    //console.log('🎏 username and password are correct!');
    request.log.info(...logFormat(source, '🎏 username and password are correct!'));
    return reply.send(result);
};

exports.getProfile = async (request, reply) => {
	const source = exports.getProfile.name;   
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
   // console.log("📦 userId from header:", userId);
    request.log.info(...logFormat(source, "📦 userId from header:", userId));

    const userInfo = await userService.getProfile(userId);
    return reply.send(userInfo);    
}

exports.updateProfile = async (request, reply) => {
    //console.log('🧩 updateProfile triggered');
    //console.log('📦 userId from header:', request.headers['x-user-id']);
	const source = exports.updateProfile.name;
    request.log.info(...logFormat(source, '🧩 updateProfile triggered'));
    request.log.info(...logFormat(source, '📦 userId from header:', request.headers['x-user-id']));
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    //console.log('🌎 request.body:', request.body);
    request.log.info(...logFormat(source, '🌎 request.body:', request.body));

    const { username, nickname, email, password, avatar } = request.body;
    const result = await userService.updateProfile(userId, {
        username,
        nickname,
        email,
        password,
        avatar
    });
    // console.log('🌎 updatedResult:', result);
    request.log.info(...logFormat(source, '🌎 updatedResult:', result));
    if (result.error) return reply.code(400).send(result);
    return reply.send({ message: "🏄 Profile updated successfully" });
}

exports.deleteProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    const result = await userService.deleteProfile(userId);
    if (result.error) return reply.code(400).send(result);
    return reply.send({ message: "🏊 Profile deleted successfully" });
}

exports.upsertGoogle = async (request, reply) => {
  //console.log('🔥 [userController] Received upsert request:', request.body);
  const source = exports.upsertGoogle.name;
  request.log.info(...logFormat(source, '🔥 [userController] Received upsert request:', request.body));

  const { email, name, picture, googleId } = request.body;

  if (!email || !googleId) {
    //console.log('❌ [userController] Missing email or googleId:', { email, googleId });
    request.log.info(...logFormat(source, '❌ [userController] Missing email or googleId:', { email, googleId }));
    return reply.code(400).send({ error: 'Email and Google ID are required' });
  }
 // const nickname = payload.given_name || 'Google User';
/*   if (!user.nickname) {
    user.nickname = user.username;
  } */
  try {
    const result = await userService.upsertGoogleUser(email, name, picture, googleId);
    //console.log('✅ [userController] Success:', result);
    request.log.info(...logFormat(source, '✅ [userController] Success:', result));
    return reply.send(result);
  } catch (err) {
    //console.error('💥 [userController] Failed to upsert user:', err);
    request.log.error(...logFormat(source, '💥 [userController] Failed to upsert user:', err));
    return reply.code(500).send({ error: 'User creation failed' });
  }
};

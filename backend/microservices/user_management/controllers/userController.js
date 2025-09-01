const userService = require('../services/userService');

const logFormat = require('../pino_utils/log_format');

exports.getPublicNickname = async (request, reply) => {
  const source = exports.getPublicNickname.name;  //Recommended way to get function name dynamically.
  const { userId } = request.body;
  const result = await userService.getPublicNickname(userId);
  return reply.send(JSON.stringify(result));
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
  request.log.info(...logFormat(source, '🎏 username and password are correct!'));
  return reply.send(result);
};

exports.getProfile = async (request, reply) => {
  	const source = exports.getProfile.name;   
  const userId = request.headers['x-user-id'];
  if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
  request.log.info(...logFormat(source, "📦 userId from header:", userId));

  const userInfo = await userService.getProfile(userId);
  return reply.send(userInfo);  
}

exports.updateProfile = async (request, reply) => {
	const source = exports.updateProfile.name;
  request.log.info(...logFormat(source, '🧩 updateProfile triggered'));
  request.log.info(...logFormat(source, '📦 userId from header:', request.headers['x-user-id']));
  const userId = request.headers['x-user-id'];
  if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

  request.log.info(...logFormat(source, '🌎 request.body:', request.body));

  const { username, nickname, email, password, avatar } = request.body;
  const result = await userService.updateProfile(userId, {
    username,
    nickname,
    email,
    password,
    avatar
  });
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

exports.getFriends = async (request, reply) => {
  const source = exports.getFriends.name;

  const userId = request.headers['x-user-id'];
  if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
  
  const friends = await userService.getUserFriends(userId);
  reply.log.info(...logFormat(source, 'check friends list : ', friends));
  return reply.send(friends);  
}

exports.putFriend = async (request, reply) => {
  const source = exports.putFriend.name;

  const userId = request.headers['x-user-id'];
  if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
  const { nick } = request.body;
  	reply.log.info(...logFormat(source, '(check userId, nick) : ', userId, nick));
  	const result = await userService.putUserFriend(userId, nick);
  if (result.error) return reply.code(400).send(result);
  return reply.send({ message: "🙌 Friend added successfully" });
}

exports.putStatus = async (request, reply) => {
  const source = "putStatus";

  const userId = request.headers['x-user-id'];
  if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
  const { userStatus } = request.body;
  	reply.log.info(...logFormat(source, '(check userId, userStatus) : ', userId, userStatus));
  const result = await userService.putUserStatus(userId, userStatus);
	  reply.log.info(...logFormat(source,"Result : ", result));
  if (result.error) return reply.code(400).send(result);
 	return reply.send({ message: `Set status : ${userStatus}`});
}

exports.upsertGoogle = async (request, reply) => {
  const source = exports.upsertGoogle.name;
  request.log.info(...logFormat(source, '🔥 [userController] Received upsert request:', request.body));

  const { email, name, picture, googleId } = request.body;

  if (!email || !googleId) {
    request.log.info(...logFormat(source, '❌ [userController] Missing email or googleId:', { email, googleId }));
    return reply.code(400).send({ error: 'Email and Google ID are required' });
  }
 // const nickname = payload.given_name || 'Google User';
/*   if (!user.nickname) {
    user.nickname = user.username;
  } */
  try {
    const result = await userService.upsertGoogleUser(email, name, picture, googleId);
    request.log.info(...logFormat(source, '✅ [userController] Success:', result));
    return reply.send(result);
  } catch (err) {
    request.log.error(...logFormat(source, '💥 [userController] Failed to upsert user:', err));
    return reply.code(500).send({ error: 'User creation failed' });
  }
};

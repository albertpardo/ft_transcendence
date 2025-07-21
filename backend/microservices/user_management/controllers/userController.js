const userService = require('../services/userService');

const logFormat = require('../pino_utils/log_format');

exports.getPublicNickname = async (request, reply) => {
	const { userId } = request.body;
	const result = await userService.getPublicNickname(userId);
//	console.log("hit from backend/microservices/user_management/controllers/userController.js", result);
    request.log.info(logFormat("getPublicNickname", "hit from backend/microservices/user_management/controllers/userController.js", result));
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
    const { username, password } = request.body;

//    const isValid = await userService.verifyUser(username, password);
//    if (!isValid) {
    const result = await userService.login(username, password);
    if (result.error) {
        return reply.code(401).send({ error: '🧸 Invalid credentials' });
    }

    //console.log('🎏 username and password are correct!');
    request.log.info(logFormat("login", '🎏 username and password are correct!'));
    //only return data here, without generating token which is created in API Gateway
//    return reply.send({ username });
    //return an object containing id and username
    return reply.send(result);
};

exports.getProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    //console.log("📦 userId from header:", userId);
    request.log.info(logFormat(getProfile, "📦 userId from header:", userId));

    const userInfo = await userService.getProfile(userId);
    return reply.send(userInfo);    
}

exports.updateProfile = async (request, reply) => {
	const source = "updateProfile";
    //console.log('🧩 updateProfile triggered');
    //console.log('📦 userId from header:', request.headers['x-user-id']);
    request.log.info(logFormat(source, '🧩 updateProfile triggered'));
    request.log.info(logFormat(source, '📦 userId from header:', request.headers['x-user-id']));
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    //console.log('🌎 request.body:', request.body);
    request.log.info(logFormat(source, '🌎 request.body:', request.body));

    const { username, nickname, email, password, avatar } = request.body;
/*
    if (username) {
        return reply.code(400).send({ error: "Username cannot be modified." });
    }
*/
    const result = await userService.updateProfile(userId, {
        username,
        nickname,
        email,
        password,
        avatar
    });
    //console.log('🌎 updatedResult:', result);
    request.log.info(logFormat(source, '🌎 updatedResult:', result));

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

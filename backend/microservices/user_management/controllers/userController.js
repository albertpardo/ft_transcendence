const userService = require('../services/userService');

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

    console.log('🎏 username and password are correct!');
    //only return data here, without generating token which is created in API Gateway
//    return reply.send({ username });
    //return an object containing id and username
    return reply.send(result);
};

exports.getProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    console.log("📦 userId from header:", userId);

    const userInfo = await userService.getProfile(userId);
    return reply.send(userInfo);    
}

exports.updateProfile = async (request, reply) => {
    console.log('🧩 updateProfile triggered');
    console.log('📦 userId from header:', request.headers['x-user-id']);
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

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
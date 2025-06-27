const userService = require('../services/userService');

exports.signup = async (request, reply) => {
    const { username, password, nickname, email } = request.body;
    const result = await userService.signup(username, password, nickname, email);
   /*  if (result.error) reply.code(400).send(result);
    reply.send(result); */

     if (result.error) {
        return reply.code(400).type('application/json').send(result); // corrected
    }
    reply.code(200).type('application/json').send(result);
};

exports.login = async (request, reply) => {
    const { username, password } = request.body;
    console.log('🟡 Login Request:', request.body);
    const result = await userService.login(username, password);
    console.log("result of the final login func:", result);

   /*  if (result.error) {
        reply.code(401).send({ error: '🧸 Invalid credentials' });
    }

    console.log('🎏 username and password are correct!');

    reply.send(result); */

    if (result.error) {
        return reply.code(401).type('application/json').send({ error: '🧸 Invalid credentials' }); // corrected
    }

    console.log('🎏 username and password are correct!');
    reply.code(200).type('application/json').send(result); // corrected
};

exports.getProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) reply.code(401).send({ error: 'Unauthorized' });
    console.log("📦 userId from header:", userId);

    const userInfo = await userService.getProfile(userId);
    reply.send(userInfo);    
}

exports.updateProfile = async (request, reply) => {
    console.log('🧩 updateProfile triggered');
    console.log('📦 userId from header:', request.headers['x-user-id']);
    const userId = request.headers['x-user-id'];
    if (!userId) reply.code(401).send({ error: 'Unauthorized' });

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

    if (result.error) reply.code(400).send(result);
    reply.send({ message: "🏄 Profile updated successfully" });
}

exports.deleteProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) reply.code(401).send({ error: 'Unauthorized' });

    const result = await userService.deleteProfile(userId);
    if (result.error) reply.code(400).send(result);
    reply.send({ message: "🏊 Profile deleted successfully" });
}

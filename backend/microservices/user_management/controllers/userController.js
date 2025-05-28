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
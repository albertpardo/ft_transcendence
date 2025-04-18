const userService = require('../services/userService');

exports.login = async (request, reply) => {
    const { username, password } = request.body;

    const isValid = userService.verifyUser(username, password);
    if (!isValid) {
        return reply.code(401).send({ error: '🧸 Invalid credentials' });
    }

    console.log('🎏 username and password are correct!');
    //only return data here, without generating token which is created in API Gateway
    return reply.send({ username });
};
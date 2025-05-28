const bcrypt = require('bcrypt');
const db = require('../db');

exports.signup = async (username, password, nickname, email) => {
    const existing = db.getUserByUsernameOrEmail(username, email);
    if (existing) return { error: 'This user already exists' };

    const nickexist = db.getNickname(nickname);
    if (nickexist) return { error: 'This nickname already exists' };

    const hashed = await bcrypt.hash(password, 10);
    const user = db.createUser({ username, password: hashed, nickname, email});
    return { id: user.id, username: user.username };
}

exports.verifyUser = async (username, password) => {
    const user = db.getUserByUsername(username);
    if (!user) return false;

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
};

exports.login = async (username, password) => {
    const user = db.getUserByUsername(username);
    if (!user) return { error: 'This user does not exist!' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { error: 'Password is incorrect!' };

    return { id: user.id, username: user.username };
};

exports.getProfile = async (userId) => {
    const user = db.getUserById(userId);
    if (!user) return { error: 'This user does not exist!' };

    return {
        userId: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        email: user.email,
        password: user.password
    };
}
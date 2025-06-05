const bcrypt = require('bcrypt');
const db = require('../db');

// copypaste from game service but it's js not ts
function makeid(length) {
   let result = '';
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const charactersLength = characters.length;
   let counter = 0;
   while (counter < length) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
     counter += 1;
   }
   return result;
}

exports.signup = async (username, password, nickname, email) => {
    const existing = db.getUserByUsernameOrEmail(username, email);
    if (existing) return { error: 'This user already exists' };

    const nickexist = db.getNickname(nickname);
    if (nickexist) return { error: 'This nickname already exists' };

    const hashed = await bcrypt.hash(password, 10);
	const localid = makeid(64);
	console.log("localid from the backend/microservices/user_management/services/userService.js is...");
	console.log(localid);
    const user = db.createUser({ id: localid, username, password: hashed, nickname, email});
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

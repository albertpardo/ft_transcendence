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

exports.getPublicNickname = async (userId) => {
	const nick = db.getNicknameById(userId);
	if (!nick) {
		return { error: "couldn't get nickname; user might be non-existent" };
	}
	console.log("hit from backend/microservices/user_management/services/userService.js", nick);
	return nick;
}

exports.signup = async (username, password, nickname, email, avatar = '') => {
    const existing = db.getUserByUsernameOrEmail(username, email);
    if (existing) return { error: 'This user already exists' };

    const nickexist = db.getNickname(nickname);
    if (nickexist) return { error: 'This nickname already exists' };

    const hashed = await bcrypt.hash(password, 10);
	const localid = makeid(64);
	console.log("localid from the backend/microservices/user_management/services/userService.js is...");
	console.log(localid);
    const user = db.createUser({ id: localid, username, password: hashed, nickname, email, avatar });
    return { id: user.id, username: user.username, avatar: user.avatar };
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

    return { 
        id: user.id, 
        username: user.username, 
        nickname: user.nickname || user.username, 
        email: user.email, 
        avatar: user.avatar 
    };
};

exports.getProfile = async (userId) => {
    const user = db.getUserById(userId);
    if (!user) return { error: 'This user does not exist!' };

    return {
        userId: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        email: user.email,
//        password: user.password,
        avatar: user.avatar
    };
}

exports.updateProfile = async (userId, { username, nickname, email, password, avatar }) => {
    const user = db.getUserById(userId);
    if (!user) return { error: "User not found" };

    const updateFields = {
        username: username ?? user.username,
        nickname: nickname ?? user.nickname,
        email: email ?? user.email,
//        password: user.password,
        avatar: avatar ?? user.avatar
    }

    if (password && password !== "" && !password.startsWith("$2b$") && typeof password === 'string') {
        const isSame = await bcrypt.compare(password, user.password);
        if (!isSame) {
            updateFields.password = await bcrypt.hash(password, 10);
        }
    }

    if (username && username !== user.username) {
        const existingUsername = db.getUserByUsernameOrEmail(username, user.email);
        if (existingUsername && existingUsername.id !== userId) {
            return { error: "Username already in use" };
        }
    }
    
    if (nickname && nickname !== user.nickname) {
        const nickexist = db.getNickname(nickname);
        if (nickexist && nickexist.id !== userId) {
            return { error: "Nickname already in use" };
        }
    }

    if (email && email !== user.email) {
        const existing = db.getUserByUsernameOrEmail(user.username, email);
        if (existing && existing.id !== userId) {
            return { error: "Email alrealdy in use" };
        }
    }

    db.updateUser(userId, updateFields);
    return { success: true };
}

exports.deleteProfile = async (userId) => {
    const user = db.getUserById(userId);
    if (!user) return { error: "User not found" };

    db.deleteUser(userId);
    return { success: true };
}

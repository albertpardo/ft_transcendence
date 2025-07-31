const bcrypt = require('bcrypt');
const db = require('../db');

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
   try {
    const existing = await db.getUserByUsernameOrEmail(username, email);

    if (existing) return { error: 'This user already exists' };

    const nickexist = await db.getNickname(nickname);
    if (nickexist) return { error: 'This nickname already exists' };

    const hashed = await bcrypt.hash(password, 10);
	const localid = makeid(64);
	console.log("localid from the backend/microservices/user_management/services/userService.js is...");
	console.log(localid);

    const user = db.createUser({ id: localid, username, password: hashed, nickname, email, avatar });
    return { id: user.id, username: user.username, avatar: user.avatar };

   } catch (error) {
    console.error("Error during signup:", error);
    return { error: 'An error occurred during signup' };
   }

}

exports.verifyUser = async (username, password) => {
    const user = await db.getUserByUsername(username);
    if (!user) return false;

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
};

exports.login = async (username, password) => {
    const user = await db.getUserByUsername(username);
    if (!user) return { error: 'This user does not exist!' };
    console.log("user recvd:", user);
    console.log("💥 reecieved login request: *** ", username, " *** 💥");

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
    const user = await db.getUserById(userId);
    console.log("DEBUG user from db.getUserById:", user);
    if (!user) return { error: 'This user does not exist!' };

    return {
        userId: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        email: user.email,
        avatar: user.avatar,
        password: user.password //should not be returned, but it's here for consistency

    };
}

exports.updateProfile = async (userId, { username, nickname, email, password, avatar }) => {
    const user = await db.getUserById(userId);
    if (!user) return { error: "User not found" };
 
    const updateFields = {
        username: username ?? user.username,
        nickname: nickname ?? user.nickname,
        email: email ?? user.email,
        avatar: avatar ?? user.avatar
    }

    if (password && password !== "" && !password.startsWith("$2b$") && typeof password === 'string') {
        const isSame = await bcrypt.compare(password, user.password);
        if (!isSame) {
            updateFields.password = await bcrypt.hash(password, 10);
        }
    }

    if (username && username !== user.username) {
        const existingUsername = await db.getUserByUsernameOrEmail(username, user.email);
        if (existingUsername && existingUsername.id !== userId) {
            return { error: "Username already in use" };
        }
    }
    
    if (nickname && nickname !== user.nickname) {
        const nickexist = await db.getNickname(nickname);
        if (nickexist && nickexist.id !== userId) {
            return { error: "Nickname already in use" };
        }
    }

    if (email && email !== user.email) {
        const existing = await db.getUserByUsernameOrEmail(user.username, email);
        if (existing && existing.id !== userId) {
            return { error: "Email already in use" };
        }
    }
    
    
    if (typeof avatar === 'string' && avatar !== user.avatar) {
      updateFields.avatar = avatar;
    }
    console.log("updateFields:", updateFields);

    await db.updateUser(userId, updateFields);
    return { success: true };
}

exports.deleteProfile = async (userId) => {
    const user = await db.getUserById(userId);
    if (!user) return { error: "User not found" };

    await db.deleteUser(userId);
    return { success: true };
}

exports.upsertGoogleUser = async (email, name, picture, googleId) => {
  console.log('🔍 [userService] upsertGoogleUser called with:', { email, googleId, name, picture });

  let user = db.getUserByEmail(email) || db.getUserByGoogleId(googleId);

  if (!user) {
    console.log('🆕 [userService] Creating new user');
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
    const localid = makeid(64);
    const firstName = name?.split(' ')[0] || 'User';
    const lastName = name?.split(' ').slice(1).join(' ') || 'Anonymous';
    const nickname = name?.trim() || firstName;

    try {
      user = db.createUser({
        id: localid,
        email,
        username,
        firstName,
        lastName,
        avatar: picture,
        googleId,
        status: 'online',
        nickname: nickname,
      });
      console.log('✅ [userService] Created user:', user);
    } catch (err) {
      console.error('❌ [userService] createUser failed:', err.message);
      console.error('❌ [userService] Full error:', err.stack);
      throw err;
    }
  } else {
    console.log('🔄 [userService] User found:', user.username);
    const updates = {};
    if (!user.avatar) updates.avatar = picture;
    if (!user.firstName) updates.firstName = name?.split(' ')[0] || 'User';
    if (!user.nickname && name) updates.nickname = name.trim();
    if (Object.keys(updates).length > 0) {
      try {
        db.updateUser(user.id, updates);
        console.log('✅ [userService] Updated user:', user.username);
      } catch (err) {
        console.error('❌ [userService] updateUser failed:', err.message);
        throw err;
      }
    }
  }

  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    email: user.email,
    nickname: user.nickname || user.firstName || 'Player',
  };
};
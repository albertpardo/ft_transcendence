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
	const nickRes = db.getNicknameById(userId);
	if (!nickRes) {
		return { 
			nick: "",
			err: "couldn't get nickname; user might be non-existent",
		};
	}
	return { 
		nick: nickRes.nickname,
		err: "nil",
	};
}

exports.signup = async (username, password, nickname, email, avatar = '') => {
    const existing = db.getUserByUsernameOrEmail(username, email);
    if (existing) return { error: 'This user already exists' };

    const nickexist = db.getNickname(nickname);
    if (nickexist) return { error: 'This nickname already exists' };

    const hashed = await bcrypt.hash(password, 10);
	const localid = makeid(64);
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

exports.getUserFriends = async (userId) => {
	const friends = db.getUserFriends(userId);
	return (friends); 
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

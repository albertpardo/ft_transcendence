const bcrypt = require('bcrypt');
const db = require('../db');
const transaction = require("../db");
// const transaction = require("../db").transaction;
/* const dbModule = require("../db");
const { db, transaction } = dbModule; */

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

exports.upsert42User = async (email, fortyTwoId, username, picture) => {
  fortyTwoId = String(fortyTwoId);
  console.log("🔍 [userService] upsert42User called with:", {
    email,
    fortyTwoId,
    username,
  });

  try {
    // SIMPLE IMPLEMENTATION - NO TRANSACTIONS
    let user =
      db.getUserBy42Id(fortyTwoId) || (email ? db.getUserByEmail(email) : null);

    if (!user) {
      console.log("🆕 [userService] Creating new 42 user");
      const localid = makeid(64);
      const firstName = username.split(" ")[0] || "User";
      const lastName = username.split(" ").slice(1).join(" ") || "Anonymous";

      user = db.createUser({
        id: localid,
        email,
        username,
        firstName,
        lastName,
        avatar: picture,
        fortyTwoId,
        status: "online",
        nickname: username,
      });
      console.log("✅ [userService] Created 42 user:", user.username);
    } else {
      console.log("🔄 [userService] User found:", user.username);
      const updates = {};
      if (!user.avatar && picture) updates.avatar = picture;
      if (user.username !== username) updates.username = username;
      if (user.nickname !== username) updates.nickname = user;
      updates.status = "online";

      if (Object.keys(updates).length > 0) {
        db.updateUser(user.id, updates);
      }
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      email: user.email,
      nickname: user.nickname,
    };
  } catch (err) {
    console.error("❌ Failed to upsert 42 user:", err);
    throw err;
  }
};
/* 
exports.upsert42User = async (email, fortyTwoId, username, picture) => {
  fortyTwoId = String(fortyTwoId);
  console.log("🔍 [userService] upsert42User called with:", {
    email,
    fortyTwoId,
    username,
  });

  try {
    // ATOMIC UPSERT - This is the only pattern that works reliably
    const upsertUser = transaction((email, fortyTwoId, username, picture) => {
      // First check if user exists
      let user = db
        .prepare("SELECT * FROM users WHERE fortyTwoId = ?")
        .get(fortyTwoId);

      if (!user && email) {
        user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      }

      if (!user) {
        console.log("🆕 [userService] Creating new 42 user");
        const localid = makeid(64);
        const firstName = username.split(" ")[0] || "User";
        const lastName = username.split(" ").slice(1).join(" ") || "Anonymous";

        // Create user
        const insert = db.prepare(`
          INSERT INTO users (
            id, username, password, nickname, email, avatar, 
            fortyTwoId, firstName, lastName, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
          localid,
          username,
          null,
          username,
          email,
          picture,
          fortyTwoId,
          firstName,
          lastName,
          "online"
        );

        // Get the created user
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(localid);
      } else {
        console.log("🔄 [userService] User found:", user.username);
        const updates = {};
        if (!user.avatar && picture) updates.avatar = picture;
        if (user.username !== username) updates.username = username;
        if (user.nickname !== username) updates.nickname = user;
        updates.status = "online";

        if (Object.keys(updates).length > 0) {
          const setClause = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
          const values = Object.values(updates);
          values.push(user.id);

          const update = db.prepare(
            `UPDATE users SET ${setClause} WHERE id = ?`
          );
          update.run(...values);
        }
      }

      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        email: user.email,
        nickname: user.nickname,
      };
    });

    // Execute the transaction
    return upsertUser(email, fortyTwoId, username, picture);
  } catch (err) {
    console.error("❌ Failed to upsert 42 user:", err);
    throw err;
  }
}; */
/* exports.upsert42User = async (email, fortyTwoId, username, picture) => {
  fortyTwoId = String(fortyTwoId);
  console.log("🔍 [userService] upsert42User called with:", {
    email,
    fortyTwoId,
    username,
  });

  try {
    return db.transaction(() => {
      // ATOMIC UPSERT - This is the only pattern that works reliably
      const upsert = db.prepare(`
        INSERT INTO users (
          id, username, password, nickname, email, avatar, 
          fortyTwoId, firstName, lastName, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(fortyTwoId) DO UPDATE SET
          username = excluded.username,
          email = excluded.email,
          avatar = COALESCE(excluded.avatar, users.avatar),
          firstName = excluded.firstName,
          lastName = excluded.lastName,
          status = 'online'
      `);

      const localid = makeid(64);
      const firstName = username.split(" ")[0] || "User";
      const lastName = username.split(" ").slice(1).join(" ") || "Anonymous";

      // Execute the upsert (insert or update in one atomic operation)
      const result = upsert.run(
        localid,
        username,
        null,
        username,
        email,
        picture,
        fortyTwoId,
        firstName,
        lastName,
        "online"
      );

      // Get the user (whether inserted or updated)
      const user = db
        .prepare("SELECT * FROM users WHERE fortyTwoId = ?")
        .get(fortyTwoId);

      if (!user) {
        throw new Error("User should exist but doesn't after upsert");
      }

      // Determine if this was a new user or update
      if (result.changes === 1 && result.lastInsertRowid) {
        console.log("✅ [userService] Created 42 user:", user.username);
      } else {
        console.log(
          "🔄 [userService] Updated existing 42 user:",
          user.username
        );
      }

      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        email: user.email,
        nickname: user.nickname,
      };
    })();
  } catch (err) {
    console.error("❌ Failed to upsert 42 user:", err);
    throw err;
  }
}; */

/*  exports.upsert42User = async (email, fortyTwoId, username, picture) => {
  fortyTwoId = String(fortyTwoId);
  console.log("🔍 [userService] upsert42User called with:", {
    email,
    fortyTwoId,
    username,
  });

  try {

    let user =
      db.getUserBy42Id(fortyTwoId) || (email ? db.getUserByEmail(email) : null);

    if (!user) {
      console.log("🆕 [userService] Creating new 42 user");
      const localid = makeid(64);
      const firstName = username.split(" ")[0] || "User";
      const lastName = username.split(" ").slice(1).join(" ") || "Anonymous";

      user = db.createUser({
        id: localid,
        email,
        username,
        firstName,
        lastName,
        avatar: picture,
        fortyTwoId,
        status: "online",
        nickname: username,
      });
      console.log("✅ [userService] Created 42 user:", user.username);
    } else {
      console.log("🔄 [userService] User found:", user.username);
      const updates = {};
      if (!user.avatar && picture) updates.avatar = picture;
      if (user.username !== username) updates.username = username;
      if (user.nickname !== username) updates.nickname = username;
      updates.status = "online";

      if (Object.keys(updates).length > 0) {
        db.updateUser(user.id, updates);
      }
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      email: user.email,
      nickname: user.nickname,
    };
  } catch (err) {
    console.error("❌ Failed to upsert 42 user:", err);
    throw err;
  }
};  */
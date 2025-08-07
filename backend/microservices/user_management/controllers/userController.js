const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

exports.getPublicNickname = async (request, reply) => {
	const { userId } = request.body;
	const result = await userService.getPublicNickname(userId);
	console.log("hit from backend/microservices/user_management/controllers/userController.js", result);
	if (result.error) {
		return reply.code(400).send(result);
	}
	return reply.send(result);
};

exports.signup = async (request, reply) => {
    const { username, password, nickname, email } = request.body;
    const result = await userService.signup(username, password, nickname, email);


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

  
    if (result.error) {
        return reply.code(401).type('application/json').send({ error: '🧸 Invalid credentials' });
    }

    const token = jwt.sign(
        { userId: result.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    console.log('🎏 username and password are correct!');
    reply.code(200).type('application/json').send({ ...result, token });
};

exports.getProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    console.log("📦 userId from header:", userId);

    const userInfo = await userService.getProfile(userId);
    console.log("🛠️ Sending response:", userInfo);
    reply.send(userInfo);
}

exports.updateProfile = async (request, reply) => {
    console.log('🧩 updateProfile triggered');
    console.log('📦 userId from header:', request.headers['x-user-id']);
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    console.log('🌎 request.body:', request.body);

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


    // if (result.error) reply.code(400).send(result);
     if (result.error) return reply.code(400).type('application/json').send(result);

    // reply.send({ message: "🏄 Profile updated successfully" });
    reply.type('application/json').send({ message: "🏄 Profile updated successfully" });

}

exports.deleteProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    const result = await userService.deleteProfile(userId);


    // if (result.error) reply.code(400).send(result);
    if (result.error) return reply.code(400).type('application/json').send(result);

    // reply.send({ message: "🏊 Profile deleted successfully" });
    reply.type('application/json').send({ message: "🏊 Profile deleted successfully" });
}

exports.upsert42User = async (request, reply) => {
  console.log("🔥 [userController] Received 42 upsert request:", request.body);

  const { email, fortyTwoId, username, picture } = request.body;
  const fortyTwoIdStr = String(fortyTwoId); 

  if (!email || !fortyTwoIdStr || !username) {
    console.log("❌ [userController] Missing required fields:", {
      email,
      fortyTwoId: fortyTwoIdStr,
      username,
    });
    return reply
      .code(400)
      .send({ error: "Email, username, and 42 ID are required" });
  }

  try {
    const result = await userService.upsert42User(
      email,
      fortyTwoIdStr,
      username,
      picture
    );
    console.log("✅ [userController] Success:", result);
    return reply.send(result);
  } catch (err) {
    console.error("💥 [userController] Failed to upsert 42 user:", err);
    return reply.code(500).send({ error: "User creation failed" });
  }
};

/* exports.upsert42User = async (request, reply) => {
  console.log("🔥 [userController] Received 42 upsert request:", request.body);

  const { email, fortyTwoId, username, picture } = request.body;

  fortyTwoId = String(fortyTwoId);
  if (!email || !fortyTwoId || !username) {
    console.log("❌ [userController] Missing required fields:", {
      email,
      fortyTwoId,
      username,
    });
    return reply.code(400).send({ error: "Email, username, and 42 ID are required" });
  }

  try {
    const result = await userService.upsert42User(
      email,
      fortyTwoId,
      username,
      picture
    );
    console.log("✅ [userController] Success:", result);
    return reply.send(result);
  } catch (err) {
    console.error("💥 [userController] Failed to upsert 42 user:", err);
    return reply.code(500).send({ error: "User creation failed" });
  }
}; */
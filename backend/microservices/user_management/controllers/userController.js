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
        return reply.code(400).type('application/json').send(result);
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

    const result = await userService.updateProfile(userId, {
        username,
        nickname,
        email,
        password,
        avatar
    });


     if (result.error) return reply.code(400).type('application/json').send(result);

    reply.type('application/json').send({ message: "🏄 Profile updated successfully" });

}

exports.deleteProfile = async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    const result = await userService.deleteProfile(userId);

    if (result.error) return reply.code(400).type('application/json').send(result);

    reply.type('application/json').send({ message: "🏊 Profile deleted successfully" });
}

exports.upsertGoogle = async (request, reply) => {
  console.log("🔥 [userController] Received upsert request:", request.body);

  const { email, name, picture, googleId } = request.body;

  if (!email || !googleId) {
    console.log("❌ [userController] Missing email or googleId:", {
      email,
      googleId,
    });
    return reply.code(400).send({ error: "Email and Google ID are required" });
  }

  try {
    const result = await userService.upsertGoogleUser(
      email,
      name,
      picture,
      googleId
    );
    console.log("✅ [userController] Success:", result);
    return reply.send(result);
  } catch (err) {
    console.error("💥 [userController] Failed to upsert user:", err);
    return reply.code(500).send({ error: "User creation failed" });
  }
};
//const { generateToken } = require('../services/authServices');
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

console.log('exampleRoutes is registered');
// define a route and export a function
module.exports = async function exampleRoutes(fastify: FastifyInstance) {
    /*
    fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
        console.log("🔍 Body received at backend:", request.body);

        const { username, password } = request.body as { username: string, password: string };

        if (username === 'admin' && password === 'password') {
            //produce JWT with authService
            const token = generateToken(username);
            console.log('Arrive at generateTocken: ', token);
            return { token };
        } else {
            return reply.code(401).send({ error: 'Invalid username or password' });
        }
    });
    */

    //  NEW: Google Login Route
    fastify.post('/google-login', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { googleToken, user } = request.body as { 
                googleToken: string, 
                user: { name: string, email: string, picture: string, sub: string } 
            };
            
            console.log(" Google login request received:", { email: user?.email, name: user?.name });
            
            if (!googleToken || !user) {
                return reply.status(400).send({ 
                    error: 'Missing Google token or user data' 
                });
            }

            // Verify Google token (basic validation)
            try {
                // Decode JWT to verify it's valid format
                const payload = JSON.parse(atob(googleToken.split('.')[1]));
                
                // Basic validation
                if (!payload.email || !payload.name) {
                    throw new Error('Invalid Google token payload');
                }
                
                console.log("Google token validated for:", payload.email);
            } catch (tokenError) {
                console.error("Google token validation failed:", tokenError);
                return reply.status(400).send({ 
                    error: 'Invalid Google token' 
                });
            }

            // Check if user exists in database (call user management service)
            const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-management:3002';
            
            try {
                // Try to find existing user by email
                console.log("Looking for existing user with email:", user.email);
                const existingUserResponse = await fetch(`${userServiceUrl}/users/by-email/${user.email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                let userData;
                
                if (existingUserResponse.ok) {
                    // User exists, use existing data
                    userData = await existingUserResponse.json();
                    console.log("Found existing user:", userData.username);
                } else {
                    // User doesn't exist, create new user
                    console.log("Creating new Google user:", user.email);
                    const createUserResponse = await fetch(`${userServiceUrl}/users`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nickname: user.name,
                            username: user.email,
                            email: user.email,
                            password: 'google_oauth', // Placeholder for OAuth users
                            avatar: user.picture,
                            provider: 'google',
                            providerId: user.sub
                        })
                    });

                    if (!createUserResponse.ok) {
                        const errorData = await createUserResponse.json();
                        throw new Error(errorData.message || 'Failed to create user');
                    }

                    userData = await createUserResponse.json();
                    console.log("Created new user:", userData.username);
                }

                // Generate JWT token
                const token = fastify.jwt.sign({ 
                    id: userData.id, 
                    username: userData.username,
                    email: userData.email,
                    provider: 'google'
                });

                console.log("Google login successful for:", userData.username);

                // Return success response
                return reply.send({
                    success: true,
                    token: token,
                    id: userData.id,
                    user: {
                        username: userData.username,
                        nickname: userData.nickname,
                        email: userData.email,
                        avatar: userData.avatar || user.picture
                    }
                });

            } catch (userServiceError) {
                console.error('User service error:', userServiceError);
                
                // Fallback: create temporary session without database
                console.log("Creating fallback session for:", user.email);
                const tempToken = fastify.jwt.sign({ 
                    id: user.sub,
                    username: user.email,
                    email: user.email,
                    provider: 'google_temp'
                });

                return reply.send({
                    success: true,
                    token: tempToken,
                    id: user.sub,
                    user: {
                        username: user.email,
                        nickname: user.name,
                        email: user.email,
                        avatar: user.picture
                    }
                });
            }

        } catch (error) {
            console.error('Google login error:', error);
            return reply.status(500).send({ 
                error: 'Internal server error during Google authentication' 
            });
        }
    });

    // handle GET request
    fastify.get('/example', async (request: FastifyRequest, reply: FastifyReply) => {
        return { 
            message: 'Hello, Fastify with TypeScript!',
            user: request.user
         };
    });

    // define more routes
    fastify.post('/example', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as { name: string };
        return { message: `Hello, ${body.name}` };
    });
};
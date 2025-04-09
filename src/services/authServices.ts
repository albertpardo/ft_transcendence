const jwt = require('jsonwebtoken'); // import jsonwebtoken lib

// function to create JWT
function generateToken(username: string) {
    return jwt.sign({ user: username }, 'super-secret-key', { expiresIn: '1h' });
}

module.exports = { generateToken };
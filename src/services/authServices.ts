require('dotenv').config();

const jwt = require('jsonwebtoken'); // import jsonwebtoken lib

// function to create JWT
function generateToken(username: string) {
    return jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { generateToken };
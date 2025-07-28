
const express = require('express');
const router = express.Router();
const { generateToken } = require('../services/authService');

router.post('/generate-token', (req, res) => {
    const { user } = req.body;

    if (!user || !user.id || !user.username) {
        return res.status(400).json({ error: 'User data is required' });
    }

    try {
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            provider: 'google'
        });
        res.json({ token });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

module.exports = router;

const db = require('better-sqlite3')('./users.db');

const init = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    nickname TEXT,
    email TEXT UNIQUE)` 
);
init.run();

function getUserByUsernameOrEmail(username, email) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?');
    return stmt.get(username, email);
}

function getUserByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
}

function getNickname(nickname) {
    const stmt = db.prepare('SELECT * FROM users WHERE nickname = ?');
    return stmt.get(nickname);
}

function getUserById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
}

function createUser({ username, password, nickname, email }) {
    const stmt = db.prepare('INSERT INTO users (username, password, nickname, email) VALUES (?, ?, ?, ?)');
    const info = stmt.run(username, password, nickname, email);
    return { id: info.lastInsertRowid, username };
}

module.exports = {
    getUserByUsernameOrEmail,
    getUserByUsername,
    getUserById,
    getNickname,
    createUser
};
const fs = require('fs');
const path = require('path');
const betterSqlite = require('better-sqlite3'); //('./users.db');

const dbPath = process.env.NODE_ENV === 'production'
    ?  '/opt/render/.cache/sqlite/users.db' : path.join(__dirname, 'users.db');


try {
    if (process.env.NODE_ENV === 'production') {
      fs.mkdirSync('/opt/render/.cache/sqlite', { recursive: true });
      console.log('✅ Ensured SQLite directory exists');
    }
    const db = betterSqlite(dbPath);
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
} catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
}

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
    createUser,
    db, 
};
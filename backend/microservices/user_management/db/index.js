const db = require('better-sqlite3')('./users.db');

// TODO make the id a "TEXT PRIMARY KEY UNIQUE", make all the corresponding changes in all the api.
const init = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY UNIQUE,
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
	const info = stmt.get(username);
//	console.log(info);
    return info;
}

function getNickname(nickname) {
    const stmt = db.prepare('SELECT * FROM users WHERE nickname = ?');
    return stmt.get(nickname);
}

function getUserById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
}

function createUser({ id, username, password, nickname, email }) {
    const stmt = db.prepare('INSERT INTO users (id, username, password, nickname, email) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(id, username, password, nickname, email);
	const stmt2 = db.prepare('SELECT * FROM users WHERE id = ?');
	const info2 = stmt2.all(id);
//	console.log("You're about to witness stmt2's results:");
//	console.log(info2);
    return { id: info2[0].id, username };
}

module.exports = {
    getUserByUsernameOrEmail,
    getUserByUsername,
    getUserById,
    getNickname,
    createUser
};

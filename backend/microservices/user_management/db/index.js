const db = require('better-sqlite3')('./users.db');

// TODO make the id a "TEXT PRIMARY KEY UNIQUE", make all the corresponding changes in all the api.
const init = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    nickname TEXT,
    email TEXT UNIQUE,
    avatar TEXT DEFAULT '')` 
);
init.run();

function getNicknameById(userId) {
	const stmt = db.prepare('SELECT nickname FROM users WHERE id = ?');
	console.log("hit from backend/microservices/user_management/db/index.js");
	return stmt.get(userId);
}

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

function createUser({ id, username, password, nickname, email, avatar = '' }) {
    const stmt = db.prepare('INSERT INTO users (id, username, password, nickname, email, avatar) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(id, username, password, nickname, email, avatar);
	const stmt2 = db.prepare('SELECT * FROM users WHERE id = ?');
	const info2 = stmt2.all(id);
    return { id: info2[0].id, username, avatar:info2[0].avatar };
}

function updateUser(userId, updates) {
/*
    const stmt = db.prepare(`
        UPDATE users SET
        username = ?,
        nickname = ?,
        email = ?,
        password = ?,
        avatar = ?
        WHERE id = ?
    `);
    stmt.run(username, nickname, email, password, avatar || '', userId);
*/
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...values, userId);
}

function deleteUser(userId) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
}

module.exports = {
	getNicknameById,
    getUserByUsernameOrEmail,
    getUserByUsername,
    getUserById,
    getNickname,
    createUser,
    updateUser,
    deleteUser
};

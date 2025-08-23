const { get } = require('http');

const db = require('better-sqlite3')('./users.db');

db.pragma('foreign_keys = ON');   // No set by default

// TODO make the id a "TEXT PRIMARY KEY UNIQUE", make all the corresponding changes in all the api.
/* 250822:
 *
 * Esta línea :
 * status TEXT DEFAULT 'offline')
 *
 * Se podria poner la alternativa :
 * status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline'))
 *
 */ 
const init = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    nickname TEXT,
    email TEXT UNIQUE,
    avatar TEXT DEFAULT '',
    googleId TEXT UNIQUE,
    firstName TEXT,
    lastName TEXT,
    status TEXT DEFAULT 'offline')` 
);
init.run();

// table friends by apardo-m
const initFriends = db.prepare(`
    CREATE TABLE IF NOT EXISTS friends (
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id))`
);
initFriends.run();


function getNicknameById(userId) {
	const stmt = db.prepare('SELECT nickname FROM users WHERE id = ?');
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

function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

function getNickname(nickname) {
    const stmt = db.prepare('SELECT * FROM users WHERE nickname = ?');
    return stmt.get(nickname);
}

function getUserById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
}

function getUserByGoogleId(googleId) {
  const stmt = db.prepare('SELECT * FROM users WHERE googleId = ?');
  return stmt.get(googleId);
}

function createUser({ id, username, password, nickname, email, avatar = '', googleId = null, firstName = 'User', lastName = 'Anonymous', status = 'offline' }) {
    const stmt = db.prepare('INSERT INTO users (id, username, password, nickname, email, avatar, googleId, firstName, lastName, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(id, username, password, nickname, email, avatar, googleId, firstName, lastName, status);
    const stmt2 = db.prepare('SELECT * FROM users WHERE id = ?');
    const info2 = stmt2.all(id);
    return { 
        id: info2[0].id, 
        username: info2[0].username, 
        avatar: info2[0].avatar ,
        nickname: info2[0].nickname,
        email: info2[0].email,
        googleId: info2[0].googleId,
        firstName: info2[0].firstName,
        lastName: info2[0].lastName,
        status: info2[0].status
    };
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
         if (['username', 'nickname', 'email', 'password', 'avatar', 'googleId', 'firstName', 'lastName', 'status'].includes(key)) {
            fields.push(`${key} = ?`);
            values.push(value);
         }
    } 
    if (fields.length === 0) return;
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...values, userId);
}

function deleteUser(userId) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
}

// by apardo-m for friends 
function addFriendById(userId, friendId) {
	const stmt = db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)');
	stmt.run(userId, friendId);
}

function getIdByNickname(nick) {
	const stmt = db.prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
	return stmt.run(nick);
}

function addFriendByNick(userId, friendNick) {
	const friendId = getIdByNickname(friendNick);
    if (friendId) {
		addFriendById(userId, friendId);
	}
	//TODO : Gestionar Error que friendNick no exista????
}

function getUserFriends(userId) {
	const stmt = db.prepare('SELECT u.nickname, u.status FROM friends f JOIN users u ON f.friend_id = u.id WHERE f.user_id = ?');
	return stmt.run(userId);
}

module.exports = {
	getNicknameById,
    getUserByUsernameOrEmail,
    getUserByUsername,
    getUserById,
    getUserByEmail,
    getUserByGoogleId,
    getNickname,
    createUser,
    updateUser,
    deleteUser,
	addFriendByNick,
	getUserFriends
};

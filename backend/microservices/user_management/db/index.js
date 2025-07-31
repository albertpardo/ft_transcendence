const { get } = require('http');

const db = require('better-sqlite3')('./users.db');

// TODO make the id a "TEXT PRIMARY KEY UNIQUE", make all the corresponding changes in all the api.
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
    const resp = stmt.get(id);
    console.log("resp is", resp);
    return resp;
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
   
   const fields = [];
   const values = [];
   
   for (const [key, value] of Object.entries(updates)) {
        if (typeof value !== 'undefined') {
           fields.push(`${key} = ?`);
           values.push(value);
       }
   }
   if (fields.length === 0) {
        console.warn("⚠️ No fields to update in updateUser");
        return;
   }


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
    deleteUser
};

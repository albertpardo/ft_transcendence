const db = require('better-sqlite3')('./users.db');
const transaction = db.transaction.bind(db);

const init = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    nickname TEXT,
    email TEXT UNIQUE,
    avatar TEXT DEFAULT '',
    fortyTwoId TEXT UNIQUE,
    firstName TEXT,
    lastName TEXT,
    status TEXT DEFAULT 'offline')`);
init.run();
db.exec(
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_fortyTwoId ON users(fortyTwoId)`
);
try {
  db.exec(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_fortyTwoId ON users(fortyTwoId)`
  );
} catch (e) {
  console.log("Index already exists:", e.message);
}

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
    return info;
}

function getNickname(nickname) {
    const stmt = db.prepare('SELECT * FROM users WHERE nickname = ?');
    return stmt.get(nickname);
}

function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

function getUserById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const resp = stmt.get(id);
    console.log("resp is", resp);
    return resp;
}

function getUserBy42Id(fortyTwoId) {
  const stmt = db.prepare("SELECT * FROM users WHERE fortyTwoId = ?");
  return stmt.get(fortyTwoId);
}

function createUser({
  id,
  username,
  password,
  nickname,
  email,
  avatar = "",
  fortyTwoId = null,
  firstName = "User",
  lastName = "Anonymous",
  status = "offline",
}) {
  const stmt = db.prepare(
    "INSERT INTO users (id, username, password, nickname, email, avatar, fortyTwoId, firstName, lastName, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const info = stmt.run(
    id,
    username,
    password,
    nickname,
    email,
    avatar,
    fortyTwoId,
    firstName,
    lastName,
    status
  );
  const stmt2 = db.prepare("SELECT * FROM users WHERE id = ?");
  const info2 = stmt2.get(id);
  return {
    id: info2[0].id,
    username: info2[0].username,
    avatar: info2[0].avatar,
    nickname: info2[0].nickname,
    email: info2[0].email,
    fortyTwoId: info2[0].fortyTwoId,
    firstName: info2[0].firstName,
    lastName: info2[0].lastName,
    status: info2[0].status,
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
  getUserBy42Id,
  getNickname,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  db,
  transaction,
};
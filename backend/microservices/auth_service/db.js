const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'auth.db'));

// initialize table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      has_seen_2fa_prompt INTEGER DEFAULT 0,
      has_2fa INTEGER DEFAULT 0,
      twofa_secret TEXT
    );
`);

module.exports = db;

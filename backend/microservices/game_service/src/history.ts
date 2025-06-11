// src/history.ts
import Database from 'better-sqlite3';

export const historyMain = async () => {
  const db = Database('/app/dbs/history.db');
  const init = db.prepare(`
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY UNIQUE,
    date NUMBER,
    leftId TEXT,
    rightId TEXT,
    scoreL NUMBER,
    scoreR NUMBER,
    state TEXT
  )`);
  init.run();
  console.log(db);
}

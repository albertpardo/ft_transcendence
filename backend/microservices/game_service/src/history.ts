// src/history.ts
import Database from 'better-sqlite3';
const db = Database('/app/dbs/history.db');

export const historyMain = async () => {
  const init = db.prepare(`
  CREATE TABLE IF NOT EXISTS matches (
    id NUMBER PRIMARY KEY AUTOINCREMENT,
    gameId TEXT,
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

export const addMatch = async (gameId : string, leftId : string, rightId : string, scoreL : number, scoreR : number) => {
  const init = db.prepare("INSERT INTO matches (gameId, date, leftId, rightId, scoreL, scoreR, state) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const info = init.run(gameId, Date.now(), leftId, rightId, scoreL, scoreR, (scoreL > scoreR ? "left" : "right"));
}

// src/history.ts
import Database from 'better-sqlite3';
const db = Database('/app/dbs/history.db');

export const historyMain = async () => {
  const init = db.prepare(`
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gameId TEXT,
    date INTEGER,
    leftId TEXT,
    rightId TEXT,
    scoreL INTEGER,
    scoreR INTEGER,
    state TEXT
  )`);
  init.run();
}

export const addMatch = async (gameId : string, leftId : string, rightId : string, scoreL : number, scoreR : number) => {
  const init = db.prepare("INSERT INTO matches (gameId, date, leftId, rightId, scoreL, scoreR, state) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const info = init.run(gameId, Date.now(), leftId, rightId, scoreL, scoreR, (scoreL > scoreR ? "left" : "right"));
}

export const getAll = async () => {
	const stmt2 = db.prepare('SELECT * FROM matches');
	const info2 = stmt2.all();
  console.log(info2);
}

export const getHistForPlayerFromDb = async (playerId : string) => {
	const stmt2 = db.prepare('SELECT * FROM matches WHERE leftId==? OR rightId==?');
	const info2 = stmt2.all(playerId, playerId);
  return (info2);
}

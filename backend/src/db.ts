// src/db.ts
// const db = await open({
//     filename: './database.db', // ruta relativa desde el punto de ejecución
//     driver: sqlite3.Database
//   });
  
// src/db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// modo verbose para debug
sqlite3.verbose();

export const initDB = async () => {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  // Crea una tabla si no existe
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nickname TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      avatar TEXT
    )
  `);

  return db;
};

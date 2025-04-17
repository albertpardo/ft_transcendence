// // src/db.ts
// import sqlite3 from 'sqlite3';
// import { open } from 'sqlite';

// // modo verbose para debug
// sqlite3.verbose();

// export const initDB = async () => {
//   const db = await open({
//     filename: './database.db',
//     driver: sqlite3.Database
//   });

//   await db.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       nickname TEXT NOT NULL UNIQUE,
//       email TEXT NOT NULL UNIQUE,
//       avatar TEXT
//     )
//   `);

//   return db;
// };

// src/db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Modo verbose para debug
sqlite3.verbose();

export const initDB = async () => {
  // 1) Leer URL de la DB desde entorno (p.ej. sqlite:///app/data/database.db)
  const dbUrl = process.env.DATABASE_URL || 'sqlite:///database.db';

  // 2) Obtener la ruta de fichero quitando el prefijo sqlite:///
  let filename: string;
  if (dbUrl.startsWith('sqlite:///')) {
    filename = dbUrl.replace(/^sqlite:\/\//, '');
  } else {
    // fallback a ruta local
    filename = path.resolve(process.cwd(), dbUrl);
  }

  console.log('📂 Ruta de la base de datos:', filename);

  // 3) Abrir la base de datos
  const db = await open({
    filename,
    driver: sqlite3.Database,
  });

  // 4) Asegurar la tabla users
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

// src/db.ts
import knex from "knex";
import path from "path";

// __dirname aqui será /caminho/do/projeto/src
const sqliteFilePath = path.resolve(__dirname, '..', 'clinicaslink.sqlite'); // Volta um nível para a raiz
console.log("Caminho do arquivo SQLite sendo usado pelo Knex:", sqliteFilePath);

const db = knex({
  client: "sqlite3",
  connection: {
    filename: sqliteFilePath
  },
  useNullAsDefault: true,
});

export default db;
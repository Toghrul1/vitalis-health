import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.env.DATA_DIR || join(process.cwd(), 'data');
let database: DatabaseSync;
export function db() {
 if (!database) {
  mkdirSync(dir,{recursive:true});
  database = new DatabaseSync(join(dir,'vitalis.sqlite'));
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, doctor_id TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, visit_type TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(doctor_id,date,time));`);
 }
 return database;
}

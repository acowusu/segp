

import * as DB from 'better-sqlite3';
import type { Database } from 'better-sqlite3';

let database : Database | undefined;

export function getDatabase(filename:string) {
  return database ??= new DB(filename);
}
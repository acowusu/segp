import Database from "better-sqlite3";
import { Database as DatabaseType } from "better-sqlite3";
import isDev from "electron-is-dev";
let database: DatabaseType | undefined;
import { resolve } from "path";

export function getDatabase(filename: string) {
  if (!isDev && !database) {
    return new Database(filename, {
      nativeBinding:resolve(
        __dirname,
        "../../app.asar.unpacked/dist-native/better_sqlite3.node"
      ),
    });
  }
  return (database ??= new Database(filename,
    {
      nativeBinding:resolve(
        __dirname,
        "../dist-native/better_sqlite3.node"
      ),
    }));
}

export function closeDatabase() {
  database?.close();
  database = undefined;
}

const tables = new Map([
  [
    "topics",
    {
      schema: "(id INTEGER, real REAL, text TEXT,)",
      data: [],
    },
  ],
  [
    "large_text",
    {
      schema: "(text TEXT)",
      data: ["this is the text".repeat(2048)],
      count: 10000,
    },
  ],
  [
    "large_blob",
    {
      schema: "(blob BLOB)",
      data: [Buffer.from("this is the blob".repeat(2048))],
      count: 10000,
    },
  ],
]);

export function setupDatabase() {
  if (!database) throw new Error("Database not initialized");
  for (const [name, ctx] of tables.entries()) {
    database.exec(`CREATE TABLE ${name} ${ctx.schema}`);
    const columns = (database.pragma(`table_info(${name})`) as unknown[]).map(
      () => "?"
    );

    for (let i = 0; i < ctx.data.length; i++) {
      const row = ctx.data[i];
      const insert = database
        .prepare(`INSERT INTO ${name} VALUES (${columns.join(", ")})`)
        .bind(row);
      insert.run();
    }
  }
}

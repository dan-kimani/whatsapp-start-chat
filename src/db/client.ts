import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";
import migrations from "./migrations/migrations";

const sqlite = openDatabaseSync("whatsapp_quick_chat.db");

sqlite.execSync("PRAGMA journal_mode = WAL");
sqlite.execSync("PRAGMA foreign_keys = ON");

const migrationDb = drizzle(sqlite);
migrate(migrationDb, migrations);

export const db = drizzle(sqlite, { schema });

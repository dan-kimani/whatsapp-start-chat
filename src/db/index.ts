import * as SQLite from "expo-sqlite";

interface RecentContact {
  id: number;
  phone_number: string;
  country_code: string;
  country: string;
  flag: string;
  used_at: number;
}

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (this.db) return;

    this.db = await SQLite.openDatabaseAsync("whatsapp_quick_chat.db");

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS recent_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        country_code TEXT NOT NULL,
        country TEXT NOT NULL,
        flag TEXT NOT NULL,
        used_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_phone_number ON recent_contacts(phone_number);
      CREATE INDEX IF NOT EXISTS idx_used_at ON recent_contacts(used_at DESC);
    `);
  }

  async saveContact(
    phoneNumber: string,
    countryCode: string,
    country: string,
    flag: string
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const usedAt = Date.now();

    // Check if contact exists
    const existing = await this.db.getFirstAsync<RecentContact>(
      "SELECT * FROM recent_contacts WHERE phone_number = ?",
      [phoneNumber]
    );

    if (existing) {
      // Update existing contact
      await this.db.runAsync(
        "UPDATE recent_contacts SET used_at = ?, country_code = ?, country = ?, flag = ? WHERE phone_number = ?",
        [usedAt, countryCode, country, flag, phoneNumber]
      );
    } else {
      // Insert new contact
      await this.db.runAsync(
        "INSERT INTO recent_contacts (phone_number, country_code, country, flag, used_at) VALUES (?, ?, ?, ?, ?)",
        [phoneNumber, countryCode, country, flag, usedAt]
      );
    }
  }

  async getRecentContacts(limit: number = 5): Promise<RecentContact[]> {
    await this.init();
    if (!this.db) return [];

    const contacts = await this.db.getAllAsync<RecentContact>(
      "SELECT * FROM recent_contacts ORDER BY used_at DESC LIMIT ?",
      [limit]
    );

    return contacts;
  }

  async deleteContact(phoneNumber: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.runAsync("DELETE FROM recent_contacts WHERE phone_number = ?", [
      phoneNumber,
    ]);
  }

  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.runAsync("DELETE FROM recent_contacts");
  }
}

export const database = new Database();
export type { RecentContact };

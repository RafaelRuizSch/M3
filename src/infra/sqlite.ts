import type { DBProvider } from "../contracts/dbProvider.ts";
import { DatabaseSync } from "node:sqlite";
import type { HistoryEntry } from "../contracts/types.ts";

export class SQLiteDB implements DBProvider {
    private db: DatabaseSync;

    constructor(dbFilePath: string) {
        this.db = new DatabaseSync(dbFilePath);
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
    
    saveSession(session: string, data: HistoryEntry): void {
        this.db.prepare(`
            INSERT INTO history (session, role, content)
            VALUES (?, ?, ?);
        `).run(session, data.role, data.content);
    }

    loadSession(session: string): HistoryEntry[] {
        const rows = this.db.prepare(`
            SELECT * FROM history
            WHERE session = ?
        `).all(session);
        return rows.map((row: any) => ({
            role: row.role,
            content: row.content
        }));
    }
}
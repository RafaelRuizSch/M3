import type { HistoryEntry } from "./types";

export interface DBProvider {
    saveSession(session: string, data: HistoryEntry): void;
    loadSession(session: string): HistoryEntry[];
}
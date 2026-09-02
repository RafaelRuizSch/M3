import type { HistoryEntry } from "../contracts/types.ts";

export function stitchContext(summary: string | undefined, role: HistoryEntry['role'] | undefined, history: HistoryEntry[]): HistoryEntry[] {
    const stitchedHistory: HistoryEntry[] = [];

    if (summary) {
        stitchedHistory.push({
            role: "system",
            content: `Summary of previous conversation: ${summary}`
        });
    }

    if (role) {
        stitchedHistory.push({
            role: role,
            content: `Role of the user: ${role}`
        });
    }

    return [
        ...stitchedHistory,
        ...history
    ];
}
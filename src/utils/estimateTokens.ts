import type { AIProvider } from "../contracts/aiProvider.ts";
import type { Conversation, HistoryEntry } from "../contracts/types.ts";
import { SumarizeMessages } from "./sumarize.ts";

const AVERAGE_CHARS_PER_TOKEN = 3;
const MAX_TOKENS = 4096;

export async function maybeCompressHistory(conversation: Conversation, aiProvider: AIProvider): Promise<HistoryEntry[]> {
    const history = conversation.getHistory();
    const estimatedTokens = estimateTokens(history);

    if (estimatedTokens > MAX_TOKENS) {
        const half = Math.floor(history.length / 2);
        const messagesToKeep = history.slice(half);
        const messagesToSummarize = history.slice(0, half);

        const summary = await SumarizeMessages(messagesToSummarize, aiProvider);

        const summaryEntry: HistoryEntry = {
            role: "system",
            content: `Summary of previous conversation: ${summary}`
        };

        return [summaryEntry, ...messagesToKeep];
    }

    return history;
}

export function estimateTokens(history: HistoryEntry[]): number {
    let totalChars = 0;
    for (const entry of history) {
        totalChars += entry.content.length;
    }
    const estimatedTokens = Math.ceil(totalChars / AVERAGE_CHARS_PER_TOKEN);
    return estimatedTokens;
}
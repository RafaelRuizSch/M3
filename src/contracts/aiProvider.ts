import { PERSONAS } from "./personas.ts";
import type { Conversation, HistoryEntry } from "./types.ts";

type PersonaKey = keyof typeof PERSONAS;

export interface AIProvider {
    generateText(prompt: string, persona?: PersonaKey): Promise<string>;
    generateTextWithMessages(system: string, history: HistoryEntry[]): Promise<string>;
    generateStreamedText(prompt: string, persona?: PersonaKey): Promise<string>;
    generateStreamedTextWithHistory(history: HistoryEntry[]): Promise<string>;
    generateWithCritique(prompt: string, persona?: PersonaKey): Promise<string>;
    makeEmbedding(text: string): Promise<number[]>;
}
import { PERSONAS } from "./personas";
import type { HistoryEntry } from "./types";

type PersonaKey = keyof typeof PERSONAS;

export interface AIProvider {
    generateText(prompt: string, persona?: PersonaKey): Promise<string>;
    generateStreamedText(prompt: string, persona?: PersonaKey): Promise<string>;
    generateStreamedTextWithHistory(history: HistoryEntry[]): Promise<string>;
    generateWithCritique(prompt: string, persona?: PersonaKey): Promise<string>;
}
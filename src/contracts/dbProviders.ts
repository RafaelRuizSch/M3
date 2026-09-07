import { chunkText } from "../utils/chuckText.ts";
import type { AIProvider } from "./aiProvider.ts";
import type { HistoryEntry } from "./types.ts";

export interface ISessionProvider {
    saveSession(session: string, data: HistoryEntry): void;
    loadSession(session: string): HistoryEntry[];
}

export type Document = {
    source: string;
    chunk: string;
    embeddings: number[];
}

export type SearchDocument = {
    chunk: string;
    embeddings: string;
    score: number;
}

export interface IDocumentsProvider {
    saveDocument(source: string, chunk: string, embeddings: number[]): void;
    searchDocuments(input: string, embeddings: number[], topK?: number, minScore?: number): Promise<SearchDocument[]>;
    ingest(source: string, text: string, aiProvider: AIProvider): Promise<void>;
}

export abstract class DocumentsProvider implements IDocumentsProvider {
    abstract saveDocument(source: string, chunk: string, embeddings: number[]): void;
    abstract searchDocuments(input: string, embeddings: number[], topK?: number, minScore?: number): Promise<SearchDocument[]>;

    async ingest(source: string, text: string, aiProvider: AIProvider): Promise<void> {
        const chunks = chunkText(text);

        for (const chunk of chunks) {
            const embeddings = await aiProvider.makeEmbedding(chunk);
            this.saveDocument(source, chunk, embeddings);
        }
    }

}
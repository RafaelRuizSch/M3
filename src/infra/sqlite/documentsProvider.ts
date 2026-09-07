import type { SearchDocument } from "../../contracts/dbProviders.ts";
import { DocumentsProvider } from "../../contracts/dbProviders.ts";
import { DatabaseSync } from "node:sqlite";
import { cosineSimilarity } from "../../utils/cosSimilarity.ts";
import { hybridScore } from "../../utils/hybridScore.ts";
import { keywordScore } from "../../utils/keywordScore.ts";

export class DocumentsProviderDB extends DocumentsProvider {
    private db: DatabaseSync;

    constructor(dbFilePath: string) {
        super();
        this.db = new DatabaseSync(dbFilePath);
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                chunk TEXT NOT NULL,
                embeddings TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    saveDocument(source: string, chunk: string, embeddings: number[]): void {
        this.db.prepare(`
            INSERT INTO documents (source, chunk, embeddings)
            VALUES (?, ?, ?);
        `).run(source, chunk, JSON.stringify(embeddings));
    }

    
    async searchDocuments(input: string, embeddings: number[], topK: number = 5, minScore: number = 0.7): Promise<SearchDocument[]> {
        const allDocuments = this.db.prepare(`
            SELECT * FROM documents;
        `).all() as { chunk: string; embeddings: string }[];

        return allDocuments
            .map((doc) => ({
                chunk: doc.chunk,
                embeddings: doc.embeddings,
                score: hybridScore(
                    cosineSimilarity(embeddings, JSON.parse(doc.embeddings)),
                    keywordScore(input, doc.chunk),
                )
            }))
            .filter((doc) => doc.score >= minScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
    }
}
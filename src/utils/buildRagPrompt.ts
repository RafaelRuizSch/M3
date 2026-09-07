import type { AIProvider } from "../contracts/aiProvider.ts";
import { DocumentsProvider } from "../contracts/dbProviders.ts";

export type RagExample = {
    question: string;
    answer: string;
}

export function buildRagPrompt(question:string, chunks:string[], examples:RagExample[]) {
    const context = chunks.join("\n\n");
    const fewShot = examples.map(example => `Q: ${example.question}\nA: ${example.answer}`).join("\n\n");

    return `
        [Instruction]
        Respond the first question using ONLY the context provided
        Use chain of thought reasoning to answer the question
        If the answer is not in the context, respond with "There is no answer in the context."

        [Examples]
        ${fewShot.length > 0 ? fewShot : "No examples provided."}

        [Context]
        ${context}

        [Question]
        ${question}
    `
}

export async function ragAnswer(question: string, aiProvider: AIProvider, docProvider: DocumentsProvider) {
    const embeddings = await aiProvider.makeEmbedding(question);
    const searchResults = await docProvider.searchDocuments(question, embeddings);

    if(searchResults.length === 0) {
        return "There is no answer in the context.";
    }

    const chunks = searchResults.map(result => result.chunk);
    const prompt = buildRagPrompt(question, chunks, []); // @TODO: Add actual examples later
    const answer = await aiProvider.generateText(prompt);
    return answer;
}

export async function ragDebug(question: string, aiProvider: AIProvider, docProvider: DocumentsProvider) {
    const embeddings = await aiProvider.makeEmbedding(question);
    const searchResults = await docProvider.searchDocuments(question, embeddings, 5, 0);
    const MAX_CHUNK_DISPLAY = 200; // Limit the number of characters displayed for each chunk

    console.log("Chunks retrieved from the database:");
    searchResults.forEach((result, index) => {
        console.log(`Chunk ${index + 1}:`);
        console.log(result.chunk.slice(0, MAX_CHUNK_DISPLAY) + (result.chunk.length > MAX_CHUNK_DISPLAY ? "..." : ""));
        console.log(`Score: ${result.score}`);
        console.log('-------------------------');
    })
}
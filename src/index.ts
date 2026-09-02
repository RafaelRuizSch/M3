import { randomUUID } from "crypto";
import type { AIProvider } from "./contracts/aiProvider.ts";
import { PERSONAS } from "./contracts/personas.ts";
import type { IPrinter } from "./contracts/printer.ts";
import { OpenAIProvider } from "./infra/openai.ts";
import { SQLiteDB } from "./infra/sqlite.ts";
import { ChatBot } from "./utils/chatbot.ts";

const consolePrinter: IPrinter = {
    print: (chunk: string) => process.stdout.write(chunk)
};

const bannedWords = process.env.BANNED_WORDS ? process.env.BANNED_WORDS.split(",") : [];
const hallucinationSignals = process.env.HALLUCINATION_SIGNALS ? process.env.HALLUCINATION_SIGNALS.split(",") : [];

const provider: AIProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL!, consolePrinter);
const db = new SQLiteDB("chatbot_history.db");

/*
await provider.generateStreamedText(message, "educational");
console.log("\n\n---\n\n");
await provider.generateStreamedText(message);

console.log(await provider.generateWithCritique(message, "educational"));
*/

const persona = process.argv[2] as keyof typeof PERSONAS | undefined;
const sessionName = process.argv[3] ?? randomUUID();
const chatBot = new ChatBot(provider, db, sessionName, bannedWords, hallucinationSignals, persona);

chatBot.start().catch((error) => {
    console.error("Error in chatbot:", error);
})
import type { AIProvider } from "./contracts/aiProvider.ts";
import { PERSONAS } from "./contracts/personas.ts";
import type { IPrinter } from "./contracts/printer.ts";
import { OpenAIProvider } from "./infra/openai.ts";
import { ChatBot } from "./utils/chatbot.ts";

const consolePrinter: IPrinter = {
    print: (chunk: string) => process.stdout.write(chunk)
};

const provider: AIProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL!, consolePrinter);

/*
await provider.generateStreamedText(message, "educational");
console.log("\n\n---\n\n");
await provider.generateStreamedText(message);

console.log(await provider.generateWithCritique(message, "educational"));
*/

const persona = process.argv[2] as keyof typeof PERSONAS | undefined;
const chatBot = new ChatBot(provider, persona);

chatBot.start().catch((error) => {
    console.error("Error in chatbot:", error);
})
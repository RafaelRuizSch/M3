import * as readline from "node:readline/promises";
import type { AIProvider } from "../contracts/aiProvider";
import type { HistoryEntry } from "../contracts/types";
import type { IPrinter } from "../contracts/printer";
import { DEFAULT_PERSONA, PERSONAS } from "../contracts/personas.ts";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


export class ChatBot {
    private history: HistoryEntry[] = [];
    private provider: AIProvider;
    private persona?: keyof typeof PERSONAS;

    constructor(provider: AIProvider, persona?: keyof typeof PERSONAS) {
        this.provider = provider;
        this.persona = persona;
    }

    async start() {
        this.history.push({ role: "system", content: this.persona ? PERSONAS[this.persona] : DEFAULT_PERSONA });
        console.log("Welcome to the AI Chatbot! Type your message and press Enter. Type 'quit' to exit.");
        
        while(true) {
            const userPrompt = await rl.question("User: ");

            if (userPrompt.toLowerCase() === 'quit') {
                console.log("Exiting...");
                break;
            }

            this.history.push({ role: "user", content: userPrompt });
            process.stdout.write("Assistant: ");

            const response = await this.provider.generateStreamedTextWithHistory(this.history);
            this.history.push({ role: "assistant", content: response });
            console.log("\n")
        }

        rl.close()
    }

}

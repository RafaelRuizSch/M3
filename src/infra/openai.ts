import OpenAI from "openai";
import type { AIProvider } from "../contracts/aiProvider.ts";
import type { IPrinter } from "../contracts/printer.ts";
import { DEFAULT_PERSONA, PERSONAS } from "../contracts/personas.ts";
import { withRetry } from "../utils/withRetry.ts";
import { generateWithCritique } from "../utils/critiqueGeneration.ts";
import type { HistoryEntry } from "../contracts/types.ts";


export class OpenAIProvider implements AIProvider {
    private openai: OpenAI;
    private model: string;
    private printer: IPrinter;

    constructor(apiKey: string, model: string, printer: IPrinter) {
        this.openai = new OpenAI({ apiKey });
        this.model = model;
        this.printer = printer;
    }

    async generateText(prompt: string, persona?: keyof typeof PERSONAS): Promise<string> {
        const system = persona ? PERSONAS[persona] : DEFAULT_PERSONA;
        return this._generateText(prompt, system);
    }

    async generateStreamedText(prompt: string, persona?: keyof typeof PERSONAS): Promise<string> {
        const system = persona ? PERSONAS[persona] : DEFAULT_PERSONA;
        const messages: HistoryEntry[] = [
            { role: "system", content: system },
            { role: "user", content: prompt }
        ];

        return this._generateStreamedText(messages);
    }

    async generateStreamedTextWithHistory(history: HistoryEntry[]): Promise<string> {
        return this._generateStreamedText(history);
    }

    private async _generateText(prompt: string, system: string): Promise<string> {
        const response = await withRetry(() => this.openai.chat.completions.create({
            model: this.model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt }
            ],
        }));
        
        return response.choices[0].message.content ?? "";
    }

    private async _generateStreamedText(messages: HistoryEntry[]): Promise<string> {
        const response = await withRetry(() => this.openai.chat.completions.create({
            model: this.model,
            messages: messages,
            stream: true
        }));

        let responseText = "";

        for await (const chunk of response) {
            this.printer.print(chunk.choices[0].delta.content ?? "");
            responseText += chunk.choices[0].delta.content ?? "";
        }

        return responseText;
    }
    
    async generateWithCritique(prompt: string, persona?: keyof typeof PERSONAS): Promise<string> {
        const system = persona ? PERSONAS[persona] : DEFAULT_PERSONA;
        return await generateWithCritique(system, prompt, (sysPrompt, userPrompt) => this._generateText(userPrompt, sysPrompt));
    }
}
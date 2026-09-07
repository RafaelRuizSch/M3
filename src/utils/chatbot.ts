import * as readline from "node:readline/promises";
import type { AIProvider } from "../contracts/aiProvider";
import { Conversation } from "../contracts/types.ts";
import { DEFAULT_PERSONA, PERSONAS } from "../contracts/personas.ts";
import { SumarizeConversation } from "./sumarize.ts";
import type { IDocumentsProvider, ISessionProvider } from "../contracts/dbProviders.ts";
import { capitalize } from "./utils.ts";
import { maybeCompressHistory } from "./estimateTokens.ts";
import { stitchContext } from "./stichContext.ts";
import { validateInput } from "./validateInput.ts";
import { validateOutput } from "./validadeOutput.ts";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SPECIAL_ACTIONS: Record<string, (c: ChatBot) => Promise<void>> = {
    "quit": async (c: ChatBot) => { c.setEndChatBot() },
    "sumarize": async (c: ChatBot) => { await c.sumarize() }
}

const CONVERSATION_MAX_LENGTH = 6


export class ChatBot {
    private conversation: Conversation;
    private aiProvider: AIProvider;
    private persona?: keyof typeof PERSONAS;
    private endChatBot = false;
    private sessionProvider: ISessionProvider;
    private documentProvider: IDocumentsProvider;
    private bannedWords: string[];
    private hallucinationSignals: string[];

    constructor(aiProvider: AIProvider, sessionProvider: ISessionProvider, documentProvider: IDocumentsProvider, sessionName: string, bannedWords: string[], hallucinationSignals: string[], persona?: keyof typeof PERSONAS) {
        this.aiProvider = aiProvider;
        this.persona = persona;
        this.conversation = new Conversation(CONVERSATION_MAX_LENGTH, sessionProvider, sessionName);
        this.sessionProvider = sessionProvider;
        this.documentProvider = documentProvider;
        this.bannedWords = bannedWords;
        this.hallucinationSignals = hallucinationSignals;
    }
    
    setEndChatBot() {
        console.log(`Exiting session '${this.conversation.getSessionName()}' ...`);
        this.endChatBot = true
    }

    async sumarize() {
        await SumarizeConversation(this.conversation, this.aiProvider)
        process.stdout.write("Sumarized...");
    }

    async start() {
        console.log("Welcome to the AI Chatbot! Type your message and press Enter. Type 'quit' to exit. Type 'sumarize' to sumarize");
        console.log(`Session name: ${this.conversation.getSessionName()}`);
        console.log('--------------------------------');

        
        if(this.conversation.getHistory().length === 0){
            this.conversation.addSystemMessage(this.persona ? PERSONAS[this.persona] : DEFAULT_PERSONA)
        } else {
            for(const entry of this.conversation.getHistory()){
                console.log(`${capitalize(entry.role)}: ${entry.content}`);
            }
        }

        while(!this.endChatBot) {
            const userPrompt = await rl.question("User: ");
            process.stdout.write("Assistant: ");

            const specialAction = SPECIAL_ACTIONS[userPrompt]

            if (specialAction)
                await specialAction(this)
            else
                await this.regularAction(userPrompt)
        }

        rl.close()
    }

    async regularAction(userPrompt: string){
        const validateResult = validateInput(userPrompt, this.bannedWords);

        if(!validateResult.isValid) {
            console.log(`Input validation failed: ${validateResult.errors.join(", ")}`);
            return;
        }

        this.conversation.addUserMessage(userPrompt)
        const compressed = await maybeCompressHistory(this.conversation, this.aiProvider);
        const stitched = compressed; // stitchContext(undefined, undefined, compressed);

        const response = await this.aiProvider.generateStreamedTextWithHistory(stitched);
        const validateOutputResult = validateOutput(response, this.hallucinationSignals);


        this.conversation.addAssistantMessage(response)
        console.log("\n")
    }
}

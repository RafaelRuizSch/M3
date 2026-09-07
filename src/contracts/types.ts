import type { ISessionProvider } from "./dbProviders";

export type HistoryEntry = {
    role: "user" | "assistant" | "system";
    content: string;
};

export type ValidationResult = {
    isValid: boolean;
    errors: string[];
};

export class Conversation {
    private history: HistoryEntry[]
    private maxHistoryLen: number
    private sessionProvider: ISessionProvider
    private sessionName: string

    constructor(maxLen: number = 6, sessionProvider: ISessionProvider, sessionName: string) {
        this.maxHistoryLen = maxLen
        this.sessionProvider = sessionProvider
        this.sessionName = sessionName

        this.history = this.sessionProvider.loadSession(sessionName)
    }

    getSessionName() {
        return this.sessionName;
    }

    overwriteContext(text: string){
        this.history = [{
            role: "system",
            content: text
        }]
    }

    addUserMessage(text: string){
        this.addMessage('user', text)
    }

    addAssistantMessage(text: string){
        this.addMessage('assistant', text)
    }

    addSystemMessage(text: string){
        this.addMessage('system', text)
    }

    private addMessage(role: HistoryEntry['role'], text: string){
        const historyEntry: HistoryEntry = { role, content: text }
        this.history.push(historyEntry)
        this.sessionProvider.saveSession(this.sessionName, historyEntry)
        this.slidingWindow()
    }

    getHistory(){
        return this.history;
    }

    private slidingWindow(){
        const limit = this.maxHistoryLen * 2

        if(this.history.length > limit) {
            this.history = this.history.slice(-limit)
        }
    }
}
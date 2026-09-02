import type { AIProvider } from "../contracts/aiProvider";
import type { Conversation, HistoryEntry } from "../contracts/types";

const SYSTEM_PROMPT = `
You are an assistant specialized in summarizing conversations.
Analyze the message history and provide a concise summary, highlighting the most important points, decisions, and relevant context.
Keep the summary in clear, accessible language that is easy to understand.
Limit the output to a single paragraph, avoiding unnecessary details while preserving the essential information.
`;

export async function SumarizeConversation(conversation: Conversation, aiProvider: AIProvider){
    const sum = await aiProvider.generateTextWithMessages(SYSTEM_PROMPT, conversation.getHistory())
    conversation.overwriteContext(sum)
}

export async function SumarizeMessages(messages: HistoryEntry[], aiProvider: AIProvider): Promise<string> {
    const summary = await aiProvider.generateTextWithMessages(SYSTEM_PROMPT, messages);
    return summary;
}
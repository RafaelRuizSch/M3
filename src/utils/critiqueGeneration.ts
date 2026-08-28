
const CRITIQUE_PROMPT = `Identify in 1 sentence points of improvement and critiques in the response. If it is good, say "approved"; if not, say what can/should be improved based on your analysis and critiques.`;
const REWRITE_PROMPT = `Rewrite the response considering the critiques and/or improvements received.`;

export async function generateWithCritique(
  system: string,
  prompt: string,
  requestResponse: (systemPrompt: string, userPrompt: string) => Promise<string>
): Promise<string> {
  const draft = await requestResponse(system, prompt);
  const critique = await requestResponse(CRITIQUE_PROMPT, draft);

  if (critique.toLowerCase() === "approved") {
    return draft;
  }

  return await requestResponse(REWRITE_PROMPT, `Last response: ${draft} \n\n Improvement / Critiques: ${critique}`);
}

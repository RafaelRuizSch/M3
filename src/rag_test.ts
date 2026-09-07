import { OpenAIProvider } from "./infra/openai.ts";
import { DocumentsProviderDB } from "./infra/sqlite/documentsProvider.ts";
import { ragAnswer, ragDebug } from "./utils/buildRagPrompt.ts";
import { consolePrinter } from "./utils/consolePrinter.ts";

const docsProvider = new DocumentsProviderDB("documents.db");
const aiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL!, consolePrinter);

const isDebug = process.argv.includes("--debug");
const question = isDebug ? process.argv[3] : process.argv[2];
console.log(`Question: ${question}`);


if (isDebug) {  
    console.log(await ragDebug(question, aiProvider, docsProvider))
} else {
    console.log(await ragAnswer(question, aiProvider, docsProvider));
}

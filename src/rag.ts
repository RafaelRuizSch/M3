import fs from 'fs';
import path from 'path';
import { DocumentsProviderDB } from './infra/sqlite/documentsProvider.ts';
import { OpenAIProvider } from './infra/openai.ts';
import { consolePrinter } from './utils/consolePrinter.ts';

// read the files in ADD_DOCS folder and ingest them into the database

const docsProvider = new DocumentsProviderDB("documents.db");
const aiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL!, consolePrinter);

const ADD_DOCS_PATH = "ADD_DOCS"

export async function ingestAddDocs(): Promise<void> {
  const docsDir = path.resolve(ADD_DOCS_PATH);

  if (!fs.existsSync(docsDir)) {
    return;
  }

  const files = fs
    .readdirSync(docsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.txt')
    .map((entry) => path.join(docsDir, entry.name))
    .sort();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    if (!content.trim()) {
      continue;
    }

    const relativePath = path.relative(process.cwd(), file);

    await docsProvider.ingest(relativePath, content, aiProvider);

    console.log(`Ingested ${path.basename(file)} (${content.length} chars)`);
  }
}

void ingestAddDocs();


import type { IPrinter } from "../contracts/printer.ts";

export const consolePrinter: IPrinter = {
    print: (chunk: string) => process.stdout.write(chunk)
};
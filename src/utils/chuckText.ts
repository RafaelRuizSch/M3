export function chunkText(text: string, size: number = 500, overlap: number = 100): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + size, text.length);
        chunks.push(text.slice(startIndex, endIndex));
        startIndex += size - overlap;
    }
    
    return chunks;
}
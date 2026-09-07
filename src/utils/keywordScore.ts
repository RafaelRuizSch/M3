export function keywordScore(query: string, chunk: string, minTermLength: number = 3): number {
    const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter(t=>t.length > minTermLength);

    if (terms.length === 0) {
        return 0;
    }

    const hits = terms.filter(term => chunk.toLowerCase().includes(term));
    return hits.length / terms.length;
}
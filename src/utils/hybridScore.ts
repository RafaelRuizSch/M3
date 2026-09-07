export function hybridScore(semantic: number, keyword: number, alpha = 0.7): number {
    return alpha * semantic + (1 - alpha) * keyword;
}
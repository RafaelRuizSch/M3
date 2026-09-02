import type { ValidationResult } from "../contracts/types.ts";

export function validateInput(response: string, hallucinationSignals: string[]): ValidationResult {
    const errors: string[] = [];
    if (!response || response.trim() === "") {
        errors.push("Response cannot be empty.");
    }

    if (hallucinationSignals.some(signal => response.includes(signal))) {
        errors.push("Response contains hallucination signals.");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
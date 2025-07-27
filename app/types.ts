export enum EvidenceTag {
    IMMIGRATION_INTENT = "Immigration_Intent",
    FINANCIAL_TRANSACTION = "Financial_Transaction",
    DECEPTION = "Deception",
    ID_DISCREPANCY = "ID_Discrepancy",
    EMOTIONAL_MANIPULATION = "Emotional_Manipulation",
    LOVE_DENIAL = "Love_Denial",
}

export interface EvidenceItem {
    tag: EvidenceTag | string;
    date: string;
    source: string;
    quote: string;
    statute: string;
    confidence: 'High' | 'Medium' | 'Low' | string;
}

export interface CaseReport {
    subject: string;
    period: string;
    concern: string;
    jurisdiction: string;
    overview: string;
    keyThemes: string[];
    evidenceLog: EvidenceItem[];
}

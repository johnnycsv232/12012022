import { GoogleGenAI, Type } from "@google/genai";
import type { CaseReport } from '../types';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as base64 string."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            mimeType: file.type,
            data: base64EncodedData
        }
    };
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        subject: { type: Type.STRING, description: "The name of the primary subject, if identifiable from the evidence. Otherwise, 'Subject Not Identified'." },
        period: { type: Type.STRING, description: "The date range covered by the evidence (e.g., 'Jan 2024 - Mar 2024')." },
        concern: { type: Type.STRING, description: "A one-sentence summary of the concern, e.g., 'Suspected Fraudulent Marriage for Immigration Purposes'." },
        jurisdiction: { type: Type.STRING, description: "The relevant jurisdictions, e.g., 'Federal and State (Minnesota)'." },
        overview: { type: Type.STRING, description: "A brief case summary (2-4 sentences) describing the relationship, breakdown timeline, and primary allegations based on the provided evidence." },
        keyThemes: {
            type: Type.ARRAY,
            description: "A list of 2-3 key thematic patterns observed in the evidence (e.g., 'Consistent requests for money', 'Contradictory statements about relationship history').",
            items: { type: Type.STRING }
        },
        evidenceLog: {
            type: Type.ARRAY,
            description: "A detailed log of all detected evidence items from the provided files.",
            items: {
                type: Type.OBJECT,
                properties: {
                    tag: {
                        type: Type.STRING,
                        description: "The most relevant evidence tag: 'Immigration_Intent', 'Financial_Transaction', 'Deception', 'ID_Discrepancy', 'Emotional_Manipulation', 'Love_Denial'."
                    },
                    date: { type: Type.STRING, description: "The timestamp or date of the evidence. If unknown, state 'Date Not Available'." },
                    source: { type: Type.STRING, description: "The source file name or type (e.g., 'transcript.txt', 'Receipt.jpg', 'AudioRecording.mp3')." },
                    quote: { type: Type.STRING, description: "A direct quote, transcribed text, or a concise summary of the visual evidence (e.g., 'Scanned receipt showing purchase at...')." },
                    statute: { type: Type.STRING, description: "The applicable legal statute: '8 USC §1325(c)', 'Minn. Stat. §518.02', or '18 USC §1546'." },
                    confidence: { type: Type.STRING, description: "Your confidence assessment ('High', 'Medium', or 'Low') of how strongly this evidence supports the assigned tag." }
                },
                required: ['tag', 'date', 'source', 'quote', 'statute', 'confidence']
            }
        }
    },
    required: ['subject', 'period', 'concern', 'jurisdiction', 'overview', 'keyThemes', 'evidenceLog']
};

export const generateReport = async (files: File[]): Promise<CaseReport> => {
    const systemInstruction = `You are a world-class legal documentation and evidence processor specializing in marriage fraud cases. Your job is to analyze user-submitted communication transcripts, audio files, video clips, screenshots, receipts, identification documents, and digital records to extract critical evidence and generate a structured legal report.

    **Workflow:**
    1.  **Analyze Content:** Process all provided files (text, images, audio, video). For audio/video, transcribe relevant speech. For images, use OCR to extract text from screenshots or describe visual evidence.
    2.  **Tag Evidence:** Identify evidence and tag it according to the following system:
        *   **Immigration_Intent:** Shows motive to gain status or green card (e.g., "I just need the papers").
        *   **Financial_Transaction:** Shows money exchanged, offered, or used deceptively.
        *   **Deception:** Direct lies, hiding relationships, conflicting stories.
        *   **ID_Discrepancy:** Conflicting names, dates of birth, or document inconsistencies.
        *   **Emotional_Manipulation:** Gaslighting, guilt tactics, shifting blame, coercion.
        *   **Love_Denial:** Directly states no real romantic intent (e.g., "I never loved you").
    3.  **Assess Confidence:** For each piece of evidence, assess your confidence ('High', 'Medium', 'Low') that it accurately supports the assigned tag. High confidence is for explicit statements. Medium is for strong implications. Low is for suggestive but ambiguous evidence.
    4.  **Identify Key Themes:** After analyzing all evidence, identify 2-3 overarching themes or patterns (e.g., "Recurring pattern of financial requests linked to immigration deadlines.").
    5.  **Link to Statutes:** Link each piece of evidence to the most appropriate legal code:
        *   **8 USC §1325(c):** For evidence related to immigration intent or fraudulent filings.
        *   **Minn. Stat. §518.02:** For evidence of deception or emotional manipulation affecting the marriage contract.
        *   **18 USC §1546:** For evidence involving fraudulent IDs or documents.
    6.  **Generate JSON Report:** Populate the provided JSON schema with all extracted information. Be precise, objective, and base your analysis *only* on the files provided. Your entire output must conform to the schema.`;

    const fileParts = await Promise.all(files.map(fileToGenerativePart));

    const textPart = { text: "Please analyze the following file(s) for evidence of marriage fraud and generate a case summary according to the specified JSON schema." };

    const contents = {
        parts: [textPart, ...fileParts]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    try {
        const text = response.text.trim();
        const reportData = JSON.parse(text);
        return reportData as CaseReport;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Could not parse the analysis from the AI. The response was not valid JSON.");
    }
};

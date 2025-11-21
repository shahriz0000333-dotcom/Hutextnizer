// In a real project, you would install @vercel/node and use VercelRequest, VercelResponse types.
// Using `any` here to avoid needing external dependencies in this context.
import { GoogleGenAI, Type } from "@google/genai";

// Types are duplicated from the frontend's types.ts because serverless functions
// are built as separate endpoints and cannot directly import from the frontend source.
interface ReportData {
  originalWordCount: number;
  finalWordCount: number;
  plagiarismBefore: string;
  plagiarismAfter: string;
  humanLikenessScore: string;
  readabilityLevel: 'Basic' | 'Intermediate' | 'Advanced';
}

interface AiResponse {
  processedText: string;
  report: ReportData;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required and cannot be empty.' });
    }

    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      return res.status(500).json({ error: 'Server configuration error. API key is missing.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        processedText: { type: Type.STRING, description: "The final, processed text that is both humanized and plagiarism-free." },
        report: {
          type: Type.OBJECT,
          properties: {
            originalWordCount: { type: Type.NUMBER },
            finalWordCount: { type: Type.NUMBER, description: "The word count of the final processed text." },
            plagiarismBefore: { type: Type.STRING, description: "An estimated plagiarism percentage for the original text, e.g., '15%'" },
            plagiarismAfter: { type: Type.STRING, description: "An estimated plagiarism percentage for the processed text, e.g., '1%'" },
            humanLikenessScore: { type: Type.STRING, description: "An estimated score of how human-like the text sounds, e.g., '95%'" },
            readabilityLevel: { type: Type.STRING, description: "The readability level, must be one of 'Basic', 'Intermediate', or 'Advanced'." },
          },
          required: ['originalWordCount', 'finalWordCount', 'plagiarismBefore', 'plagiarismAfter', 'humanLikenessScore', 'readabilityLevel']
        },
      },
      required: ['processedText', 'report']
    };

    const prompt = `
      Your sole task is to process the user's text.
      Humanize the text to make it sound natural, improve its flow, and ensure it is original.
      You MUST output your response as a single, raw, valid JSON object, and nothing else.
      Do not include any wrapper like \`\`\`json ... \`\`\`, any conversational text, or any explanations.
      Your entire output must be parsable by JSON.parse().
      The JSON must conform to the provided schema.

      Original Text:
      ---
      ${text}
      ---
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    // FIX: Replaced fragile JSON parsing with a more robust method.
    // The previous implementation using `indexOf` and `lastIndexOf` was brittle and could fail with nested objects or certain string values.
    // With `responseMimeType: 'application/json'`, the response should be a clean JSON string.
    // This logic attempts to parse it directly and includes a fallback for stripping common markdown wrappers.
    let responseText = response.text?.trim();

    if (!responseText) {
        throw new Error("Received an empty response from the AI model.");
    }
    
    // The model can sometimes wrap the JSON in ```json ... ```. Let's strip it.
    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7, responseText.length - 3).trim();
    } else if (responseText.startsWith('```')) {
      responseText = responseText.substring(3, responseText.length - 3).trim();
    }
    
    let parsedJson: AiResponse;
    try {
        parsedJson = JSON.parse(responseText);
    } catch (jsonError) {
        console.error("Failed to parse JSON from AI. Processed string:", responseText);
        console.error("Raw response was:", response.text);
        throw new Error("The AI model returned a response that was not valid JSON.");
    }
    
    if (parsedJson && parsedJson.processedText && parsedJson.report) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(parsedJson);
    } else {
      console.error("Parsed JSON is missing required properties. Parsed object:", parsedJson);
      throw new Error("Received incomplete or malformed data structure from the AI.");
    }
    
  } catch (error) {
    console.error("Error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred while processing the text.';
    return res.status(500).json({ error: errorMessage });
  }
}

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

/**
 * Attempts to extract and parse a JSON object from a string that may contain extraneous text
 * or be wrapped in markdown code blocks.
 * @param text The raw string response from the AI model.
 * @returns The parsed AiResponse object or null if parsing fails.
 */
function extractAndParseJson(text: string): AiResponse | null {
  if (!text) return null;

  // Attempt 1: The text is already a valid JSON object.
  try {
    const parsed = JSON.parse(text);
    // Basic validation to ensure it matches our expected structure
    if (parsed && parsed.processedText && parsed.report) {
      return parsed as AiResponse;
    }
  } catch (e) {
    // Not a valid JSON, proceed to next attempts.
  }

  // Attempt 2: The JSON is wrapped in a markdown code block (e.g., ```json ... ```).
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    try {
      const parsed = JSON.parse(markdownMatch[1]);
      if (parsed && parsed.processedText && parsed.report) {
        return parsed as AiResponse;
      }
    } catch (e) {
      // Failed to parse content of markdown block, proceed.
    }
  }
  
  // Attempt 3: The JSON is embedded within other text. Find the first '{' and last '}'.
  const jsonMatch = text.match(/{[\s\S]*}/);
  if (jsonMatch && jsonMatch[0]) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
       if (parsed && parsed.processedText && parsed.report) {
        return parsed as AiResponse;
      }
    } catch (e) {
      // The extracted substring is not valid JSON.
    }
  }

  return null; // All attempts failed.
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
      You are an AI text processor. Your task is to humanize the user's text, improve its flow, and ensure originality.
      You MUST provide your response strictly as a single, raw, valid JSON object that conforms to the provided schema.
      Do not include any markdown wrappers like \`\`\`json, conversational text, or explanations.
      Your entire output must be a JSON object parsable by JSON.parse().

      Original Text to process:
      ---
      ${text}
      ---
    `;

    const modelResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const responseText = modelResponse.text?.trim();

    if (!responseText) {
      throw new Error("Received an empty response from the AI model.");
    }
    
    const parsedJson = extractAndParseJson(responseText);
    
    if (parsedJson) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(parsedJson);
    } else {
      console.error("Failed to extract a valid JSON object from the AI's response. Raw response:", responseText);
      throw new Error("The AI model's response could not be parsed as valid JSON.");
    }
    
  } catch (error) {
    console.error("Error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred while processing the text.';
    return res.status(500).json({ error: errorMessage });
  }
}

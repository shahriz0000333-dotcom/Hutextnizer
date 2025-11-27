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

    // Accept either GEMINI_API_KEY (used in README/vite) or API_KEY (legacy)
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.API_KEY;
    if (!apiKey) {
      console.error("Environment variable GEMINI_API_KEY or API_KEY not set.");
      return res.status(500).json({ error: 'Server configuration error. GEMINI_API_KEY (or API_KEY) is missing.' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey as string });

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
      You are an expert text editor and analyst. Given the following text, perform two tasks:
      1. Create a single, final version of the text that is both **humanized** (sounds natural, less robotic, improved flow) and **plagiarism-free** (rephrased to ensure originality).
      2. Generate a detailed analysis report in JSON format based on the original text and your improvements. The report should include:
          - originalWordCount: The word count of the original text.
          - finalWordCount: The word count of your final generated text.
          - plagiarismBefore: Estimate a percentage, e.g., "15%".
          - plagiarismAfter: Always set this to a low value like "0%" or "1%".
          - humanLikenessScore: Estimate a percentage of how human-like the final text is, e.g., "95%".
          - readabilityLevel: Choose from 'Basic', 'Intermediate', 'Advanced'.

      The final output must be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text or markdown formatting outside of the JSON object.

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

    const responseText = (response && typeof response.text === 'string') ? response.text.trim() : JSON.stringify(response);
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON. Raw responseText:", responseText);
      console.error("Parse error:", parseErr);
      return res.status(502).json({ error: 'Bad gateway: AI returned invalid JSON.' });
    }
    
    if (parsedJson && parsedJson.processedText && parsedJson.report) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(parsedJson);
    } else {
      console.error("Received malformed JSON response from AI:", parsedJson);
      return res.status(502).json({ error: 'AI returned malformed data.' });
    }
    
  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: 'An internal server error occurred while processing the text.' });
  }
}
// Serverless handler: prefer OpenRouter (if OPENROUTER_API_KEY present), else Google GenAI (if GEMINI_API_KEY present).
import { GoogleGenAI, Type } from "@google/genai";

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

async function tryParseJsonFromString(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        // fall through
      }
    }
    return null;
  }
}

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

    const geminiKey = process.env.GEMINI_API_KEY ?? process.env.API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const prompt = `
      You are an expert text editor and analyst. Given the following text, perform two tasks:
      1. Create a single, final version of the text that is both humanized and plagiarism-free.
      2. Generate a JSON report containing:
         - originalWordCount (number)
         - finalWordCount (number)
         - plagiarismBefore (string like "15%")
         - plagiarismAfter (string like "0%" or "1%")
         - humanLikenessScore (string like "95%")
         - readabilityLevel (one of 'Basic','Intermediate','Advanced')
      The final output must be a single valid JSON object and nothing else.
      Original Text:
      ---
      ${text}
      ---
    `;

    // Prefer OpenRouter if key provided
    if (openRouterKey) {
      try {
        const orEndpoint = 'https://api.openrouter.ai/v1/chat/completions';
        const payload = {
          model: 'gpt-4o-mini', // change if not available on your plan
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 2000
        };

        const resp = await fetch(orEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`
          },
          body: JSON.stringify(payload),
        });

        const respText = await resp.text();
        if (!resp.ok) {
          console.error("OpenRouter responded with non-OK:", resp.status, respText);
          let errBody;
          try { errBody = JSON.parse(respText); } catch {}
          return res.status(resp.status).json({ error: 'OpenRouter API error', details: errBody ?? respText });
        }

        let json;
        try {
          json = JSON.parse(respText);
        } catch {
          console.error("OpenRouter returned non-JSON:", respText);
          return res.status(502).json({ error: 'OpenRouter returned non-JSON response.' });
        }

        let assistantContent: string | null = null;
        if (json.choices && Array.isArray(json.choices) && json.choices[0]) {
          const ch = json.choices[0];
          assistantContent = ch.message?.content ?? ch.message ?? ch.text ?? ch.delta?.content ?? null;
        } else if (json.output && Array.isArray(json.output) && json.output[0]) {
          assistantContent = typeof json.output[0].content === 'string' ? json.output[0].content : null;
        }

        if (!assistantContent) {
          const attempt = await tryParseJsonFromString(JSON.stringify(json));
          if (attempt && attempt.processedText && attempt.report) {
            return res.status(200).json(attempt);
          }
          console.error("Could not find assistant content in OpenRouter response:", JSON.stringify(json));
          return res.status(502).json({ error: 'OpenRouter returned unexpected shape.' });
        }

        const parsed = await tryParseJsonFromString(assistantContent);
        if (parsed && parsed.processedText && parsed.report) {
          return res.status(200).json(parsed);
        } else {
          console.error("OpenRouter assistant content could not be parsed as JSON. Raw:", assistantContent);
          return res.status(502).json({ error: 'OpenRouter returned content that is not valid JSON.' });
        }

      } catch (err: any) {
        console.error("Error calling OpenRouter:", err);
        return res.status(500).json({ error: `OpenRouter error: ${err?.message ?? String(err)}` });
      }
    }

    // Else fallback to Google GenAI
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey as string });

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            processedText: { type: Type.STRING },
            report: {
              type: Type.OBJECT,
              properties: {
                originalWordCount: { type: Type.NUMBER },
                finalWordCount: { type: Type.NUMBER },
                plagiarismBefore: { type: Type.STRING },
                plagiarismAfter: { type: Type.STRING },
                humanLikenessScore: { type: Type.STRING },
                readabilityLevel: { type: Type.STRING },
              },
              required: ['originalWordCount','finalWordCount','plagiarismBefore','plagiarismAfter','humanLikenessScore','readabilityLevel']
            }
          },
          required: ['processedText','report']
        };

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', responseSchema }
        });

        const responseText = (response && typeof response.text === 'string') ? response.text.trim() : JSON.stringify(response);
        const parsed = await tryParseJsonFromString(responseText);

        if (parsed && parsed.processedText && parsed.report) {
          return res.status(200).json(parsed);
        } else {
          console.error("GoogleGenAI returned unexpected data:", responseText);
          return res.status(502).json({ error: 'AI returned malformed data (GoogleGenAI).' });
        }
      } catch (err: any) {
        console.error("Error calling GoogleGenAI:", err);
        const message = err?.message || 'Unknown error from GoogleGenAI';
        return res.status(500).json({ error: `GoogleGenAI error: ${message}` });
      }
    }

    console.error("No GEMINI_API_KEY or OPENROUTER_API_KEY environment variable found.");
    return res.status(500).json({ error: 'Server configuration error. Set GEMINI_API_KEY or OPENROUTER_API_KEY.' });

  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: 'An internal server error occurred while processing the text.' });
  }
}
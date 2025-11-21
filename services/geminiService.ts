import type { AiResponse } from "../types";

export const humanizeTextAndGenerateReport = async (text: string): Promise<AiResponse> => {
  try {
    const response = await fetch('/api/humanize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result: AiResponse = await response.json();
    
    // Basic validation on the client side
    if (
      typeof result.processedText === 'string' &&
      typeof result.report === 'object' &&
      result.report !== null &&
      typeof result.report.originalWordCount === 'number'
    ) {
      return result;
    } else {
      throw new Error("Received malformed data from the server.");
    }

  } catch (error) {
    console.error("Error calling humanize API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to process text: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
};

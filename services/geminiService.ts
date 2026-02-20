import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Gemini API key is missing. Check your .env.local file.");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async transcribeAudio(
    base64Audio: string,
    mimeType: string = "audio/webm"
  ): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: "Transcribe this audio exactly. Just the text, nothing else.",
            },
          ],
        },
        config: {
          temperature: 0,
        },
      });

      return response.text?.trim() || "[No speech detected]";
    } catch (error) {
      console.error("Gemini Transcription Error:", error);
      return "Error: Transcription failed.";
    }
  }
}

export const geminiService = new GeminiService();

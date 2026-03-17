import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key missing. Add VITE_GEMINI_API_KEY to environment variables.");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async transcribeAudio(
    base64Audio: string,
    mimeType: string = "audio/webm"
  ): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: "Transcribe this audio exactly. Only return the spoken words.",
            },
          ],
        },
        config: {
          temperature: 0,
        },
      });

      return response.text?.trim() || "[No speech detected]";
    } catch (error) {
      console.error("Gemini transcription failed:", error);
      return "Transcription failed.";
    }
  }
}

export const geminiService = new GeminiService();
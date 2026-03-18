import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Gemini API key missing. Add VITE_GEMINI_API_KEY to environment variables."
      );
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async transcribeAudio(
    base64Audio: string,
    mimeType: string = "audio/webm"
  ): Promise<string> {
    try {
      if (!base64Audio) {
        return "No audio data received.";
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Audio,
                },
              },
              {
                text: "Transcribe the spoken words in this audio and return only the transcription.",
              },
            ],
          },
        ],
        config: {
          temperature: 0,
        },
      });

      const text = response.text?.trim();
      return text || "[No speech detected]";
    } catch (error: any) {
      console.error("Gemini transcription failed:", error);
      return "Transcription failed.";
    }
  }
}

export const geminiService = new GeminiService();
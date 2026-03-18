import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    console.log("Gemini API key loaded:", !!apiKey);

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
                  mimeType: mimeType,
                  data: base64Audio,
                },
              },
              {
                text: "Transcribe the spoken words in this audio. Return only the transcription text.",
              },
            ],
          },
        ],
        config: {
          temperature: 0,
        },
      });

      const text = response.text?.trim();

      if (!text) {
        return "[No speech detected]";
      }

      return text;
    } catch (error: any) {
      console.error("Gemini transcription failed:", error);

      if (error?.message) {
        return `Transcription failed: ${error.message}`;
      }

      return "Transcription failed.";
    }
  }
}

export const geminiService = new GeminiService();
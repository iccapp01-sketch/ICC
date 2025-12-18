
import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  // Fixed: Using process.env.API_KEY directly in the constructor per MUST USE guidelines
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Use gemini-3-flash-preview for text tasks and ensure response.text is used as a property.
export const explainVerse = async (verseText: string, verseReference: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI Service unavailable (Missing API Key).";

  try {
    const prompt = `
      You are a helpful and wise theologian and pastor.
      Please provide a concise, encouraging, and theological explanation of the following Bible verse.
      Keep it under 150 words and focus on practical application for a modern believer.
      
      Verse: ${verseReference} - "${verseText}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't connect to the Bible Assistant right now.";
  }
};

// Recommended approach for JSON: Use responseSchema and the correct model gemini-3-flash-preview.
export const generateDevotional = async (topic: string): Promise<{title: string, content: string}> => {
    const ai = getClient();
    if(!ai) return { title: "Error", content: "Service unavailable"};

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a short, uplifting daily devotional about "${topic}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "The title of the devotional",
                        },
                        content: {
                            type: Type.STRING,
                            description: "The body text of the devotional",
                        }
                    },
                    required: ["title", "content"],
                }
            }
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e) {
        console.error("Gemini Devotional Error:", e);
        return { title: "Error", content: "Could not generate devotional."};
    }
}

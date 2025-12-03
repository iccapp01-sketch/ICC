import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't connect to the Bible Assistant right now.";
  }
};

export const generateDevotional = async (topic: string): Promise<{title: string, content: string}> => {
    const ai = getClient();
    if(!ai) return { title: "Error", content: "Service unavailable"};

    try {
        const prompt = `Write a short, uplifting daily devotional about "${topic}". Include a title and a body text. Return strictly JSON.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e) {
        return { title: "Error", content: "Could not generate devotional."};
    }
}

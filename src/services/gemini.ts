import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateDadTip(category: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a short, practical, and highly motivating parenting tip or life message for a dad. 
    The category is: ${category}. 
    Focus on being encouraging, realistic, and actionable. 
    Format the response in Markdown.`,
    config: {
      temperature: 0.8,
    }
  });

  return response.text;
}

export async function generateDailyMotivation() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Give me a powerful, one-sentence motivational life message for a father today. Something that hits deep but stays positive.",
    config: {
      temperature: 0.9,
    }
  });

  return response.text;
}

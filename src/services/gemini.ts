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

export async function generateWeekendIdea(category: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed, fun weekend project idea for a dad and his kids in the category: "${category}".
    Include:
    - A creative project name
    - What you'll need (materials/ingredients)
    - Simple step-by-step instructions (3-5 steps)
    - A bonding tip at the end
    Keep it realistic, achievable in a weekend, and genuinely fun for both dads and kids.
    Format in Markdown.`,
    config: {
      temperature: 0.85,
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

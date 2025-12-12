import { GoogleGenAI } from "@google/genai";

// Initialize the client. 
// Note: In a production app, never expose keys on the client side without proper proxying or restrictions.
// We assume process.env.API_KEY is available or injected by the environment.
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateWelcomeMessage = async (userName: string): Promise<string> => {
  if (!ai) {
    return `Welcome back, ${userName}! (Add API_KEY to unlock AI greeting)`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, inspiring, professional welcome message for a user named "${userName}" logging into their productivity dashboard. Max 20 words.`,
    });
    
    return response.text || `Welcome back, ${userName}. Ready to achieve greatness?`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Welcome back, ${userName}. It's great to see you.`;
  }
};
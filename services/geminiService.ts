
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiResponse = async (messages: Message[], prompt: string, lang: Language): Promise<string> => {
  try {
    const context = messages.slice(-5).map(m => `${m.isAi ? 'AI' : 'User'}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context of conversation:\n${context}\n\nUser Question: ${prompt}\n\nPlease respond in ${lang === 'ar' ? 'Arabic' : 'English'}. You are a helpful assistant in a group chat named "Albadawi". Keep it short and friendly.`,
    });
    return response.text || (lang === 'ar' ? "عذراً، لم أستطع معالجة طلبك حالياً." : "Sorry, I couldn't process your request right now.");
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'ar' ? "حدث خطأ في الاتصال بالذكاء الاصطناعي." : "An error occurred while connecting to AI.";
  }
};

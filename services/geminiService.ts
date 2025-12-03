import { GoogleGenAI, Type } from "@google/genai";
import { TextbookStructure, Chapter, GeneratedContent, QuizQuestion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTextbookStructure = async (
  topic: string,
  targetAudience: string
): Promise<TextbookStructure> => {
  const ai = getAI();
  
  const systemInstruction = `You are an expert curriculum designer and textbook author. 
  Your task is to create a detailed table of contents for a textbook on the given topic, tailored specifically for the target audience.
  Ensure the progression is logical, starting from basics to advanced concepts.`;

  const prompt = `Create a textbook structure for the topic: "${topic}". 
  Target Audience: "${targetAudience}".
  Return a list of 5-8 chapters, each with 3-5 sections.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING, description: "A brief one-sentence summary of what this section covers" }
                    },
                    required: ["title", "description"]
                  }
                }
              },
              required: ["title", "sections"]
            }
          }
        },
        required: ["chapters"]
      }
    }
  });

  const json = JSON.parse(response.text || "{}");
  
  // Post-process to add IDs
  const chapters: Chapter[] = (json.chapters || []).map((ch: any, idx: number) => ({
    id: `ch-${idx}`,
    title: ch.title,
    sections: (ch.sections || []).map((sec: any, sIdx: number) => ({
      id: `sec-${idx}-${sIdx}`,
      title: sec.title,
      description: sec.description
    }))
  }));

  return {
    topic,
    targetAudience,
    chapters
  };
};

export const generateSectionContent = async (
  topic: string,
  chapterTitle: string,
  sectionTitle: string,
  targetAudience: string,
  previousContext?: string
): Promise<string> => {
  const ai = getAI();

  const systemInstruction = `You are an expert textbook author known for clear, engaging, and accurate writing.
  Write in a valid Markdown format. Use headers (##, ###), bolding, lists, and code blocks where appropriate.
  Do not use H1 (#). Start with H2 or normal text.
  Explain concepts clearly for the target audience: ${targetAudience}.
  Use analogies and examples.`;

  const prompt = `Write the full content for the section: "${sectionTitle}" 
  in the chapter: "${chapterTitle}" 
  for the textbook topic: "${topic}".
  
  Make it comprehensive but digestible. 
  If the topic involves code, math, or history, provide specific examples.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
    }
  });

  return response.text || "Failed to generate content.";
};

export const generateQuizForSection = async (
  content: string
): Promise<QuizQuestion[]> => {
  const ai = getAI();
  
  const prompt = `Based on the following text, generate 3 multiple-choice quiz questions to test understanding.
  
  Text:
  ${content.substring(0, 5000)}... (truncated for brevity)`; // Truncate to avoid huge context, though flash handles large context well.

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER, description: "Zero-based index of the correct option" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const explainConcept = async (
  concept: string,
  context: string,
  audience: string
): Promise<string> => {
  const ai = getAI();
  
  const prompt = `A student selected the text "${concept}" from the following context:
  "${context.substring(0, 1000)}..."
  
  Explain "${concept}" simply and clearly for a ${audience}. Keep it under 100 words.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text || "Could not explain this concept.";
};

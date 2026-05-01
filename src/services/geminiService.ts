import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key" }); // Provide fallback for types, but shouldn't be used empty.

const modelName = "gemini-2.5-flash";

export type TeacherPersonality = 'Rohan' | 'Priya';

const getSystemInstruction = (teacher: TeacherPersonality, studentName: string, studentClass: string) => `
You are ${teacher}, a world-class AI teacher on the Global X AI platform. 
${teacher === 'Rohan' ? 'You have a professional, confident, smart, and encouraging male presence.' : 'You have a warm, supportive, clear, and professional female presence.'}
You are teaching ${studentName}, who is in class ${studentClass}. 

Rules:
1. Provide highly structured, clear answers using Markdown formatting.
2. For Mathematics issues, you MUST provide a step-by-step solution down to the final answer.
3. For Science and Theory, provide concise, clear explanations, easy for a class ${studentClass} student.
4. DO NOT hallucinate. Do not provide incorrect data. 
5. If you are unsure or do not know the answer, clearly state "I am unsure about this question" instead of guessing.
6. Give helpful, motivating, but honest feedback.
7. Maintain a helpful and ChatGPT-like responsive tone at all times.
`;

export async function askTeacher(
  teacher: TeacherPersonality, 
  studentName: string, 
  studentClass: string, 
  message: string,
  history: {role: 'user' | 'model', parts: {text: string}[]}[] = []
) {
  try {
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: getSystemInstruction(teacher, studentName, studentClass),
        temperature: 0.7,
      }
    });
    
    // We can't directly inject history into chat.create in the new SDK easily unless we use the standard generateContent with history.
    // Instead, let's use generateContent directly.
    const contents = [...history, { role: 'user', parts: [{ text: message }] }];
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
         systemInstruction: getSystemInstruction(teacher, studentName, studentClass),
         temperature: 0.7,
      }
    });
    
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return "I'm having a little trouble connecting right now. Let's try again in a moment.";
  }
}

export async function quickScanQuestion(base64Image: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType } },
          { text: "Solve this question step-by-step clearly. Explain the concepts used." }
        ]
      }
    });
    return response.text || "Could not analyze the image.";
  } catch (err) {
    console.error("Vision Error:", err);
    return "Failed to analyze the image.";
  }
}

export async function generateSmartSummary(text: string) {
   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please provide a smart, structured summary of the following text, ideal for a student: \n\n${text}`,
   });
   return response.text;
}

export async function generateQuiz(topic: string, studentClass: string) {
   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a 3-question multiple choice quiz about ${topic} for a class ${studentClass} student.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answerKey: { type: Type.STRING, description: "The exact matching string from options" },
                explanation: { type: Type.STRING }
             },
             required: ["question", "options", "answerKey", "explanation"]
          }
        }
      }
   });
   
   return JSON.parse(response.text || "[]");
}

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestExperts(specialty: string, locality: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `Find 3 real top-rated doctors for ${specialty} in ${locality}, India. 
  For each doctor, provide:
  - Name
  - Education (MBBS, MD, etc.)
  - Realistic Consultation Fees in INR (e.g., 500 to 3000)
  - Locality or Clinic Name
  - A brief professional bio.
  
  Return the response as a valid JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              education: { type: Type.STRING },
              chargesINR: { type: Type.NUMBER },
              locality: { type: Type.STRING },
              bio: { type: Type.STRING },
              specialization: { type: Type.STRING }
            },
            required: ["name", "education", "chargesINR", "locality", "bio"]
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    throw new Error("Failed to search for real doctors. Please try again.");
  }
}

export async function analyzeSymptoms(symptoms: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    You are a professional medical assistant AI. A patient is reporting the following symptoms:
    "${symptoms}"
    
    Please provide a detailed analysis report in Markdown format.
    The report should include:
    1. A summary of the potential conditions (clearly state this is not a diagnosis).
    2. Common symptoms associated with these conditions.
    3. Recommended next steps (e.g., specific tests, which department to visit).
    4. Urgency level (Normal, Urgent, Emergency).
    5. A strong disclaimer that the user should consult a real doctor.
    
    Keep the tone professional, empathetic, and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze symptoms. Please try again later.");
  }
}

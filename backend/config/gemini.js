const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not found in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateWithGemini(prompt) {
  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    return (
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated."
    );

  } catch (error) {

    console.error("Gemini Error:", error.message);
    throw error;

  }
}

module.exports = { generateWithGemini };
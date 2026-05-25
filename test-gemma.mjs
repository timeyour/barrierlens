import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY;
const modelName = process.env.GEMMA_MODEL_NAME || "gemma-4-26b-a4b-it";

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY (or GEMMA_API_KEY) in environment.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const response = await ai.models.generateContent({
  model: modelName,
  contents: "用一句话说明盲道占用为什么是无障碍问题。",
});

console.log(response.text);

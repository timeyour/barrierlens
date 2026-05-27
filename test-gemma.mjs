import { fetch as undiciFetch, ProxyAgent } from "undici";

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY;
const modelName = process.env.GEMMA_MODEL_NAME || "gemma-4-26b-a4b-it";
const proxyUrl =
  process.env.GEMMA_API_PROXY ||
  process.env.HTTPS_PROXY ||
  process.env.HTTP_PROXY ||
  process.env.ALL_PROXY ||
  process.env.https_proxy ||
  process.env.http_proxy ||
  process.env.all_proxy;

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY (or GEMMA_API_KEY) in environment.");
  process.exit(1);
}

const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
const request = dispatcher
  ? (input, init) => undiciFetch(input, { ...init, dispatcher })
  : fetch;

const response = await request(
  `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: "用一句话说明盲道占用为什么是无障碍问题。" }],
        },
      ],
      generationConfig: { maxOutputTokens: 128, temperature: 0.2 },
    }),
  },
);

const text = await response.text();
if (!response.ok) {
  throw new Error(`Gemma API HTTP ${response.status}: ${text.slice(0, 300)}`);
}

const data = JSON.parse(text);
const content = data.candidates?.[0]?.content?.parts
  ?.map((part) => part.text ?? "")
  .join("")
  .trim();

if (!content) {
  throw new Error("Gemma API returned empty content");
}

console.log(content);

/** 本地开发提示：与 Vercel 线上环境差异 */
export default function LocalDevBanner() {
  if (process.env.NODE_ENV !== "development") return null;

  const ollamaPreferred = process.env.OLLAMA_PREFERRED === "true";
  const ollamaModel = process.env.OLLAMA_MODEL?.trim() || "gemma4:latest";
  const hasGemmaKey = Boolean(
    process.env.GEMINI_API_KEY?.trim() || process.env.GEMMA_API_KEY?.trim(),
  );
  const hasProxy = Boolean(process.env.GEMMA_API_PROXY?.trim());
  const hasLocationKey = Boolean(
    process.env.NEXT_PUBLIC_AMAP_KEY?.trim() || process.env.AMAP_WEB_KEY?.trim(),
  );

  return (
    <div
      className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-center text-xs leading-relaxed text-blue-900"
      role="status"
    >
      <span className="font-semibold">本地开发</span>
      {ollamaPreferred ? (
        <>
          {" "}
          · 走本机 Ollama（{ollamaModel}），每张约 <strong>2–3 分钟</strong>，请耐心等待
        </>
      ) : hasGemmaKey ? (
        <>
          {" "}
          · 走 Google Gemma API{hasProxy ? "（已配置代理）" : "（本地通常需 GEMMA_API_PROXY）"}
        </>
      ) : (
        <> · 未配置 GEMINI_API_KEY，将走本机 Ollama 或 Mock</>
      )}
      {!hasLocationKey && <> · 未配置高德 Key，定位只能手动填路名</>}
      {" "}
      · 线上{" "}
      <a
        href="https://barrierlens.vercel.app"
        className="font-medium underline underline-offset-2"
        target="_blank"
        rel="noreferrer"
      >
        barrierlens.vercel.app
      </a>{" "}
      走 Google Gemma API（线上环境）
    </div>
  );
}

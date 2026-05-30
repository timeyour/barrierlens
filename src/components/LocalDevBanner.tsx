/** 本地开发提示：与 Vercel 线上环境差异 */
export default function LocalDevBanner() {
  if (process.env.NODE_ENV !== "development") return null;

  const ollamaPreferred = process.env.OLLAMA_PREFERRED === "true";
  const ollamaModel = process.env.OLLAMA_MODEL?.trim() || "gemma4:latest";

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
      ) : (
        <> · 需 VPN + GEMMA_API_PROXY 才能连 Google API</>
      )}
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
      走 Google Gemma API（团队共用）
    </div>
  );
}

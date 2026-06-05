# 本地复现 Gemma 4 分析链路

> 目标：在 30 分钟内完成一次「上传 → 分析 → 看到 analysisSource」验证。

## 1. 准备环境

```bash
git clone https://github.com/timeyour/barrierlens.git
cd barrierlens
npm install
cp .env.example .env.local
```

浏览器打开：http://localhost:3000/#tool

## 2. 路径 A：本机 Ollama（推荐本地开发）

无需 Google API Key，适合中国大陆网络环境。

`.env.local`：

```env
OLLAMA_PREFERRED=true
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma4:latest
NEXT_PUBLIC_OLLAMA_PREFERRED=true
```

前置：本机已安装 [Ollama](https://ollama.com/) 并拉取模型：

```bash
ollama pull gemma4:latest
```

启动：

```bash
npm run dev
```

验证：

1. 打开 `#tool`，点击「使用样例图」或上传照片。
2. 手动输入路名（如「上海市浦东新区芳甸路」）。
3. 生成分析。
4. 结果区 banner 应显示 **本机 Ollama**；Network 中 `/api/analyze` 响应 `analysisSource: "ollama"`。

## 3. 路径 B：Google Gemma 4 REST

`.env.local`：

```env
GEMINI_API_KEY=your_key_from_google_ai_studio
GEMMA_MODEL_NAME=gemma-4-26b-a4b-it
GEMMA_API_TIMEOUT_MS=55000
OLLAMA_PREFERRED=false
# 若需代理（本地常见）：
# GEMMA_API_PROXY=http://127.0.0.1:7897
```

Key 申请：[Google AI Studio](https://aistudio.google.com/app/apikey)

验证：`analysisSource: "gemma"`，banner 显示 Gemma 4 分析。

## 4. 路径 C：无 Key Mock（仅演示数据）

不配置 `GEMINI_API_KEY`，且 `OLLAMA_PREFERRED=false`、Ollama 不可达。

验证：`analysisSource: "mock"`，banner 明确提示「演示数据，未连接 AI」。

**注意：** Mock 不代表 Gemma 4 识图能力，不可用于大赛能力证明。

## 5. mock_fallback（开发环境）

已配置 Key 但 Google API 失败时，**非生产**环境可能降级为 `mock_fallback`（`ALLOW_MOCK_FALLBACK` 未设为 `false` 时）。

生产 Vercel 应设 `ALLOW_MOCK_FALLBACK=false`，失败直接报错，不 silent 降级。

## 6. 自动化冒烟

```bash
npm run lint
npm run build
npm run dev   # 另开终端
npm run test:multiround
```

## 7. 环境变量速查

见仓库根目录 `.env.example`。与模型相关：

| 变量 | 说明 |
|------|------|
| `GEMINI_API_KEY` / `GEMMA_API_KEY` | Google API Key |
| `GEMMA_MODEL_NAME` | 默认 `gemma-4-26b-a4b-it` |
| `GEMMA_API_TIMEOUT_MS` | 超时（Vercel 建议 55000） |
| `GEMMA_API_PROXY` | 本地代理；Vercel 留空 |
| `ALLOW_MOCK_FALLBACK` | 生产 `false` |
| `OLLAMA_PREFERRED` | 本地 `true` 可跳过 Google |
| `OLLAMA_MODEL` | 默认 `gemma4:latest` |

## 8. 相关文档

- 模型来源：[MODEL_PROVENANCE.md](./MODEL_PROVENANCE.md)
- 线上部署：[GEMMA4_DEPLOYMENT.md](./GEMMA4_DEPLOYMENT.md)

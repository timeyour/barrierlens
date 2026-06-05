# Gemma 4 模型来源与证明链

> 无碍 BarrierLens · Gemma 4 开发者大赛 2026 · 赛道 D

## 1. 使用的模型

| 项 | 值 |
|----|-----|
| 模型 ID | `gemma-4-26b-a4b-it`（可通过 `GEMMA_MODEL_NAME` 覆盖） |
| 调用方式 | Google Gemini REST `generateContent`（多模态：文本 Prompt + 图片 inlineData） |
| 代码入口 | `src/lib/gemma.ts` → `POST /api/analyze` |
| 本地替代 | Ollama `gemma4:latest`（`src/lib/ollama.ts`，见 [LOCAL_REPRODUCE.md](./LOCAL_REPRODUCE.md)） |

## 2. 是否微调

**未微调。** 项目未对 Gemma 4 做额外训练或 LoRA 微调。

能力来自：

1. Gemma 4 预训练多模态理解；
2. 项目 Prompt（场景定义、三类无障碍场景、输出 JSON schema 约束）；
3. 服务端 `normalizeResult` 字段归一化与校验。

## 3. 输入如何进入模型

```text
用户上传图片（浏览器 File）
  → FormData POST /api/analyze
  → 服务端转 base64 data URL
  → gemma.ts 构造 generateContent 请求：
       - system/user prompt（无障碍场景 + JSON 字段说明）
       - inlineData: { mimeType, data: base64 }
  → 模型返回 JSON 文本
  → normalizeResult → AnalysisResult
```

相关文件：

- `src/app/api/analyze/route.ts`
- `src/lib/gemma.ts`
- `src/types/analysis.ts`

## 4. 输出 JSON 字段（核心）

完整类型见 `src/types/analysis.ts` 中 `AnalysisResult`。主要字段：

| 字段 | 说明 |
|------|------|
| `hasIssue` | 是否发现通行障碍 |
| `sceneType` | 盲道占用 / 入口坡道 / 通行链断点 / 无明显问题 |
| `category` | 空间冲突品类（设计硬伤 / 加建冲突 / 容量错配） |
| `obstacles` | 障碍物列表（name, position, blocks） |
| `blockedPath` | 受阻路径描述 |
| `pathStatus` | clear / partial / blocked |
| `riskLevel` | 低 / 中 / 高 |
| `affectedGroups` | 影响人群 |
| `evidencePoints` | 证据要点 |
| `responsibleParty` / `suggestedActions` | 责任方与整改建议 |
| `reportText` / `advocacyText` / `inspectionText` | 随记录模式切换的文本 |
| `confidence` / `needsHumanReview` | 置信度与人工复核标记 |

API 额外返回：

| 字段 | 说明 |
|------|------|
| `analysisSource` | `gemma` \| `ollama` \| `mock` \| `mock_fallback` |
| `mockMode` | 是否为 Mock 结果 |
| `modelName` | 实际模型名 |
| `model` | 与 `modelName` 相同（便于 Network 面板检索） |
| `fallbackReason` | 降级原因（如有） |
| `analysisTimeMs` | 分析耗时 |

## 5. analysisSource 含义（必须向评委说明）

| 值 | 含义 | 是否代表 Gemma 4 真实能力 |
|----|------|---------------------------|
| `gemma` | Google REST 真实 Gemma 4 推理 | **是** |
| `ollama` | 本机 Ollama 运行 Gemma 兼容模型 | 本地复现用，非线上默认 |
| `mock` | 未配置 API Key，使用预设演示数据 | **否** |
| `mock_fallback` | 已配置 Key 但调用失败后降级演示 | **否**；生产默认关闭 |

生产环境：`ALLOW_MOCK_FALLBACK=false`（见 [GEMMA4_DEPLOYMENT.md](./GEMMA4_DEPLOYMENT.md)）。Gemma 失败会直接报错，避免假识图。

## 6. Mock 数据

- 实现：`src/lib/mockAnalysis.ts`
- 用途：无 Key 本地演示、开发冒烟测试
- **不得**在提交材料或路演中把 Mock 结果表述为 Gemma 4 实时识图能力

## 7. 相关文档

- 本地复现：[LOCAL_REPRODUCE.md](./LOCAL_REPRODUCE.md)
- Vercel 部署：[GEMMA4_DEPLOYMENT.md](./GEMMA4_DEPLOYMENT.md)
- 技术报告：[TECHNICAL_REPORT.md](./TECHNICAL_REPORT.md)

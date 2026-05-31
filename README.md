# 无碍 BarrierLens

> 拍照识别公共空间无障碍通行风险，生成可归档、可复查、可导出的现场证据。

## 团队归属

| 项目 | 说明 |
|------|------|
| **团队** | 小马过河 |
| **产品** | 无碍 BarrierLens |
| **赛事** | [Gemma 4 开发者大赛 2026](https://ai.google.dev/) · 上海站 · **赛道 D · AI for Social Good** |
| **仓库** | https://github.com/timeyour/barrierlens |
| **在线 Demo** | https://barrierlens-1utx.vercel.app/ （主域名 `barrierlens.vercel.app` 需在 Vercel 手动 Redeploy 后才会同步） |
| **Hackathon 版本** | [`v0.1-hackathon-demo`](https://github.com/timeyour/barrierlens/releases/tag/v0.1-hackathon-demo) |

**提交四件套：** 代码仓库 · 在线 Demo · Demo 视频 · [技术报告](docs/TECHNICAL_REPORT.md)

- Demo 视频脚本: [docs/DEMO_VIDEO_SCRIPT.md](docs/DEMO_VIDEO_SCRIPT.md)

---
## 1. 问题

盲道被共享单车占用、无障碍入口被电瓶车挡住、临时围挡造成通行链断点，这些问题往往能被路人看见，却很难形成可持续跟进的证据。

BarrierLens 的核心判断是：

> 人拍照不是为了让 AI 看见，而是为了让问题留下证据。AI 的作用不是复述照片，而是把现场问题转成可整改、可归档、可复查的结构化记录。

## 2. 方案

BarrierLens 是基于 Gemma 4 多模态理解的无障碍通行风险识别与证据生成工具。

当前默认前台是 V2 证据平台口径：

1. 上传现场照片。
2. 选择地点、场景归类与记录模式。
3. Gemma 4 输出结构化 JSON。
4. 生成风险地图、公众倡导摘要或物业巡查整改单。
5. 自动归档到本机时间线。
6. 上传整改复拍，完成前后对比与复查状态流转。

### 三类场景

| 场景 | 说明 |
|------|------|
| 盲道占用 | 共享单车、电瓶车、杂物阻断盲道连续通行 |
| 入口 / 坡道受阻 | 商场、小区、医院等入口净宽或坡道被占 |
| 通行链断点 | 路缘坡道缺失、门槛过高、围挡绕行、通道狭窄 |

## 3. Gemma 4 作用

Gemma 4 负责无障碍场景理解与结构化证据生成，不只是识图。

```text
现场照片 -> Gemma 4 多模态分析 -> 结构化 JSON
  -> 问题类型 / 场景类型 / 风险等级
  -> 障碍物 / 受阻路径 / 影响人群
  -> 证据要点 / 责任方 / 整改建议
  -> 公众倡导摘要 / 物业巡查整改单
```

真实 API 走 `src/lib/gemma.ts`（Gemini REST `generateContent` → `gemma-4-26b-a4b-it`）。未配置 API Key 时使用 Mock；配置了 Key 但接口超时或失败时，会自动降级为 Mock，并在页面和 API 响应中标注 `analysisSource=mock_fallback`。

### API 响应状态

| 字段 | 含义 |
|------|------|
| `analysisSource=gemma` | 本次结果来自真实 Gemma 4 兼容接口 |
| `analysisSource=mock` | 未配置 Key，使用演示数据 |
| `analysisSource=mock_fallback` | 已配置 Key，但接口失败后自动降级 |
| `mockMode` | 是否为 Mock 结果 |
| `fallbackReason` | 降级原因，仅在失败降级时返回 |
| `analysisTimeMs` | 服务端分析耗时 |

## 4. 技术架构

```text
Next.js 16 + TypeScript + Tailwind CSS 4 + framer-motion + GSAP
├── src/app/api/analyze/route.ts     # 图片分析 API
├── src/lib/gemma.ts                 # Gemma 4 兼容接口 + Mock fallback
├── src/lib/mockAnalysis.ts          # 三场景 Mock 数据
├── src/lib/recordStore.ts           # localStorage 时间线
├── src/lib/exportReportContent.ts # 报告内容（PDF / Markdown 共用）
├── src/lib/exportPdf.ts           # PDF 导出
├── src/lib/exportMarkdown.ts      # Markdown 导出（备用）
├── src/components/AnalysisWorkflow.tsx
├── src/components/BarrierMap.tsx
├── src/components/RecordTimeline.tsx
└── src/types/analysis.ts
```

## 5. 本地运行

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000

### 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

| 变量 | 说明 |
|------|------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) 创建的 Key；为空时使用 Mock |
| `GEMMA_API_KEY` | 兼容旧变量名，与 `GEMINI_API_KEY` 二选一 |
| `GEMMA_MODEL_NAME` | 默认 `gemma-4-26b-a4b-it` |
| `GEMMA_API_TIMEOUT_MS` | 默认 `25000`（Gemma 4 多模态常需 10–20s；Vercel Hobby 函数上限约 10s，易降级时需 Pro 或调 Key 在 Vercel 同步本变量） |
| `GEMMA_API_RETRY_ATTEMPTS` | 默认 `2`，仅对网络类错误重试 |
| `GEMMA_API_PROXY` | 本地开发需代理时填写，如 `http://127.0.0.1:7897`；**Vercel 留空** |
| `NEXT_PUBLIC_V2_ENABLED` | 默认 `true`；设为 `false` 回退 MVP |
| `NEXT_PUBLIC_V2_BARRIER_MAP_ENABLED` | 默认 `true` |
| `NEXT_PUBLIC_V2_REVIEW_FLOW_ENABLED` | 默认 `true` |

URL 临时切换：

- `/?mode=v2` 强制显示 V2 证据平台。
- `/?mode=mvp` 强制显示 MVP 稳定版。

## 6. 测试

```bash
npm run lint
npm run build
```

多轮 API 测试需要先启动服务：

```bash
npm run dev
npm run test:multiround
```

目标指标：

| 指标 | 目标 |
|------|------|
| 测试照片 | >= 30 张 |
| 结构化 JSON 成功率 | >= 95% |
| 盲道/入口/通行链三类覆盖 | 必须覆盖 |
| 平均分析耗时 | <= 8 秒 |
| Demo 视频 | <= 5 分钟 |

## 7. 隐私与边界

- 默认无账号；时间线保存在本机浏览器（约 5MB / 25 条上限）。
- 公开池 `/reports` 需**用户勾选同意**后才发布摘要；公开时**位置自动模糊、不含现场照片**。
- 他人可申请复核查看照片；是否提供由记录者在本机档案决定。
- 照片只用于当次分析；导出 PDF 供人工核对后递出。
- AI 输出用于记录、倡导、自查和复核，不替代执法或专业验收。
- 低置信度或接口失败时必须人工复核。
- Mock 模式不是实时识图，提交材料和演示中必须标注。

## 8. 提交四件套

| 材料 | 状态 | 说明 |
|------|------|------|
| 代码仓库 | 已具备 | GitHub `timeyour/barrierlens` |
| 在线 Demo | 已具备 | Vercel 部署 |
| Demo 视频 <= 5 分钟 | 待录制 | 见 `docs/DEMO_VIDEO_SCRIPT.md` |
| 技术报告 | 初稿已补 | 见 `docs/TECHNICAL_REPORT.md` |

## License

MIT · **小马过河** · Gemma 4 Hackathon 2026 上海站 · 赛道 D

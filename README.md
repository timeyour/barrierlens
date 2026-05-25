# 无碍 BarrierLens

> 让无障碍问题被看见、被记录、被反馈

**Gemma 4 开发者大赛 2026 · 上海站 · 团队「小马过河」· 赛道 D · AI for Social Good**

无碍 BarrierLens 是基于 **Gemma 4 多模态理解** 的无障碍环境问题 **记录与证据平台**。用户上传盲道占用现场照片，Gemma 4 输出结构化标注（问题类型、风险、影响群体、建议），并归档到本地时间线，支持 **公众倡导摘要** 与 **物业自查整改单** 双模式导出。

官网报名项目名：无碍｜让无障碍问题被看见、被记录、被反馈  
Hackathon 官网：https://hackathon.googdg.cn

---

## 赛道与评审对齐

| 评审维度 | 权重 | 本项目如何对应 |
|---------|------|---------------|
| 真实社会影响 | 30% | 盲道占用高频场景；服务志愿者、残联、物业自查；公民证据库路径 |
| 技术深度 | 25% | **Gemma 4** 视觉 + JSON 结构化生成；Prompt 工程；Mock/API 双模式 |
| 完整度 | 20% | 上传→分析→时间线→导出；移动端；公网 Demo |
| 创新 | 15% | 从单次投诉转向可汇总证据；参考 Project Sidewalk 范式 |
| 呈现质量 | 10% | 在线 Demo + 仓库 + 视频 + 技术报告 |

### 赛制合规

- **核心模型**：Gemma 4（任意规格，见 `src/lib/gemma.ts`）
- **赛道**：D · AI for Social Good · 无障碍（同时涉及 B · Multimodal 视觉理解）
- **数据合规**：无用户账号；照片仅用于当次分析；Mock 不持久化原图；训练数据可披露为「Gemma 4 预训练 + 项目 Prompt，无额外微调」
- **提交截止**：2026-06-08 23:59

### 最终提交四件套

| 材料 | 状态 | 说明 |
|------|------|------|
| 代码仓库 | ✅ | GitHub `timeyour/barrierlens` |
| 在线 Demo URL | ✅ | Vercel 部署 |
| Demo 视频 ≤ 5 分钟 | ⬜ | 待录制 |
| 技术报告 | ⬜ | 待撰写（见下方大纲） |

---

## 我们解决的问题

单次微信发图或 12345 投诉，往往 **治标不治本**——问题会反复出现，且难以汇总成系统性证据。

无碍的做法：

1. **记录**：Gemma 4 将照片结构化为可检索条目  
2. **归档**：本地时间线累积（公民科学 / 证据库）  
3. **输出**：公众倡导摘要（给公益组织/媒体）或物业自查整改单（给有动力整改的机构）

普通发现 → 结构化证据 → 可被看见、被汇总、被用于倡导或自查。

---

## Gemma 4 的作用（非简单识图）

```
现场照片 ──→ Gemma 4 多模态 API ──→ 结构化 JSON
                                      ├── issueType / riskLevel
                                      ├── affectedGroups
                                      ├── sceneDescription / suggestion
                                      ├── advocacyText（公众记录）
                                      └── inspectionText（物业自查）
```

1. 理解照片中是否存在盲道占用  
2. 评估风险等级（低 / 中 / 高）  
3. 识别影响人群  
4. 生成客观现场描述与整改/关注建议  
5. 按记录模式输出不同文体（倡导 vs 自查）

未配置 `GEMMA_API_KEY` 时自动 Mock，字段与真实 API 一致，便于 Demo。

---

## 功能清单

- [x] 图片上传与预览
- [x] 地点标注 + 场景归类（物业/社区/商场/城管）
- [x] 双记录模式：公众记录 / 物业自查
- [x] Gemma 4 分析（Mock / API）
- [x] 问题记录时间线（localStorage）
- [x] 公众倡导摘要 / 巡查整改单导出（Markdown）
- [x] 移动端响应式 + Hero 滚动叙事
- [x] 参赛对齐说明区块（评审维度 / 提交清单）

---

## 为什么第一版聚焦「盲道占用」

- 场景高频、问题可见、MVP 可验证  
- 与报名邮件一致，可扩展至坡道/门槛等（架构已预留 JSON 字段）  
- 量化测试集可快速构建（≥30 张）

---

## 技术架构

```
Next.js 16 + TypeScript + Tailwind CSS 4 + framer-motion
├── src/app/api/analyze/route.ts     # Gemma 4 / Mock 分析 API
├── src/lib/gemma.ts                 # Gemma 4 集成（JSON 结构化输出）
├── src/lib/mockAnalysis.ts          # Mock 双模式文本
├── src/lib/recordStore.ts           # 本地时间线
├── src/lib/exportMarkdown.ts        # 倡导 / 整改单导出
├── src/components/
│   ├── AnalysisWorkflow.tsx         # 主工作流
│   ├── RecordTimeline.tsx           # 证据时间线
│   ├── HackathonBrief.tsx           # 参赛对齐说明
│   └── ...
└── src/types/analysis.ts
```

---

## 量化目标（技术报告用）

| 指标 | 目标 |
|------|------|
| 测试照片 | ≥ 30 张 |
| 盲道占用识别准确率 | ≥ 85% |
| 结构化生成成功率 | ≥ 95% |
| 平均分析耗时 | ≤ 8 秒 |
| 用户操作步骤 | ≤ 4 步 |
| Demo 视频 | ≤ 5 分钟 |
| 路演 | ≤ 3 分钟 |

---

## 技术报告大纲（6/8 提交）

1. **摘要**：赛道 D、问题、Gemma 4 方案、社会影响  
2. **背景**：盲道占用现状 + 单次投诉局限 + 公民证据库范式  
3. **Gemma 4 用法**：模型规格、Prompt、JSON schema、多模态输入  
4. **架构**：Next.js、API Route、Mock 降级、隐私设计  
5. **评估**：测试集规模、准确率、耗时、案例截图  
6. **局限与展望**：地图、多问题识别、端侧 Gemma（AI Edge Gallery）  
7. **团队**：小马过河 · 成员与分工  
8. **合规**：数据来源、无 PII 存储、Gemma 4 为核心模型声明  

---

## Demo 视频脚本（≤ 5 分钟）

| 时间 | 内容 |
|------|------|
| 0:00–0:30 | 问题：盲道被占、单次投诉易被忽略 |
| 0:30–1:00 | 产品：无碍 + Gemma 4 + 赛道 D |
| 1:00–2:30 | 演示：上传 → 公众记录 → 时间线 → 导出倡导摘要 |
| 2:30–3:30 | 演示：物业自查模式 → 整改单 |
| 3:30–4:30 | 技术：Gemma 4 结构化 JSON + 量化指标 |
| 4:30–5:00 | 展望：证据库、残联合作、端侧扩展 |

---

## 本地运行

```bash
cd barrierlens
npm install
npm run dev
```

浏览器打开 http://localhost:3000

### 环境变量

| 变量 | 说明 |
|------|------|
| `GEMMA_API_KEY` | Gemma 4 API 密钥（必填方可走真实模型） |
| `GEMMA_API_BASE_URL` | API 地址（可选） |
| `GEMMA_MODEL_NAME` | 默认 `gemma-4` |
| `NEXT_PUBLIC_V2_ENABLED` | `true` 启用 V2 风险闭环页面，`false` 回退 MVP 稳定版 |
| `NEXT_PUBLIC_V2_BARRIER_MAP_ENABLED` | V2 内 Barrier Map 子开关（预留） |
| `NEXT_PUBLIC_V2_REVIEW_FLOW_ENABLED` | V2 内整改复查子开关（预留） |

快速回退到 MVP：

```bash
NEXT_PUBLIC_V2_ENABLED=false npm run dev
```

临时 URL 切换（优先级高于环境变量）：

- `http://localhost:3000/?mode=mvp` 强制显示 MVP
- `http://localhost:3000/?mode=v2` 强制显示 V2

---

## 公网部署

Vercel 一键部署，详见上文历史说明。Mock 模式可直接 Demo；配置 `GEMMA_API_KEY` 后切换真实 Gemma 4。

---

## 风险与边界

| 边界 | 说明 |
|------|------|
| 不替代执法 | 记录与倡导工具，非自动投诉系统 |
| 需人工复核 | AI 分析结果供参考 |
| 本地归档 | 第一版时间线存浏览器，无云端账号 |
| Mock 非真实识图 | 演示模式为预设场景，报告需标注 |

---

## License

MIT · 小马过河 @ Gemma 4 Hackathon 2026 上海站

# 无碍 BarrierLens

> 让无障碍问题被看见、被记录、被反馈

**无碍 BarrierLens** 是一个基于 Gemma 4 的公众无障碍反馈生成工具，帮助普通人将现场照片快速转化为结构化、专业化、可提交的整改反馈报告。

**参赛背景：** Gemma 4 开发者大赛 2026 上海站 · 团队「小马过河」· 赛道 D · AI for Social Good

---

## 我们解决的问题

很多人看到无障碍问题，但不知道怎么描述、归谁管、怎么反馈。

普通表达：「这里过不去。」

系统生成：「该处盲道连续性被共享单车阻断，影响视障人士连续、安全通行。建议责任方及时清理占用物，并加强该点位日常巡查。」

**BarrierLens is not designed to replace regulation, but to lower the barrier for public participation in accessibility feedback.**

**中文：** 无碍不是替代监管，而是降低公众参与无障碍反馈的门槛。它让一次普通的发现，变成一份可能推动整改的报告。

---

## 为什么第一版只做「盲道占用」

- 场景高频：地铁口、商场、小区、医院附近普遍存在
- 问题清晰：占用物可见、责任边界相对明确
- 反馈路径成熟：物业 / 社区 / 商场 / 城管均有对应渠道
- MVP 原则：一个场景做深做透，比多场景浅尝辄止更有说服力

---

## Gemma 4 的作用

Gemma 4 负责**无障碍场景理解与结构化反馈生成**，而非单纯识图：

1. 理解照片中是否存在盲道占用
2. 判断风险等级（低 / 中 / 高）
3. 判断影响人群
4. 根据反馈对象生成不同风格的正式反馈文本
5. 输出结构化 JSON 报告

---

## 功能清单

- [x] 图片上传与预览
- [x] 反馈对象选择（物业 / 社区 / 商场 / 城管）
- [x] Mock / Gemma 分析（无 API Key 时自动 Mock）
- [x] 结构化结果展示（问题类型、风险等级、影响群体、现场描述、整改建议）
- [x] 标准化反馈文本生成
- [x] 复制反馈文本
- [x] 导出 Markdown 报告
- [x] 移动端优先响应式布局

---

## 技术架构

```
Next.js 16 (App Router) + TypeScript + Tailwind CSS
├── src/app/page.tsx              # 首页（Hero / 问题说明 / 工作流 / 量化目标）
├── src/app/api/analyze/route.ts  # 分析 API（Gemma / Mock）
├── src/components/               # UI 组件
│   ├── ImageUploader.tsx
│   ├── TargetSelector.tsx
│   ├── AnalysisResult.tsx
│   ├── ReportCard.tsx
│   ├── MetricCard.tsx
│   └── AnalysisWorkflow.tsx
├── src/lib/
│   ├── gemma.ts                  # Gemma 4 API 集成（预留）
│   ├── mockAnalysis.ts           # Mock 分析逻辑
│   └── exportMarkdown.ts         # Markdown 导出
└── src/types/analysis.ts         # 类型定义
```

**部署目标：** Vercel

---

## 本地运行

```bash
cd barrierlens
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

---

## 环境变量配置

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

| 变量 | 说明 |
|------|------|
| `GEMMA_API_KEY` | Gemma 4 API 密钥 |
| `GEMMA_API_BASE_URL` | API 基础地址（可选） |
| `GEMMA_MODEL_NAME` | 模型名称，默认 `gemma-4` |

---

## Mock 模式说明

未配置 `GEMMA_API_KEY` 时，系统自动进入 **Mock 演示模式**：

- 页面会显示「演示模式」提示
- 根据上传图片文件名 / 内容哈希选取预设场景（4 种盲道占用变体）
- 模拟 1.5–2.5 秒分析延迟
- 根据所选反馈对象生成差异化正式文本
- 输出字段与真实 API 完全一致，便于 Demo 与评审

配置 `GEMMA_API_KEY` 后，`src/lib/gemma.ts` 中的 `callGemmaApi` 将自动接管；API 失败时降级回 Mock。

---

## 输出 JSON 结构

```json
{
  "issueType": "盲道占用",
  "riskLevel": "中",
  "affectedGroups": ["视障人士", "老年人", "行动不便者"],
  "sceneDescription": "照片中盲道被共享单车占用，连续通行路径被阻断。",
  "suggestion": "建议责任方及时清理占用车辆，并加强该点位高峰期巡查。",
  "targetDepartment": "物业",
  "reportText": "您好，现场发现该处盲道被共享单车占用..."
}
```

---

## 量化目标

| 指标 | 目标 |
|------|------|
| 真实测试照片 | ≥ 30 张 |
| 问题照片 | ≥ 20 张 |
| 正常照片 | ≥ 10 张 |
| 盲道占用识别准确率 | ≥ 85% |
| 误报率 | ≤ 15% |
| 报告生成成功率 | ≥ 95% |
| 平均生成时间 | ≤ 8 秒 |
| 用户操作步骤 | ≤ 4 步 |
| 演示视频 | ≤ 5 分钟 |
| 路演时长 | ≤ 3 分钟 |

---

## 未来扩展

- 接入真实 Gemma 4 Vision API
- 更多无障碍场景（坡道、电梯、无障碍卫生间）
- 反馈模板自定义
- 多语言支持

---

## 风险与边界

| 边界 | 说明 |
|------|------|
| 不替代监管 | 工具仅生成反馈文本，不自动投诉或执法 |
| 不保证 100% 准确 | AI 分析需人工复核后再提交 |
| 无用户系统 | 第一版不存储任何用户数据 |
| 无地图功能 | 聚焦单点反馈，不做城市级平台 |
| Mock 非真实识别 | 演示模式下结果为预设场景，不代表真实识图能力 |

---

## License

MIT · 小马过河 @ Gemma 4 Hackathon 2026 上海站

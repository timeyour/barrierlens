# BarrierLens 比赛提交说明

> Gemma 4 开发者大赛 2026 · 赛道 D · AI for Social Good

## 提交四件套

| 材料 | 填写位置 | 当前值 |
|------|----------|--------|
| **在线 Demo** | 官方表单「Demo URL」 | `https://barrierlens.vercel.app/#tool` |
| **代码仓库** | 官方表单「GitHub URL」 | `https://github.com/timeyour/barrierlens` |
| **Demo 视频** | 官方表单「Video URL」 | [B 站 · BarrierLens_Gemma4_demo_final](https://www.bilibili.com/video/BV1LtEg6zEqS/) |
| **技术报告** | 附件 / 链接 | [docs/TECHNICAL_REPORT.md](./docs/TECHNICAL_REPORT.md) |

备用 Demo（主域名 DNS 异常时）：`https://barrierlens-1utx.vercel.app/#tool`

## 仓库说明

- **主分支：** 含比赛交付版 Demo 包（证据链口径 + 演示样例 + 导出 + 时间线）
- **Hackathon 快照 tag：** [`v0.1-hackathon-demo`](https://github.com/timeyour/barrierlens/releases/tag/v0.1-hackathon-demo)
- **提交包目录：** `submissions/2026/D/BarrierLens/`

## 演示视频建议

- 时长 **≤ 5 分钟**
- 结构：问题 → 证据链口径 → 演示样例跑通 → 结构化 JSON → 时间线 → 导出 → 人工复核
- 脚本：[docs/DEMO_VIDEO_SCRIPT.md](./docs/DEMO_VIDEO_SCRIPT.md)
- 现场演示路径：[DEMO_GUIDE.md](./DEMO_GUIDE.md)

## 开发过程说明（如赛方要求）

本项目主要使用 **Cursor Agent + Gemma 4 API** 辅助开发，典型步骤：

1. **需求对齐：** 证据链产品口径（非单点识图 Demo）
2. **Prompt + JSON Schema：** `src/lib/gemma.ts` 约束 Gemma 4 结构化输出
3. **前端工作流：** Next.js 上传 → 分析 → localStorage 时间线
4. **比赛兜底：** 演示样例 + productionDemoCache + mock 数据
5. **导出层：** Markdown / PDF 共用 `exportReportContent.ts`
6. **部署：** Vercel + Supabase（公开池可选，非 Demo 必需路径）
7. **交付文档：** README / DEMO_GUIDE / SUBMISSION_NOTES

## 安全与合规

- **不要** 提交 `.env`、`.env.local` 或任何 API Key
- **不要** 在 README / 视频 / 截图中暴露 `GEMINI_API_KEY`、`SUPABASE_SERVICE_ROLE_KEY`
- 仓库已提供 `.env.example` 作为变量名参考
- 生产环境建议 `ALLOW_MOCK_FALLBACK=false`，避免 silent 降级

## 失败兜底说明（评委 FAQ）

| 场景 | 行为 |
|------|------|
| 未配置 API Key | `analysisSource=demo-mock`，使用 Mock 结构化数据 |
| API 超时 / 失败 | 生产默认报错；本地可 `ALLOW_MOCK_FALLBACK=true` 降级 |
| 比赛现场网络差 | 使用 **演示样例** 按钮 + 时间线 **加载演示样例（10 条）** |
| 大照片 Vercel 超时 | 提示使用演示样例（约 2 秒） |

## 项目边界（提交材料中建议写明）

- 不是执法或合规自动判定工具
- 不替代人工复核与专业验收
- 默认无账号；证据存本机浏览器
- 公开池仅发布摘要，不含原图（需用户勾选同意）

## 本地验证清单

```bash
npm install
npm run lint
npm run build
npm run dev
# 打开 http://localhost:3000/#tool
# 走一遍 DEMO_GUIDE.md 的 3 分钟路径
```

## 联系与归属

- **团队：** 小马过河
- **产品：** 无碍 BarrierLens
- **License:** MIT

# 无碍 BarrierLens · 官方提交包

**Gemma 4 开发者大赛 2026 · 上海站 · 赛道 D · AI for Social Good**

团队：小马过河

---

## 正式入口（唯一对外）

| 项 | 链接 |
|----|------|
| 在线 Demo | https://barrierlens.vercel.app/#tool |
| 代码仓库 | https://github.com/timeyour/barrierlens |

其它 `barrierlens-*.vercel.app`、preview、legacy URL 仅用于开发排查，不作为提交入口。

---

## 提交四件套

| 材料 | 状态 | 位置 |
|------|------|------|
| 代码仓库 | ✅ | https://github.com/timeyour/barrierlens |
| 在线 Demo | ✅ | https://barrierlens.vercel.app/#tool |
| Demo 视频（≤5 分钟） | ⏳ 待录制 | 脚本：[docs/DEMO_VIDEO_SCRIPT.md](../../docs/DEMO_VIDEO_SCRIPT.md) |
| 技术报告 | ✅ | [docs/TECHNICAL_REPORT.md](../../docs/TECHNICAL_REPORT.md) |

---

## Gemma 4 证明链

| 文档 | 路径 |
|------|------|
| 模型来源与字段 | [docs/MODEL_PROVENANCE.md](../../docs/MODEL_PROVENANCE.md) |
| 本地复现 | [docs/LOCAL_REPRODUCE.md](../../docs/LOCAL_REPRODUCE.md) |
| 线上部署 | [docs/GEMMA4_DEPLOYMENT.md](../../docs/GEMMA4_DEPLOYMENT.md) |
| 环境变量模板 | [.env.example](../../.env.example) |

---

## 产品定位（提交口径）

- **当前 Demo**：公共空间无障碍通行风险（盲道、坡道、出入口障碍）
- **主流程**：拍照 → Gemma 4 分析 → 本机归档 / 导出 → 可选公开 → 复查闭环
- **增强功能**：登录同步、自动定位（均不阻断游客主流程）
- **未来扩展**：市容卫生等城市管理议题（非当前版本范围）

---

## 部署验收（提交前人工确认）

Vercel → 项目 **barrierlens** → Deployments → Production：

1. 状态 **Ready**
2. Branch **`main`**
3. Commit 与 GitHub 最新提交一致
4. 页脚「构建 xxxxxxx」与 commit 前 7 位一致
5. `/api/analyze` 返回 `analysisSource: "gemma"`（Production 已配 Key）

详见 [docs/GEMMA4_DEPLOYMENT.md](../../docs/GEMMA4_DEPLOYMENT.md)。

---

## 提交前检查清单

- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
- [ ] Production Gemma 4 真实推理可用
- [ ] `/reports` 有可读公开案例（可选但建议）
- [ ] Demo 视频已录制并填入链接
- [ ] 演示中 Mock / mock_fallback 已口播标注

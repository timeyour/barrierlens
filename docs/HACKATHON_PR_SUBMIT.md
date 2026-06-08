# 方式 A：Fork & PR 提交步骤（小马过河 · 无碍 BarrierLens）

截止：**2026-06-08 23:59**

## 1. 开启 GitHub 2FA（若 Fork 时被跳转）

打开 https://github.com/settings/security → **Two-factor authentication** → 用 Authenticator App 完成绑定。

## 2. Fork 官方仓库

1. 打开 https://github.com/gdgshanghai/Gemma4-Hackathon-ShangHai
2. 右上角 **Fork** → Fork 到你的账号 `timeyour`

## 3. 复制提交包

在本机（barrierlens 仓库根目录）：

```bash
# 假设已 clone 你的 fork 到 ../Gemma4-Hackathon-ShangHai
FORK=../Gemma4-Hackathon-ShangHai   # 改成你的 fork 路径
mkdir -p "$FORK/submissions/2026/D/BarrierLens"
cp submissions/2026/D/BarrierLens/* "$FORK/submissions/2026/D/BarrierLens/"
cd "$FORK"
git checkout -b submit/barrierlens-d
git add submissions/2026/D/BarrierLens/
git commit -m "submit: [赛道D] 无碍 BarrierLens - 小马过河"
git push -u origin submit/barrierlens-d
```

## 4. 发起 Pull Request

1. 在 GitHub 打开你的 fork → **Compare & pull request**
2. **Base**：`gdgshanghai/Gemma4-Hackathon-ShangHai` · `main`
3. **标题**：`[赛道D] 无碍 BarrierLens - 小马过河`
4. **描述**（可复制）：

```markdown
## 队伍
小马过河 · 赛道 D · AI for Social Good

## 四件套
- 主仓库：https://github.com/timeyour/barrierlens
- 在线 Demo：https://barrierlens-1utx.vercel.app/#tool
- Demo 视频：https://www.bilibili.com/video/BV1LtEg6zEqS/
- 技术报告：本 PR `submissions/2026/D/BarrierLens/TECHNICAL_REPORT.md`

## Gemma 4
多模态视觉 + JSON 结构化（`src/lib/gemma.ts`），未微调。
Production 结果页 `analysisSource=gemma`。
```

## 5. 填写官网表单（必做）

https://hackathon.googdg.cn/onsite-submit

| 字段 | 填写 |
|------|------|
| 上传方式 | **A. Official repo Fork & PR** |
| Fork 文件夹 URL | `https://github.com/gdgshanghai/Gemma4-Hackathon-ShangHai/tree/main/submissions/2026/D/BarrierLens`（PR 合并前填你 fork 里同路径链接） |
| 赛道 | Track D: AI for Social Good |
| 项目描述 | 见下方 |

**项目描述（≥100 字，可复制）：**

> 无碍 BarrierLens 是面向公共空间无障碍通行风险的 Gemma 4 多模态证据工具。用户拍摄盲道占用、坡道或出入口障碍现场，Gemma 4 输出结构化 JSON（障碍物、风险、影响人群、整改建议），生成本机时间线归档与双模式报告（公众倡导 / 物业自查），可选公开案例池并支持复查闭环。默认本机存储、公开需用户勾选且位置模糊，符合赛道 D 数据合规要求。在线 Demo 已部署，Production 使用真实 Gemma 4 推理。

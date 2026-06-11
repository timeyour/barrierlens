# 2FA 卡住 / 「没反应」排查

GitHub 当前把账号拦在 **2FA 重新验证**，Fork、加协作者、改仓库设置都会没反应。

## 原因

输入验证码后 **没有点提交按钮**：

| 页面 | 地址 | 要点 |
|------|------|------|
| 安全设置 | https://github.com/settings/security | Authenticator 验证码填完后点绿色 **Add**（不是只填框） |
| 2FA 检查 | https://github.com/settings/two_factor_checkup | 填 6 位码后点 **Verify** |

验证通过前，Fork 页会一直显示 **Verify 2FA now**。

## 推荐验证方式（按易到难）

1. **GitHub Mobile**：安全设置 → Two-factor → **Show GitHub Mobile** → 手机 App 点批准  
2. **Authenticator**：重新扫 QR → 输入**最新** 6 位码 → 点 **Add**  
3. **Recovery codes**：安全设置 → **View Recovery codes** → 在 checkup 页 More options 里用恢复码  

## 验证通过后（方式 A）

```bash
# 1. 浏览器 Fork
# https://github.com/gdgshanghai/Gemma4-Hackathon-ShangHai/fork → Create fork

# 2. 推送提交包
cd /Users/liuxin/cursorskils/barrierlens
./scripts/push-hackathon-pr.sh

# 3. 打开脚本输出的 PR 链接，标题：
# [赛道D] 无碍 BarrierLens - 小马过河
```

## 若 2FA 今晚仍搞不定：先交表单（方式 B）

表单：https://hackathon.googdg.cn/onsite-submit

| 字段 | 填写 |
|------|------|
| 上传方式 | **B. Private repo authorization**（公开仓也可填 URL） |
| GitHub repository URL | `https://github.com/timeyour/barrierlens` |
| 在线 Demo | `https://barrierlens-1utx.vercel.app/#tool` |
| 视频 | `https://www.bilibili.com/video/BV1LtEg6zEqS/` |
| 技术报告 | 仓库 `docs/TECHNICAL_REPORT.md` 或 submission 包内链接 |
| 赛道 | Track D |

可选：仓库 Settings → Collaborators → 添加 **`gdgreview`**（Read），方便评委拉代码。

微信群 @指导老师-陈老师 说明：2FA 验证中，已用方式 B 提交表单，PR 稍后补。

# Supabase 快速配置（今日 Demo）

## 1. 创建项目

1. 打开 [supabase.com](https://supabase.com) 新建项目
2. 等待数据库就绪

## 2. 执行 SQL

Dashboard → **SQL Editor** → 粘贴 [supabase-setup.sql](./supabase-setup.sql) → Run

## 3. 创建 Storage

Dashboard → **Storage** → New bucket

- Name: `report-images`
- **Public bucket**: 关闭（私有）

## 4. 环境变量

本地 `.env.local` 与 Vercel 项目 Settings → Environment Variables：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Settings → API → anon
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Settings → API → service_role（勿提交到 Git）
NEXT_PUBLIC_AUTH_REQUIRED=false
NEXT_PUBLIC_STORAGE_MODE=local_first
```

可选国内静态地图：

```env
NEXT_PUBLIC_AMAP_KEY=你的高德 Web 服务 Key
```

## 5. 邮箱验证码登录（OTP）

### 5.1 邮件模板（必改，否则会发链接而不是验证码）

Dashboard → **Authentication** → **Email Templates** → **Magic Link**（或 Confirm signup）：

在正文里使用 **`{{ .Token }}`** 显示验证码（Supabase 常见 **6 位或 8 位**）；若模板里仍是 **`{{ .ConfirmationURL }}`**，用户只会收到点击链接，无法在站内输入验证码。

示例正文：

```html
<p>您的登录验证码：<strong>{{ .Token }}</strong></p>
<p>请在 BarrierLens 登录页输入邮件中的数字验证码，10 分钟内有效。</p>
```

### 5.2 遇到 `email rate limit exceeded`

Supabase **内置邮件**额度很低（约 **每小时 3～4 封/项目**，测试时多次点「发送/重新发送」很容易触发）。

**立刻可做：**

- 停止点击发送，**等待约 1 小时** 再试
- 查邮箱是否已有未使用的验证码（10 分钟内有效）

**长期可做：**

1. Dashboard → **Authentication** → **Rate Limits**：适当调大 OTP 间隔（同一邮箱两次发送的最短间隔）
2. **Authentication** → **SMTP Settings**：配置自定义 SMTP（Resend、SendGrid 等），再在 Rate Limits 提高 `email sent` 上限

### 5.3 URL Configuration（换域名后必改）

Production 主域名为 **`https://barrierlens.vercel.app`**；`barrierlens-1utx.vercel.app` 会 307 跳转至该域名。

Dashboard → **Authentication** → **URL Configuration**：

| 项 | 建议值 |
|----|--------|
| **Site URL** | `https://barrierlens.vercel.app` |
| **Redirect URLs** | `https://barrierlens.vercel.app/**` |
| （可选保留旧链） | `https://barrierlens-1utx.vercel.app/**` |

Vercel（项目 **barrierlens** → Production）：

```env
NEXT_PUBLIC_SITE_URL=https://barrierlens.vercel.app
```

改完 Supabase / Vercel 后：**Vercel → Redeploy Production**。

自检：`https://barrierlens.vercel.app/api/health/cloud` 应返回 `"supabaseConfigured": true`。

## 6. 验证

```bash
npm run dev
```

1. 上传照片 → 提交分析
2. 成功提示应出现 **「公开详情」** 链接
3. 打开 `/reports` 能看到列表

## 行为说明

| 配置状态 | 本机时间线 | 公开列表 `/reports` |
|---------|-----------|-------------------|
| 未配置 Supabase | ✅ 正常 | 显示配置提示 |
| 已配置 | ✅ 正常 | ✅ **用户勾选确认后**才公开（位置模糊、含现场照片） |

他人可在公开页提交「照片复核申请」；记录者在本机档案页查看并决定是否提供照片。

若从旧版升级，请在 Supabase SQL Editor 追加执行 `docs/supabase-setup.sql` 中的 `review_token` 与 `photo_access_requests` 段落。

云端同步失败不会阻断分析；本机归档始终优先。

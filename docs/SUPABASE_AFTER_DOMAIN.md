# 换域名后 Supabase 云端公开修复（3 步）

> 我无法替你登录 Supabase/Vercel，请按本页在浏览器里点 3 次。  
> 主站：https://barrierlens.vercel.app

## 1. Supabase → Authentication → URL Configuration

| 字段 | 粘贴 |
|------|------|
| **Site URL** | `https://barrierlens.vercel.app` |
| **Redirect URLs** | `https://barrierlens.vercel.app/**` |

（可选再加一行 `https://barrierlens-1utx.vercel.app/**`）

**Save**

## 2. Supabase → Storage

- 必须有私有桶 **`report-images`**（Public: OFF）
- 没有则 **New bucket** → Name: `report-images`

## 3. Vercel → 项目 barrierlens

1. **Environment Variables** → 确认 Production 有：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://barrierlens.vercel.app`
2. **Deployments** → 最新 → **Redeploy**（Production）

## 验证

1. 打开 https://barrierlens.vercel.app/api/health/cloud  
   - 成功：`"ok": true`，且 `storageBucketReady`、`databaseReadable` 均为 `true`  
   - 失败：看 JSON 里的 **`hint`**（例如 service_role key 无效、缺 Storage 桶）
2. `#tool` 分析后点「公开」→ 成功或页面会显示 **具体 hint**（如缺 Storage 桶）

本地可先跑：`node scripts/verify-supabase-cloud.mjs`（读 `.env.local`）

## 答辩

云端公开为可选；样例图 + 本机记录不依赖 Supabase。

# 迁移到主站 `barrierlens.vercel.app`

## 已自动完成（项目重命名）

因 Vercel **敏感环境变量无法通过 CLI/API 导出**，已采用官方等价做法：

1. 原 `barrierlens` → **`barrierlens-legacy`**（旧站，4 天前部署）
2. 原 `barrierlens-1utx` → **`barrierlens`**（保留全部环境变量）

现在 **https://barrierlens.vercel.app** 指向原 `barrierlens-1utx` 的配置（含高德、Supabase、Gemma 等）。

本地链接：`npx vercel link --project barrierlens`

---

## 若需手动复制环境变量（旧流程，一般已不需要）

把 `barrierlens-1utx` 上的配置与最新代码统一到短域名项目 **`barrierlens`**。

## 1. 复制环境变量（在 Vercel 控制台）

1. 打开 [barrierlens-1utx → Settings → Environment Variables](https://vercel.com/timeyours-projects/barrierlens-1utx/settings/environment-variables)
2. 打开 [barrierlens → Settings → Environment Variables](https://vercel.com/timeyours-projects/barrierlens/settings/environment-variables)
3. 将下表变量在 **barrierlens** 中补齐（Production + Preview），值与 1utx 一致：

| 变量名 |
|--------|
| `NEXT_PUBLIC_AMAP_KEY` |
| `AMAP_WEB_KEY`（可选；仅服务端用，海外常失败） |
| `NEXT_PUBLIC_SITE_URL` → 填 **`https://barrierlens.vercel.app`** |
| `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` |
| `GEMINI_API_KEY` |
| `GEMMA_MODEL_NAME` |
| `GEMMA_API_TIMEOUT_MS` |
| `NEXT_PUBLIC_AUTH_REQUIRED` |
| `NEXT_PUBLIC_STORAGE_MODE` |
| `AUTH_SECRET` |
| `TEAM_API_KEY` |

> CLI `vercel env pull` 不会带出密钥明文，必须在网页里复制或手填。

## 2. 部署最新代码到 barrierlens

仓库根目录：

```bash
npx vercel link --project barrierlens
npx vercel deploy --prod
```

或在 Vercel → 项目 **barrierlens** → Deployments → **Redeploy**（选最新 main）。

## 3. Supabase

Authentication → URL Configuration：

- **Site URL**：`https://barrierlens.vercel.app`
- **Redirect URLs**：`https://barrierlens.vercel.app/**`

## 4. 高德 Key 白名单

[控制台 Key 设置](https://console.amap.com/dev/key) 加入：

- `barrierlens.vercel.app`
- 可删除 `barrierlens-1utx.vercel.app`（停用旧站后）

## 5. 验证

- 首页：https://barrierlens.vercel.app/
- 定位配置（轻量）：https://barrierlens.vercel.app/api/location/config（旧路径 `/api/config/location` 会重写到此）
- 定位健康检查（含探针）：https://barrierlens.vercel.app/api/health/location  
  - `clientGeocodeReady: true` 即可；`serverReverseGeocodeReady` 为 false 可忽略（Vercel 海外访问高德限制）
- 页内点击「使用当前位置」应出现真实路名

## 6. 收尾（可选）

- README / 大赛材料只保留 **https://barrierlens.vercel.app/**
- 项目 `barrierlens-26ii`、`barrierlens-xgqi` 等重复项可在 Vercel 删除，避免以后再混

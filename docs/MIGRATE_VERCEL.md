# 主站收口与运行手册 `barrierlens.vercel.app`

## 最终口径

- 对外提交、演示和截图只使用：`https://barrierlens.vercel.app/#tool`，让页面直接落到记录工作台；根路径 `/` 可能先展示 Hero / 流程区。
- GitHub 仓库只认：`https://github.com/timeyour/barrierlens`
- Vercel 项目只认：`barrierlens`
- 本地开发只打开：`http://localhost:3000/#tool`
- 其它 `barrierlens-*.vercel.app`、旧 deployment URL 和 `barrierlens-legacy` 只用于排查历史部署，不再作为正式入口。
- 不从脏工作区直接 `vercel deploy --prod` 到最终域名；先把要上线的改动拆清楚、提交，再部署或 alias。

## 已自动完成（项目重命名）

因 Vercel **敏感环境变量无法通过 CLI/API 导出**，已采用官方等价做法：

1. 原 `barrierlens` → **`barrierlens-legacy`**（旧站，4 天前部署）
2. 原 `barrierlens-1utx` → **`barrierlens`**（保留全部环境变量）

现在 **https://barrierlens.vercel.app/#tool** 指向原 `barrierlens-1utx` 的配置（含高德、Supabase、Gemma 等）。

本地链接：`npx vercel link --project barrierlens`

## 线上生产配置

线上必须在 Vercel 项目 **barrierlens** 配置 Production 环境变量，并在改变量后 Redeploy。

| 用途 | 变量 |
|------|------|
| Gemma 4 API | `GEMINI_API_KEY` 或 `GEMMA_API_KEY` |
| Gemma 4 模型 | `GEMMA_MODEL_NAME=gemma-4-26b-a4b-it` |
| Gemma 4 超时 | `GEMMA_API_TIMEOUT_MS=55000` |
| 生产不伪装 Mock | `ALLOW_MOCK_FALLBACK=false` |
| Vercel 不走本机 Ollama | `OLLAMA_ENABLED=false`、`OLLAMA_PREFERRED=false` |
| Vercel 不配置本地代理 | `GEMMA_API_PROXY` 留空 |
| 正式站点 URL | `NEXT_PUBLIC_SITE_URL=https://barrierlens.vercel.app` |
| 首页布局 | `NEXT_PUBLIC_HOME_NAV=mixed` |
| 定位浏览器逆地理 | `NEXT_PUBLIC_AMAP_KEY` |
| 定位服务端兜底 | `AMAP_WEB_KEY`（可选；Vercel 海外访问高德时可能失败） |
| Supabase / 登录 / 公开记录 | `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、`NEXT_PUBLIC_AUTH_REQUIRED`、`NEXT_PUBLIC_STORAGE_MODE`、`TEAM_API_KEY` |

> 生产判断 Gemma 是否真实可用，看 `/api/analyze` 返回的 `analysisSource`：`gemma` 才是线上真实 Gemma 4；`mock` / `mock_fallback` 都不是正式识图结果。

## 本地开发配置

本地默认推荐跑 Ollama，避免 Google API / 代理不稳定影响开发。

```bash
cp .env.example .env.local
```

`.env.local` 推荐值：

```bash
OLLAMA_ENABLED=true
OLLAMA_PREFERRED=true
OLLAMA_MODEL=gemma4:latest
OLLAMA_TIMEOUT_MS=180000
NEXT_PUBLIC_OLLAMA_PREFERRED=true
NEXT_PUBLIC_ANALYZE_TIMEOUT_MS=180000
```

然后启动 Ollama App 或 `ollama serve`，再验证：

```bash
npm run verify:ollama
npm run dev
```

打开 `http://localhost:3000/#tool`。

如果本地也要测 Google / Gemma API，把 `OLLAMA_PREFERRED=false`，填 `GEMINI_API_KEY`，中国大陆网络环境通常还需要：

```bash
GEMMA_API_PROXY=http://127.0.0.1:7897
```

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

上线前先确认工作区干净：

```bash
git status --short
```

如果只是验证本地未提交改动，使用临时 deployment URL，不要把 `barrierlens.vercel.app` alias 到它。

## 3. Supabase

Authentication → URL Configuration：

- **Site URL**：`https://barrierlens.vercel.app`
- **Redirect URLs**：`https://barrierlens.vercel.app/**`

## 4. 高德 Key 白名单

[控制台 Key 设置](https://console.amap.com/dev/key) 加入：

- `barrierlens.vercel.app`
- 可删除 `barrierlens-1utx.vercel.app`（停用旧站后）

## 5. 验证

- 首页：https://barrierlens.vercel.app/#tool
- 定位配置（轻量）：https://barrierlens.vercel.app/api/location/config（旧路径 `/api/config/location` 会重写到此）
- 定位健康检查（含探针）：https://barrierlens.vercel.app/api/health/location  
  - `clientGeocodeReady: true` 即可；`serverReverseGeocodeReady` 为 false 可忽略（Vercel 海外访问高德限制）
- 页内点击「使用当前位置」应出现真实路名
- Gemma 4：上传样例图后响应里应是 `analysisSource=gemma`、`mockMode=false`
- 本地 Gemma 4：`npm run verify:ollama` 应通过，页面响应里应是 `analysisSource=ollama`
- Vercel 映射：`npx vercel inspect https://barrierlens.vercel.app --format=json` 应显示 `name: "barrierlens"`、`target: "production"`、`readyState: "READY"`

## 6. 收尾（可选）

- README / 大赛材料只保留 **https://barrierlens.vercel.app/#tool**
- 项目 `barrierlens-26ii`、`barrierlens-xgqi` 等重复项可在 Vercel 删除，避免以后再混

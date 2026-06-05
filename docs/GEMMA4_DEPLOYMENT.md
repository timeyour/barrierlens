# Gemma 4 线上部署（Vercel）

> 在线 Demo（与 README 一致）：https://barrierlens-1utx.vercel.app/#tool

## 1. 部署方式

- 仓库：https://github.com/timeyour/barrierlens
- 平台：Vercel，项目 **`barrierlens`**，Production Branch **`main`**
- **对外 Demo 域名**：`https://barrierlens-1utx.vercel.app`（提交材料只写这一条）
- `barrierlens.vercel.app` 为短别名，与上同源；运维用，不写进大赛材料

部署后页脚会显示 `VERCEL_GIT_COMMIT_SHA` 前 7 位（`src/app/page.tsx`），用于核对 Production 是否与 GitHub 一致。

## 2. 必配环境变量（Production）

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `GEMINI_API_KEY` 或 `GEMMA_API_KEY` | （AI Studio 申请） | 启用真实 Gemma 4 推理 |
| `GEMMA_MODEL_NAME` | `gemma-4-26b-a4b-it` | 模型 ID |
| `GEMMA_API_TIMEOUT_MS` | `55000` | Vercel 冷启动 + 多模态耗时 |
| `GEMMA_API_RETRY_ATTEMPTS` | `2` | 网络类错误重试 |
| `ALLOW_MOCK_FALLBACK` | **`false`** | Gemma 失败时**不**返回 Mock |
| `GEMMA_API_PROXY` | （留空） | Vercel 不需要代理 |
| `OLLAMA_PREFERRED` | `false` | 生产不走本机 Ollama |
| `OLLAMA_ENABLED` | `false` | 生产禁用 Ollama |
| `NEXT_PUBLIC_SITE_URL` | `https://barrierlens-1utx.vercel.app` | 与对外 Demo、Supabase Site URL 一致 |

可选（定位 / 公开池 / 登录，**不阻断主流程**）：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_AMAP_KEY` | 浏览器端逆地理 |
| `AMAP_WEB_KEY` | 服务端探针（海外 Vercel 可能失败） |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | 公开案例池 |
| `NEXT_PUBLIC_AUTH_REQUIRED` | 保持 **`false`** |

完整列表见 `.env.example`。

## 3. 修改环境变量后

Vercel → 项目 **barrierlens** → Settings → Environment Variables → 保存 → **Redeploy** Production。

## 4. 验收清单

### 4.1 Production 与 Git 一致

Vercel → Deployments → Production：

- 状态 **Ready**
- Branch **`main`**
- Commit 与 GitHub 最新 intended commit 一致
- 页脚「构建 xxxxxxx」与 commit 前 7 位一致

### 4.2 Gemma 4 真实推理

1. 打开 https://barrierlens-1utx.vercel.app/#tool
2. 使用样例图或上传照片，填写路名，点击生成
3. 结果 banner 应为 Gemma 4 分析（非「演示数据」）
4. DevTools → Network → `/api/analyze` 响应：
   - `analysisSource: "gemma"`
   - `mockMode: false`

若 Key 缺失或失效：生产应**报错**，而非 silent `mock_fallback`（因 `ALLOW_MOCK_FALLBACK=false`）。

### 4.3 定位（增强功能）

- `/api/location/config` — 轻量配置
- `/api/health/location` — 含高德探针

Key 缺失时用户仍可**手动输入路名**继续分析，不阻断主流程。

## 5. 常见问题

| 现象 | 处理 |
|------|------|
| banner 显示 Mock | 检查 Production 是否配置 `GEMINI_API_KEY` 并已 Redeploy |
| 分析超时 | 增大 `GEMMA_API_TIMEOUT_MS` 至 55000 |
| 定位失败 | 使用正式域名；或手动输入路名 |
| 页脚 commit 与 GitHub 不一致 | 确认 Production 指向 Git 部署，非旧 CLI alias |

## 6. 运维文档

域名与环境迁移细节见 [MIGRATE_VERCEL.md](./MIGRATE_VERCEL.md)（仅供排查，正式材料只用 canonical URL）。

## 7. 相关文档

- 模型来源：[MODEL_PROVENANCE.md](./MODEL_PROVENANCE.md)
- 本地复现：[LOCAL_REPRODUCE.md](./LOCAL_REPRODUCE.md)

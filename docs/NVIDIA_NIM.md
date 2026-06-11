# NVIDIA NIM API（Gemma 4 自拍 / 上传）

线上 Vercel 调 Google Gemma 易因 60s 上限超时。可改用 **NVIDIA NIM** 托管的 Gemma 4（仍是 Gemma，非换模型族）。

## 1. 申请 Key

1. 打开 [build.nvidia.com](https://build.nvidia.com)
2. 登录 → 创建 **API Key**
3. 在模型页选择 **google/gemma-4-31b-it** 或 **google/gemma-4-26b-a4b-it**

## 2. Vercel 环境变量（Production）

| 变量 | 示例值 |
|------|--------|
| `NVIDIA_API_KEY` | （NVIDIA API Key） |
| `NVIDIA_NIM_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_NIM_MODEL` | `google/gemma-4-31b-it`（推荐，较快） |
| `NVIDIA_NIM_TIMEOUT_MS` | `55000` |
| `NVIDIA_NIM_PREFERRED` | **`true`**（自拍优先走 NVIDIA） |

保留原有 `GEMINI_API_KEY` 作回退；样例图仍走 `productionDemoCache`，不受影响。

**不要**在 Vercel 配置 `GEMMA_API_PROXY`。

保存 → **Redeploy**。

## 3. 本地 `.env.local`

```env
NVIDIA_API_KEY=你的Key
NVIDIA_NIM_PREFERRED=true
NVIDIA_NIM_MODEL=google/gemma-4-31b-it
```

```bash
node --env-file=.env.local -e "
  const k=process.env.NVIDIA_API_KEY;
  fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
    method:'POST',
    headers:{Authorization:'Bearer '+k,'Content-Type':'application/json'},
    body:JSON.stringify({model:'google/gemma-4-31b-it',messages:[{role:'user',content:'hi'}],max_tokens:16})
  }).then(r=>r.text()).then(console.log);
"
```

## 4. 验收

上传自拍 → Network `/api/analyze`：

- `analysisSource: "nvidia_nim"`
- `modelName: "google/gemma-4-31b-it"`
- banner 绿色：`analysisSource=nvidia_nim`

## 5. 大赛材料怎么写

- **主链路**：Google Gemini API + `gemma-4-26b-a4b-it`（官方 Hackathon 路径）
- **增强 / 自拍**：NVIDIA NIM 托管同一 Gemma 4 家族，解决 Serverless 超时
- 代码：`src/lib/nvidiaNim.ts` → `src/lib/gemma.ts` 调度

## 6. 相关文档

- [NVIDIA Gemma 4 NIM API](https://docs.nvidia.com/nim/vision-language-models/latest/examples/gemma-4-31b-it/api.html)
- [GEMMA4_DEPLOYMENT.md](./GEMMA4_DEPLOYMENT.md)

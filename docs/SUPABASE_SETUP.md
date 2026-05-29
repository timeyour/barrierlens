# Supabase 快速配置（今日 Demo）

## 1. 创建项目

1. 打开 [supabase.com](https://supabase.com) 新建项目
2. 等待数据库就绪

## 2. 执行 SQL

Dashboard → **SQL Editor** → 粘贴 [supabase-setup.sql](./supabase-setup.sql) → Run

## 3. 创建 Storage

Dashboard → **Storage** → New bucket

- Name: `report-images`
- **Public bucket**: 开启（Demo 缩略图公开读）

## 4. 环境变量

本地 `.env.local` 与 Vercel 项目 Settings → Environment Variables：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Settings → API → service_role（勿提交到 Git）
```

可选国内静态地图：

```env
NEXT_PUBLIC_AMAP_KEY=你的高德 Web 服务 Key
```

## 5. 验证

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
| 已配置 | ✅ 正常 | ✅ 自动同步 |

云端同步失败不会阻断分析；本机归档始终优先。

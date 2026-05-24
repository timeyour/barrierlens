# Gemini 生成 UI 素材放置说明

将 Gemini 生成的图片保存为以下文件名，放入此目录即可自动渲染：

| 文件名 | 用途 | 建议尺寸 |
|--------|------|----------|
| hero-bg.jpg | Hero 全屏背景 | 1920×1080 (16:9) |
| scene-clear.jpg | 叠加动效·后景（畅通） | 1200×900 (4:3) |
| scene-blocked.jpg | 叠加动效·前景（占用） | 1200×900 (4:3) |
| mobile-ui.jpg | 可选·移动端 UI mockup | 1080×1920 (9:16) |

提示词见：src/config/uiAssets.ts 中的 GEMINI_PROMPTS

若 JPG 不存在，网站会自动回退到 SVG 占位图。

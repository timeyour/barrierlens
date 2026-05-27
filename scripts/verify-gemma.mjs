#!/usr/bin/env node
/**
 * Gemma 4 接入自检：环境变量 → 网络 → 文本 API →（可选）多模态 API
 * 用法：node --env-file=.env.local scripts/verify-gemma.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEST_IMAGE = path.join(ROOT, "public/images/scene-blocked-close.png");

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY;
const modelName = process.env.GEMMA_MODEL_NAME || "gemma-4-26b-a4b-it";
const timeoutMs = Number(process.env.GEMMA_API_TIMEOUT_MS || 30000);

function section(title) {
  console.log(`\n${"─".repeat(50)}`);
  console.log(title);
  console.log("─".repeat(50));
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function fail(msg) {
  console.log(`❌ ${msg}`);
}

function warn(msg) {
  console.log(`⚠️  ${msg}`);
}

section("1. 环境变量");
if (apiKey?.trim()) {
  ok(`GEMINI_API_KEY / GEMMA_API_KEY 已配置（${apiKey.trim().length} 字符）`);
} else {
  fail("未配置 GEMINI_API_KEY 或 GEMMA_API_KEY → 线上/本地都会走 Mock");
  process.exit(1);
}
ok(`模型: ${modelName}`);
ok(`超时: ${timeoutMs}ms`);

section("2. 网络连通性（Google Generative Language API）");
process.stdout.write("   正在连接 generativelanguage.googleapis.com（最多 12s）… ");
try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  const res = await fetch("https://generativelanguage.googleapis.com/", {
    signal: controller.signal,
  });
  clearTimeout(timer);
  console.log("完成");
  ok(`可访问 generativelanguage.googleapis.com（HTTP ${res.status}）`);
} catch (error) {
  console.log("失败");
  fail("无法连接 Google API（Connect Timeout / 被墙 / 无代理）");
  console.log(
    `   ${error instanceof Error ? error.message : String(error)}`,
  );
  warn("在中国大陆通常需要稳定国际网络或代理，否则 Key 正确也会 mock_fallback");
  warn("Vercel 海外节点一般可直接访问；请优先在 Vercel 部署环境验证");
}

section("3. 文本 API 冒烟");
process.stdout.write(`   正在调用 ${modelName}（最多 ${timeoutMs / 1000}s）… `);
try {
  const ai = new GoogleGenAI({ apiKey });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const response = await ai.models.generateContent({
    model: modelName,
    contents: "用一句话说明盲道被占用为什么影响无障碍通行。只输出一句中文。",
    config: { abortSignal: controller.signal },
  });
  clearTimeout(timer);
  const text = response.text?.trim();
  console.log("完成");
  if (!text) {
    fail("API 返回空内容");
  } else {
    ok("文本 API 成功");
    console.log(`   回复: ${text.slice(0, 120)}${text.length > 120 ? "…" : ""}`);
  }
} catch (error) {
  console.log("失败");
  const msg = error instanceof Error ? error.message : String(error);
  if (/404|not found|model/i.test(msg)) {
    fail(`模型不可用或名称错误: ${modelName}`);
    warn("到 Google AI Studio 确认 Gemma 4 模型 ID 是否与 Hackathon 文档一致");
  } else if (/401|403|API key|permission/i.test(msg)) {
    fail("Key 无效或无权限");
  } else if (/abort|timeout/i.test(msg)) {
    fail(`请求超时（>${timeoutMs}ms）`);
  } else {
    fail(`文本 API 失败: ${msg}`);
  }
}

section("4. 多模态 API（图片 + JSON Prompt）");
if (!fs.existsSync(TEST_IMAGE)) {
  warn(`跳过：测试图不存在 ${TEST_IMAGE}`);
} else {
  process.stdout.write(`   正在调用多模态 ${modelName}（最多 ${timeoutMs / 1000}s）… `);
  try {
    const buffer = fs.readFileSync(TEST_IMAGE);
    const b64 = buffer.toString("base64");
    const ai = new GoogleGenAI({ apiKey });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: '分析这张无障碍现场照片，只输出 JSON：{"has_issue":true,"risk_level":"medium"}',
            },
            { inlineData: { mimeType: "image/png", data: b64 } },
          ],
        },
      ],
      config: { abortSignal: controller.signal },
    });
    clearTimeout(timer);
    const text = response.text?.trim();
    console.log("完成");
    if (!text) {
      fail("多模态 API 返回空内容");
    } else if (!text.includes("{")) {
      warn("多模态有响应，但未返回 JSON 形态（项目内会做解析/降级）");
      console.log(`   片段: ${text.slice(0, 160)}…`);
    } else {
      ok("多模态 API 成功（与 /api/analyze 同路径）");
      console.log(`   片段: ${text.slice(0, 160)}…`);
    }
  } catch (error) {
    console.log("失败");
    fail(`多模态 API 失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

section("5. 结论");
console.log(`
本地 Key 已配置。若步骤 2/3 失败而 Vercel 成功 → 本地网络问题，不影响线上 Demo。
若步骤 3/4 报 401/404 → 检查 Key 或模型名。
全绿 → Gemma 4 接入可用，站点应显示 analysisSource=gemma。
`);

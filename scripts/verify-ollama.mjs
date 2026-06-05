#!/usr/bin/env node
/**
 * 本地 Ollama Gemma 4 自检
 * 用法：node --env-file=.env.local scripts/verify-ollama.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEST_IMAGE = path.join(ROOT, "public/images/scene-blocked-close.png");

const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const model = process.env.OLLAMA_MODEL || "gemma4:latest";
const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 120000);

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

section("1. Ollama 服务");
process.stdout.write(`   连接 ${baseUrl}/api/tags … `);
try {
  const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  console.log("完成");
  ok(`Ollama 在线，已安装 ${json.models?.length ?? 0} 个模型`);
  const names = (json.models ?? []).map((m) => m.name).join(", ");
  if (names) console.log(`   模型: ${names}`);
} catch (error) {
  console.log("失败");
  fail(`无法连接 Ollama：${error instanceof Error ? error.message : String(error)}`);
  console.log("   请先运行：ollama serve  或打开 Ollama App");
  process.exit(1);
}

section("2. 多模态冒烟");
if (!fs.existsSync(TEST_IMAGE)) {
  fail(`测试图不存在：${TEST_IMAGE}`);
  process.exit(1);
}

process.stdout.write(`   调用 ${model}（最多 ${timeoutMs / 1000}s，首次较慢）… `);
const buffer = fs.readFileSync(TEST_IMAGE);
const b64 = buffer.toString("base64");

try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      think: false,
      messages: [
        {
          role: "user",
          content:
            '分析无障碍现场照片，只输出 JSON：{"has_issue":true,"issue_type":"测试","risk_level":"medium"}',
          images: [b64],
        },
      ],
      options: { temperature: 0.2, num_predict: 256 },
    }),
    signal: controller.signal,
  });
  clearTimeout(timer);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  const json = JSON.parse(text);
  const content = (json.message?.content || "").trim();
  console.log("完成");
  if (content.includes("{")) {
    ok("Ollama 多模态可用，barrierlens 会在 Google 失败时自动走 Ollama");
    console.log(`   片段: ${content.slice(0, 120)}…`);
  } else {
    fail("有响应但未返回 JSON");
    console.log(`   片段: ${text.slice(0, 240)}…`);
  }
} catch (error) {
  console.log("失败");
  fail(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

section("3. 建议");
console.log(`
本地开发可在 .env.local 添加：
  OLLAMA_PREFERRED=true
这样跳过 Google API 等待，直接走本机 gemma4:latest。
`);

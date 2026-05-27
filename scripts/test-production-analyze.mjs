#!/usr/bin/env node
/**
 * 测试线上 /api/analyze 是否走真实 Gemma
 * 用法：npm run test:production
 * 可选：TEST_BASE_URL=https://xxx.vercel.app npm run test:production
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.TEST_BASE_URL ?? "https://barrierlens.vercel.app";
const IMAGE = path.join(ROOT, "public/images/scene-blocked-close.png");

function printNetworkHelp() {
  console.log(`
这通常表示本机访问不了 Vercel（DNS 能解析但 TCP 443 超时），与 Gemma Key 无关。

请先确认：
  1. Safari/Chrome 能否打开 ${BASE} ？
  2. 若浏览器能开、终端不能 → 用浏览器测（见下），不必纠结 test:production
  3. 若浏览器也不能 → 换网络/VPN，或手机热点再试

浏览器验证 Gemma（推荐）：
  打开站点 → 上传照片 → 生成 → F12 → Network → analyze
  看 analysisSource 是否为 "gemma"

终端备用（强制 IPv4）：
  curl -4 --max-time 90 -X POST ${BASE}/api/analyze \\
    -F "image=@public/images/scene-blocked-close.png" \\
    -F "targetDepartment=物业" -F "recordMode=public" | head -c 400
`);
}

function reportBody(body, elapsed, via) {
  console.log(`\n（通过 ${via}，耗时 ${elapsed}ms）`);
  console.log("analysisSource:", body.analysisSource);
  console.log("mockMode:", body.mockMode);
  console.log("modelName:", body.modelName);
  console.log("analysisTimeMs:", body.analysisTimeMs);
  if (body.fallbackReason) console.log("fallbackReason:", body.fallbackReason);
  console.log("issueType:", body.issueType);

  if (body.analysisSource === "gemma" && !body.mockMode) {
    console.log("\n✅ 线上 Gemma 4 可用");
    process.exit(0);
  }
  console.log("\n❌ 已连上站点，但未走真实模型（见 fallbackReason）");
  process.exit(1);
}

if (!fs.existsSync(IMAGE)) {
  console.error("缺少测试图:", IMAGE);
  process.exit(1);
}

console.log("目标:", BASE);
console.log("正在 POST /api/analyze（可能需 10–30s）…");

const started = performance.now();

async function tryFetch() {
  const buffer = fs.readFileSync(IMAGE);
  const blob = new Blob([buffer], { type: "image/png" });
  const form = new FormData();
  form.append("image", blob, "scene-blocked-close.png");
  form.append("targetDepartment", "物业");
  form.append("recordMode", "public");
  form.append("location", "线上 API 测试");

  const res = await fetch(`${BASE}/api/analyze`, { method: "POST", body: form });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

function tryCurl() {
  const out = execFileSync(
    "curl",
    [
      "-4",
      "-sS",
      "--max-time",
      "90",
      "-X",
      "POST",
      `${BASE}/api/analyze`,
      "-F",
      `image=@${IMAGE}`,
      "-F",
      "targetDepartment=物业",
      "-F",
      "recordMode=public",
      "-F",
      "location=线上API测试",
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  return JSON.parse(out);
}

try {
  const body = await tryFetch();
  reportBody(body, Math.round(performance.now() - started), "fetch");
} catch (fetchError) {
  console.warn(
    "\n⚠️  fetch 失败:",
    fetchError instanceof Error ? fetchError.message : fetchError,
  );
  console.log("尝试 curl -4 …");
  try {
    const body = tryCurl();
    reportBody(body, Math.round(performance.now() - started), "curl -4");
  } catch (curlError) {
    console.error(
      "\n❌ curl 也失败:",
      curlError instanceof Error ? curlError.message : curlError,
    );
    printNetworkHelp();
    process.exit(1);
  }
}

#!/usr/bin/env node
/**
 * 本地验证 Supabase 云端公开所需配置（读取 .env.local）
 * 用法: node scripts/verify-supabase-cloud.mjs
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    env[t.slice(0, i)] = t.slice(i + 1);
  }
  return env;
}

const env = loadEnv(".env.local");
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY（.env.local）");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
if (bucketError) {
  console.error("Storage 失败:", bucketError.message);
  process.exit(1);
}

const bucket = buckets?.find((b) => b.id === "report-images");
console.log("report-images:", bucket ? (bucket.public ? "存在 (public)" : "存在 (private)") : "缺失");

const { error: dbError } = await supabase.from("reports").select("review_token").limit(1);
console.log("reports 表:", dbError ? `失败 ${dbError.message}` : "可读");

const tiny = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=",
  "base64",
);
const testPath = `verify-${Date.now()}.jpg`;
const { error: upError } = await supabase.storage
  .from("report-images")
  .upload(testPath, tiny, { contentType: "image/jpeg" });
console.log("Storage 上传:", upError ? `失败 ${upError.message}` : "成功");
if (!upError) await supabase.storage.from("report-images").remove([testPath]);

if (!bucket || dbError || upError) process.exit(1);
console.log("Supabase 云端公开链路正常。");

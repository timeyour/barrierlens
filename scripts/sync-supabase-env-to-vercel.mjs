#!/usr/bin/env node
/**
 * 将 .env.local 中的 Supabase 变量同步到 Vercel 项目 barrierlens（Production）。
 * 前置：npx vercel login
 * 用法：node scripts/sync-supabase-env-to-vercel.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROJECT = "barrierlens";
const TEAM_SLUG = "timeyours-projects";
const SITE_URL = "https://barrierlens.vercel.app";
const TARGET = ["production"];

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

function loadEnvFile(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[t.slice(0, i)] = v;
  }
  return env;
}

function loadToken() {
  const candidates = [
    path.join(
      os.homedir(),
      "Library/Application Support/com.vercel.cli/auth.json",
    ),
    path.join(os.homedir(), ".vercel/auth.json"),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const token = raw.token ?? raw.credentials?.[0]?.token;
    if (token) return token;
  }
  throw new Error("未找到 Vercel 登录。请先运行: npx vercel login");
}

async function api(token, pathname, options = {}) {
  const res = await fetch(`https://api.vercel.com${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${pathname}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function upsertEnv(token, projectId, key, value) {
  const listed = await api(
    token,
    `/v10/projects/${projectId}/env?teamId=${TEAM_SLUG}`,
  );
  const envs = listed.envs ?? listed;
  for (const entry of envs) {
    if (entry.key !== key) continue;
    const overlap = (entry.target ?? []).some((t) => TARGET.includes(t));
    if (overlap && entry.id) {
      await api(
        token,
        `/v10/projects/${projectId}/env/${entry.id}?teamId=${TEAM_SLUG}`,
        { method: "DELETE" },
      );
    }
  }
  await api(token, `/v10/projects/${projectId}/env?teamId=${TEAM_SLUG}`, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: key.includes("SERVICE_ROLE") ? "sensitive" : "encrypted",
      target: TARGET,
    }),
  });
}

async function redeployProduction(token, project) {
  const link = project.link;
  if (!link?.type || link.type !== "github") {
    console.warn("未找到 GitHub 链接，请手动在 Vercel Dashboard Redeploy。");
    return;
  }
  await api(token, `/v13/deployments?teamId=${TEAM_SLUG}`, {
    method: "POST",
    body: JSON.stringify({
      name: PROJECT,
      project: project.id,
      target: "production",
      gitSource: {
        type: "github",
        ref: link.productionBranch || "main",
        repoId: link.repoId,
      },
    }),
  });
  console.log("已触发 Production 重新部署。");
}

function validate(values) {
  const url = values.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const service = values.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!url || !url.includes(".supabase.co")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 无效，请检查 .env.local");
  }
  if (!service.startsWith("eyJ") || service.length < 100) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 应为完整 JWT（eyJ...，约 200 字符）。请从 Supabase → API → service_role 复制到 .env.local",
    );
  }
  const anon = values.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!anon) {
    console.warn(
      "警告: .env.local 缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY，将跳过（云端公开不依赖它，登录功能需要）。",
    );
  }
}

async function main() {
  const local = loadEnvFile(".env.local");
  const values = {
    NEXT_PUBLIC_SUPABASE_URL: local.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: local.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
    SUPABASE_SERVICE_ROLE_KEY: local.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    NEXT_PUBLIC_SITE_URL: SITE_URL,
  };

  validate(values);

  const token = loadToken();
  const project = await api(
    token,
    `/v9/projects/${PROJECT}?teamId=${TEAM_SLUG}`,
  );

  for (const key of KEYS) {
    const value = values[key];
    if (!value) continue;
    await upsertEnv(token, project.id, key, value);
    console.log(`✓ ${key} → Production (len=${value.length})`);
  }

  await redeployProduction(token, project);
  console.log(
    `\n完成。约 1–2 分钟后打开 ${SITE_URL}/api/health/cloud 应看到 ok: true`,
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

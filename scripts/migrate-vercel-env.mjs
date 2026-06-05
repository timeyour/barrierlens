#!/usr/bin/env node
/**
 * Copy Production/Preview env vars from barrierlens-1utx → barrierlens.
 * Requires: logged-in Vercel CLI (~/.vercel or Application Support auth.json).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SOURCE = "barrierlens-1utx";
const TARGET = "barrierlens";
const TEAM_SLUG = "timeyours-projects";
const SITE_URL = "https://barrierlens.vercel.app";

const SKIP_KEYS = new Set([
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_TARGET_ENV",
  "VERCEL_OIDC_TOKEN",
  "VERCEL_GIT_COMMIT_AUTHOR_LOGIN",
  "VERCEL_GIT_COMMIT_AUTHOR_NAME",
  "VERCEL_GIT_COMMIT_MESSAGE",
  "VERCEL_GIT_COMMIT_REF",
  "VERCEL_GIT_COMMIT_SHA",
  "VERCEL_GIT_PREVIOUS_SHA",
  "VERCEL_GIT_PROVIDER",
  "VERCEL_GIT_PULL_REQUEST_ID",
  "VERCEL_GIT_REPO_ID",
  "VERCEL_GIT_REPO_OWNER",
  "VERCEL_GIT_REPO_SLUG",
  "NX_DAEMON",
  "TURBO_CACHE",
  "TURBO_DOWNLOAD_LOCAL_ENABLED",
  "TURBO_REMOTE_ONLY",
  "TURBO_RUN_SUMMARY",
]);

function loadToken() {
  const candidates = [
    path.join(os.homedir(), "Library/Application Support/com.vercel.cli/auth.json"),
    path.join(os.homedir(), ".vercel/auth.json"),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const token = raw.token ?? raw.credentials?.[0]?.token;
    if (token) return token;
  }
  throw new Error("未找到 Vercel CLI 登录 token，请先运行: npx vercel login");
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

async function getProject(token, name) {
  return api(token, `/v9/projects/${name}?teamId=${TEAM_SLUG}`);
}

async function listEnv(token, projectId) {
  const out = await api(
    token,
    `/v10/projects/${projectId}/env?decrypt=true&teamId=${TEAM_SLUG}`,
  );
  return out.envs ?? out;
}

async function createEnv(token, projectId, entry) {
  const payload = {
    key: entry.key,
    value: entry.value,
    type: entry.type ?? "encrypted",
    target: entry.target,
  };
  if (entry.gitBranch) payload.gitBranch = entry.gitBranch;
  return api(token, `/v10/projects/${projectId}/env?teamId=${TEAM_SLUG}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function removeEnv(token, projectId, envId) {
  return api(
    token,
    `/v10/projects/${projectId}/env/${envId}?teamId=${TEAM_SLUG}`,
    { method: "DELETE" },
  );
}

async function main() {
  const token = loadToken();
  const [src, tgt] = await Promise.all([
    getProject(token, SOURCE),
    getProject(token, TARGET),
  ]);

  const srcEnvs = await listEnv(token, src.id);
  const tgtEnvs = await listEnv(token, tgt.id);

  const tgtByKeyTarget = new Map(
    tgtEnvs.map((e) => [`${e.key}::${(e.target ?? []).join(",")}`, e]),
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of srcEnvs) {
    if (SKIP_KEYS.has(entry.key)) {
      skipped += 1;
      continue;
    }
    const targets = entry.target ?? ["production"];
    if (!targets.some((t) => t === "production" || t === "preview")) {
      skipped += 1;
      continue;
    }

    let value = entry.value ?? "";
    if (entry.key === "NEXT_PUBLIC_SITE_URL") {
      value = SITE_URL;
    }
    if (!value || String(value).length < 1) {
      console.warn(`skip ${entry.key}: empty value (sensitive 变量无法导出)`);
      skipped += 1;
      continue;
    }

    const mapKey = `${entry.key}::${targets.join(",")}`;
    const existing = tgtByKeyTarget.get(mapKey);

    if (existing?.id) {
      await removeEnv(token, tgt.id, existing.id);
      updated += 1;
    }

    await createEnv(token, tgt.id, {
      key: entry.key,
      value,
      type: entry.type === "sensitive" ? "sensitive" : "encrypted",
      target: targets,
      gitBranch: entry.gitBranch,
    });
    console.log(`+ ${entry.key} → ${targets.join(",")}`);
    created += 1;
  }

  console.log(
    `\n完成: 写入 ${created} 项（替换 ${updated}），跳过 ${skipped}。请在 Vercel 对 ${TARGET} Redeploy。`,
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

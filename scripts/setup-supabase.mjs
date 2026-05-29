#!/usr/bin/env node
/**
 * 一键初始化 Supabase 项目（BarrierLens 公开上报池）
 *
 * 用法:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/setup-supabase.mjs
 *   node scripts/setup-supabase.mjs --project-ref existing-ref   # 仅初始化已有项目
 *
 * Token 获取: https://supabase.com/dashboard/account/tokens
 */

import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SQL_PATH = join(ROOT, "docs/supabase-setup.sql");
const ENV_LOCAL = join(ROOT, ".env.local");

const API = "https://api.supabase.com/v1";
const PROJECT_NAME = "barrierlens";
const REGION = "ap-southeast-1";
const BUCKET = "report-images";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const urlArg = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : null;
const serviceKeyArg = process.argv.includes("--service-key")
  ? process.argv[process.argv.indexOf("--service-key") + 1]
  : null;
const projectRefArg = process.argv.includes("--project-ref")
  ? process.argv[process.argv.indexOf("--project-ref") + 1]
  : null;

if (!token && !projectRefArg && !(urlArg && serviceKeyArg)) {
  console.error(`
缺少凭证。任选一种方式:

A) 全自动（推荐）— 需要 Access Token:
   1. 打开 https://supabase.com/dashboard/account/tokens 创建 Token
   2. 运行:
      SUPABASE_ACCESS_TOKEN=sbp_xxx npm run setup:supabase

B) 已有项目 — 仅需 URL + service_role（SQL 已在 Dashboard 执行过）:
   npm run setup:supabase -- --url https://xxxx.supabase.co --service-key eyJ...
`);
  process.exit(1);
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    throw new Error(
      `API ${path} failed (${response.status}): ${typeof data === "object" ? JSON.stringify(data) : data}`,
    );
  }
  return data;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listOrganizations() {
  return api("/organizations");
}

async function listProjects() {
  return api("/projects");
}

async function createProject(orgId, dbPass) {
  return api("/projects", {
    method: "POST",
    body: JSON.stringify({
      organization_id: orgId,
      name: PROJECT_NAME,
      region: REGION,
      db_pass: dbPass,
    }),
  });
}

async function waitForProject(ref, maxMinutes = 8) {
  const deadline = Date.now() + maxMinutes * 60_000;
  while (Date.now() < deadline) {
    const project = await api(`/projects/${ref}`);
    const status = project.status;
    process.stdout.write(`\r  项目状态: ${status}   `);
    if (status === "ACTIVE_HEALTHY") {
      console.log("\n  项目已就绪");
      return project;
    }
    if (status === "INACTIVE" || status === "REMOVED") {
      throw new Error(`项目创建失败，状态: ${status}`);
    }
    await sleep(10_000);
  }
  throw new Error("等待项目就绪超时，请稍后在 Dashboard 确认后重跑 --project-ref");
}

async function getApiKeys(ref) {
  const keys = await api(`/projects/${ref}/api-keys`);
  const serviceRole = keys.find((k) => k.name === "service_role");
  const anon = keys.find((k) => k.name === "anon");
  if (!serviceRole?.api_key) {
    throw new Error("未获取到 service_role key");
  }
  return {
    serviceRoleKey: serviceRole.api_key,
    anonKey: anon?.api_key ?? "",
    url: `https://${ref}.supabase.co`,
  };
}

async function runSql(ref, query) {
  return api(`/projects/${ref}/database/query`, {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

function stripSqlComments(sql) {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();
}

async function setupSchema(ref) {
  const baseSql = readFileSync(SQL_PATH, "utf8");
  const storageSql = `
insert into storage.buckets (id, name, public)
values ('${BUCKET}', '${BUCKET}', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read report images" on storage.objects;
create policy "Public read report images"
  on storage.objects for select
  using (bucket_id = '${BUCKET}');
`;

  const statements = [...baseSql.split(";"), ...storageSql.split(";")]
    .map((s) => stripSqlComments(s))
    .filter(Boolean);

  for (const statement of statements) {
    const preview = statement.replace(/\s+/g, " ").slice(0, 60);
    process.stdout.write(`  SQL: ${preview}… `);
    try {
      await runSql(ref, `${statement};`);
      console.log("OK");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("already exists") || message.includes("duplicate")) {
        console.log("跳过（已存在）");
      } else {
        console.log("失败");
        throw error;
      }
    }
  }
}

async function verifyBucket(url, serviceRoleKey) {
  const response = await fetch(`${url}/storage/v1/bucket`, {
    headers: { Authorization: `Bearer ${serviceRoleKey}` },
  });
  if (!response.ok) {
    throw new Error(`Storage 验证失败: ${response.status}`);
  }
  const buckets = await response.json();
  const found = buckets.some((b) => b.name === BUCKET || b.id === BUCKET);
  if (!found) {
    const create = await fetch(`${url}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: BUCKET, public: true }),
    });
    if (!create.ok) {
      const err = await create.text();
      throw new Error(`创建 bucket 失败: ${err}`);
    }
    console.log(`  Storage bucket "${BUCKET}" 已创建`);
  } else {
    console.log(`  Storage bucket "${BUCKET}" 已存在`);
  }
}

function upsertEnvLocal(url, serviceRoleKey) {
  const lines = existsSync(ENV_LOCAL)
    ? readFileSync(ENV_LOCAL, "utf8").split("\n")
    : [];

  const map = new Map();
  for (const line of lines) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    map.set(line.slice(0, idx), line.slice(idx + 1));
  }

  map.set("NEXT_PUBLIC_SUPABASE_URL", url);
  map.set("SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey);

  const geminiOrder = [
    "GEMINI_API_KEY",
    "GEMMA_API_KEY",
    "GEMMA_MODEL_NAME",
    "GEMMA_API_TIMEOUT_MS",
    "GEMMA_API_RETRY_ATTEMPTS",
    "GEMMA_API_PROXY",
    "NEXT_PUBLIC_V2_ENABLED",
    "NEXT_PUBLIC_V2_BARRIER_MAP_ENABLED",
    "NEXT_PUBLIC_V2_REVIEW_FLOW_ENABLED",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_AMAP_KEY",
  ];

  const written = new Set();
  const output = [];

  for (const key of geminiOrder) {
    if (map.has(key)) {
      output.push(`${key}=${map.get(key)}`);
      written.add(key);
    }
  }
  for (const [key, value] of map) {
    if (!written.has(key)) output.push(`${key}=${value}`);
  }

  writeFileSync(ENV_LOCAL, `${output.join("\n")}\n`, "utf8");
  console.log(`\n  已写入 ${ENV_LOCAL}`);
}

async function resolveProjectRef() {
  if (projectRefArg) return projectRefArg;

  const projects = await listProjects();
  const existing = projects.find(
    (p) => p.name === PROJECT_NAME || p.ref?.includes("barrierlens"),
  );
  if (existing?.ref) {
    console.log(`\n发现已有项目: ${existing.name} (${existing.ref})`);
    return existing.ref;
  }

  const orgs = await listOrganizations();
  if (!orgs.length) {
    throw new Error("账号下没有 Organization，请先在 Supabase Dashboard 创建");
  }

  const orgId = orgs[0].id;
  const dbPass = randomBytes(16).toString("base64url");
  console.log(`\n在组织 "${orgs[0].name}" 创建项目 ${PROJECT_NAME} (${REGION})…`);
  const created = await createProject(orgId, dbPass);
  console.log(`  项目 ref: ${created.ref}`);
  console.log(`  数据库密码（请保存）: ${dbPass}`);
  await waitForProject(created.ref);
  return created.ref;
}

async function main() {
  console.log("无碍 BarrierLens · Supabase 部署脚本\n");

  if (urlArg && serviceKeyArg) {
    console.log("使用已有项目凭据…");
    await verifyBucket(urlArg, serviceKeyArg);
    upsertEnvLocal(urlArg, serviceKeyArg);
    const ref = urlArg.replace("https://", "").split(".")[0];
    printDone(urlArg, ref);
    return;
  }

  const ref = await resolveProjectRef();
  console.log(`\n初始化 schema (${ref})…`);
  await setupSchema(ref);

  console.log("\n获取 API Keys…");
  const { url, serviceRoleKey } = await getApiKeys(ref);
  console.log(`  URL: ${url}`);

  console.log("\n验证 Storage…");
  await verifyBucket(url, serviceRoleKey);

  upsertEnvLocal(url, serviceRoleKey);
  printDone(url, ref);
}

function printDone(url, ref) {
  console.log(`
部署完成。

本地验证:
  npm run dev
  # 提交一条上报后访问 /reports

Vercel 环境变量（Dashboard → Settings → Environment Variables）:
  NEXT_PUBLIC_SUPABASE_URL=${url}
  SUPABASE_SERVICE_ROLE_KEY=<见 .env.local>

项目 Dashboard:
  https://supabase.com/dashboard/project/${ref}
`);
}

main().catch((error) => {
  console.error("\n部署失败:", error.message ?? error);
  process.exit(1);
});

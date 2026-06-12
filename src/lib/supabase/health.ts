import { getSupabaseAdmin, isSupabaseConfigured } from "./admin";

const IMAGE_BUCKET = "report-images";

function jwtPayloadRole(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function validateSupabaseUrl(url: string): {
  valid: boolean;
  length: number;
  host: string | null;
  hint?: string;
} {
  if (!url) {
    return { valid: false, length: 0, host: null, hint: "NEXT_PUBLIC_SUPABASE_URL 为空" };
  }
  try {
    const parsed = new URL(url);
    const host = parsed.host;
    if (parsed.protocol !== "https:") {
      return {
        valid: false,
        length: url.length,
        host,
        hint: "NEXT_PUBLIC_SUPABASE_URL 必须以 https:// 开头",
      };
    }
    if (!host.endsWith(".supabase.co")) {
      return {
        valid: false,
        length: url.length,
        host,
        hint: "NEXT_PUBLIC_SUPABASE_URL 应类似 xxx.supabase.co（Supabase → Settings → API → Project URL），不要用 Dashboard 链接",
      };
    }
    if (parsed.pathname && parsed.pathname !== "/") {
      return {
        valid: false,
        length: url.length,
        host,
        hint: "NEXT_PUBLIC_SUPABASE_URL 不要带 /rest 等路径，只填 Project URL",
      };
    }
    return { valid: true, length: url.length, host };
  } catch {
    return {
      valid: false,
      length: url.length,
      host: null,
      hint: "NEXT_PUBLIC_SUPABASE_URL 不是合法 URL",
    };
  }
}

export type SupabaseCloudHealth = {
  supabaseConfigured: boolean;
  hasUrl: boolean;
  hasServiceKey: boolean;
  supabaseUrlLength: number;
  supabaseUrlHost: string | null;
  supabaseUrlValid: boolean;
  /** 仅长度，不暴露密钥内容；0=未注入，200+=正常 JWT */
  serviceKeyLength: number;
  serviceKeyRole: string | null;
  storageBucketReady: boolean;
  databaseReadable: boolean;
  vercelEnv: string | null;
  ok: boolean;
  error?: string;
  hint?: string;
};

function notConfiguredHint(serviceKeyLength: number): string {
  if (serviceKeyLength === 0) {
    return "SUPABASE_SERVICE_ROLE_KEY 在生产环境未注入。请在 Vercel 项目 barrierlens → Settings → Environment Variables 添加该变量（勾选 Production），保存后 Deployments → Redeploy。";
  }
  if (serviceKeyLength <= 20) {
    return `SUPABASE_SERVICE_ROLE_KEY 过短（当前 ${serviceKeyLength} 字符）。请从 Supabase → Settings → API → service_role 复制完整 JWT（通常 200+ 字符），不要只粘贴一小段。`;
  }
  return "在 Vercel 项目 barrierlens 的 Production 环境配置 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY，然后 Redeploy。";
}

export async function checkSupabaseCloudHealth(): Promise<SupabaseCloudHealth> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const urlCheck = validateSupabaseUrl(url);
  const serviceKeyRole = key.startsWith("eyJ") ? jwtPayloadRole(key) : null;
  const base: SupabaseCloudHealth = {
    supabaseConfigured: isSupabaseConfigured(),
    hasUrl: url.length > 0,
    hasServiceKey: key.length > 20,
    supabaseUrlLength: urlCheck.length,
    supabaseUrlHost: urlCheck.host,
    supabaseUrlValid: urlCheck.valid,
    serviceKeyLength: key.length,
    serviceKeyRole,
    storageBucketReady: false,
    databaseReadable: false,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    ok: false,
  };

  if (!base.supabaseConfigured) {
    return {
      ...base,
      error: "not_configured",
      hint: notConfiguredHint(key.length),
    };
  }

  if (!urlCheck.valid) {
    return {
      ...base,
      error: "invalid_supabase_url",
      hint: urlCheck.hint,
    };
  }

  if (key.startsWith("eyJ") && serviceKeyRole && serviceKeyRole !== "service_role") {
    return {
      ...base,
      error: "wrong_service_key",
      hint: `SUPABASE_SERVICE_ROLE_KEY 当前是 ${serviceKeyRole} 密钥，请改用 Supabase → Settings → API → service_role（不是 anon public）。`,
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ...base,
      error: "client_unavailable",
      hint: "Supabase 客户端初始化失败，请检查环境变量是否含换行或引号。",
    };
  }

  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    const hint = bucketError.message.includes("Invalid path specified in request URL")
      ? "NEXT_PUBLIC_SUPABASE_URL 与密钥不匹配或 URL 填错。请改为 Supabase → Settings → API → Project URL（如 https://jukukfaykvltqbxlipnj.supabase.co），并与 service_role 来自同一项目。"
      : bucketError.message.includes("Invalid API key")
        ? "SUPABASE_SERVICE_ROLE_KEY 无效或与 URL 不匹配。请从同一 Supabase 项目重新复制 service_role（本地 .env.local 里 219 字符的 eyJ... 已验证可用）。"
        : bucketError.message;
    return {
      ...base,
      error: "storage_list_failed",
      hint,
    };
  }

  const bucket = buckets?.find((item) => item.id === IMAGE_BUCKET);
  if (!bucket) {
    return {
      ...base,
      error: "storage_bucket_missing",
      hint: "请在 Supabase Storage 创建桶 report-images（Public 可关）。",
    };
  }

  base.storageBucketReady = true;

  const { error: dbError } = await supabase
    .from("reports")
    .select("id")
    .limit(1);

  if (dbError) {
    const hint = dbError.message.includes("review_token")
      ? "请在 Supabase SQL Editor 执行 docs/supabase-setup.sql（含 review_token 字段）。"
      : dbError.message.includes("relation") && dbError.message.includes("reports")
        ? "reports 表不存在，请执行 docs/supabase-setup.sql。"
        : dbError.message;
    return {
      ...base,
      error: "database_read_failed",
      hint,
    };
  }

  base.databaseReadable = true;
  base.ok = true;
  return base;
}

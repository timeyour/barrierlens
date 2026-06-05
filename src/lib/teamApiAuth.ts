const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
  "Access-Control-Max-Age": "86400",
} as const;

function getTeamApiKey(): string | undefined {
  return process.env.TEAM_API_KEY?.trim() || undefined;
}

function extractProvidedKey(request: Request): string | undefined {
  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return request.headers.get("x-api-key")?.trim() || undefined;
}

/** 浏览器同源访问（官网表单）无需 Key */
function isSameOriginBrowserRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isTeamApiAuthorized(request: Request): boolean {
  const teamKey = getTeamApiKey();
  // 官网表单：同源浏览器请求始终允许（不暴露 Key 给前端）
  if (isSameOriginBrowserRequest(request)) return true;

  if (!teamKey) {
    // 未配置 TEAM_API_KEY 时：仅允许同源；外部脚本/Postman 拒绝
    return process.env.NODE_ENV !== "production";
  }

  const provided = extractProvidedKey(request);
  return Boolean(provided && provided === teamKey);
}

export function teamApiUnauthorizedResponse(request: Request): Response {
  const headers = new Headers(corsHeaders(request));
  headers.set("Content-Type", "application/json");
  return new Response(
    JSON.stringify({
      error: "未授权",
      code: "unauthorized",
      hint: "外部调用需配置 TEAM_API_KEY 并携带 Bearer / X-Api-Key；官网用户请用与站点相同的域名访问。",
    }),
    { status: 401, headers },
  );
}

export function corsHeaders(request: Request): HeadersInit {
  const teamKey = getTeamApiKey();
  const origin = request.headers.get("origin");
  const headers = new Headers(CORS_HEADERS);

  if (!teamKey) {
    if (origin) headers.set("Access-Control-Allow-Origin", origin);
    return headers;
  }

  const provided = extractProvidedKey(request);
  if (origin && (provided === teamKey || isSameOriginBrowserRequest(request))) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  return headers;
}

export function withCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

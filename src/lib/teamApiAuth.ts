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
  if (!teamKey) return true;

  const provided = extractProvidedKey(request);
  if (provided && provided === teamKey) return true;
  if (isSameOriginBrowserRequest(request)) return true;

  return false;
}

export function teamApiUnauthorizedResponse(request: Request): Response {
  const headers = new Headers(corsHeaders(request));
  headers.set("Content-Type", "application/json");
  return new Response(
    JSON.stringify({
      error: "未授权",
      code: "unauthorized",
      hint: "团队脚本请携带 Header：Authorization: Bearer <TEAM_API_KEY> 或 X-Api-Key: <TEAM_API_KEY>",
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

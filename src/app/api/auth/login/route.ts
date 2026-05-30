import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
  verifyTeamCredentials,
} from "@/lib/authSession";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        error: "团队登录未配置",
        code: "not_configured",
        hint: "请在 .env.local 设置 TEAM_LOGIN_EMAIL 与 TEAM_LOGIN_PASSWORD",
      },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
  }

  const user = verifyTeamCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
  }

  const token = createSessionToken(user);
  const response = NextResponse.json({ ok: true, user });
  response.headers.set(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${sessionCookieOptions()}`,
  );
  return response;
}

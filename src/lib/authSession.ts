import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE_NAME = "barrierlens_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  email: string;
  name: string;
};

type SessionPayload = SessionUser & { exp: number };

function authSecret(): string {
  return process.env.AUTH_SECRET?.trim() || "barrierlens-dev-secret-change-me";
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.TEAM_LOGIN_EMAIL?.trim() &&
      process.env.TEAM_LOGIN_PASSWORD?.trim(),
  );
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyTeamCredentials(
  email: string,
  password: string,
): SessionUser | null {
  const expectedEmail = process.env.TEAM_LOGIN_EMAIL?.trim().toLowerCase() ?? "";
  const expectedPassword = process.env.TEAM_LOGIN_PASSWORD?.trim() ?? "";
  if (!expectedEmail || !expectedPassword) return null;

  const normalized = email.trim().toLowerCase();
  if (!safeEqual(normalized, expectedEmail) || !safeEqual(password, expectedPassword)) {
    return null;
  }

  const name = process.env.TEAM_LOGIN_NAME?.trim() || normalized.split("@")[0] || "团队成员";
  return { email: normalized, name };
}

function sign(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + SESSION_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token: string | undefined | null): SessionUser | null {
  if (!token?.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.email || !payload.name || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSec = SESSION_MS / 1000): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAgeSec)}${secure}`;
}

export function readSessionFromRequest(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`),
  );
  if (!match?.[1]) return null;
  return parseSessionToken(decodeURIComponent(match[1]));
}

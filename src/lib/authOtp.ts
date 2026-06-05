/** Supabase Email OTP 长度因项目配置而异，常见 6 位或 8 位 */
export const EMAIL_OTP_MIN_LEN = 6;
export const EMAIL_OTP_MAX_LEN = 8;

export function normalizeEmailOtpInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, EMAIL_OTP_MAX_LEN);
}

export function isEmailOtpComplete(code: string): boolean {
  const len = code.length;
  return len === EMAIL_OTP_MIN_LEN || len === EMAIL_OTP_MAX_LEN;
}

export const EMAIL_OTP_HINT = "6 或 8 位数字";

/** 登录表单底部说明（单一文案源，避免各页不一致） */
export const EMAIL_OTP_SEND_HINT =
  "将向邮箱发送数字验证码（6 或 8 位，以邮件为准），在本页输入后登录。";

export const EMAIL_OTP_LINK_FALLBACK_HINT =
  "若邮件里是登录链接，点击链接也可完成登录。";

export const AUTH_MODAL_ROOT_ID = "auth-modal-root";

export function getAuthModalRoot(): HTMLElement {
  return document.getElementById(AUTH_MODAL_ROOT_ID) ?? document.body;
}

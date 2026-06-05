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

export const EMAIL_OTP_HINT = "6 或 8 位数字（以邮件为准）";

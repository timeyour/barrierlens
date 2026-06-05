/** Map Supabase Auth errors to user-facing Chinese messages. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("email rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("rate limit exceeded")
  ) {
    return "邮箱验证码发送过于频繁。请等待约 1 小时后再试，勿重复点击「获取验证码」或「重新发送」。";
  }

  if (lower.includes("otp_expired") || lower.includes("expired")) {
    return "验证码已过期，请重新获取。";
  }

  if (lower.includes("invalid") && lower.includes("otp")) {
    return "验证码不正确，请核对邮件中的 6 位数字。";
  }

  return message || "操作失败，请稍后重试。";
}

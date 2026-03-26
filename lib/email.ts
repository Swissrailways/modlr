const APP_NAME = 'Modlr'

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  // Read at call-time so Railway runtime env vars are picked up (not build-time)
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  const SMTP_FROM = process.env.SMTP_FROM ?? 'scriptsswiss@gmail.com'

  if (!BREVO_API_KEY) {
    console.log(`\n========== EMAIL (no Brevo API key configured) ==========`)
    console.log(`To: ${to}\nSubject: ${subject}`)
    console.log('=========================================================\n')
    return true
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: APP_NAME, email: SMTP_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Brevo API error:', res.status, err)
      return false
    }

    return true
  } catch (err) {
    console.error('Failed to send email:', err)
    return false
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<boolean> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#18181b;color:#fff;border-radius:12px;padding:32px;">
      <h2 style="margin:0 0 8px;font-size:22px;">Verify your email</h2>
      <p style="color:#a1a1aa;margin:0 0 24px;">
        Welcome to <strong style="color:#fff">${APP_NAME}</strong>! Click the button below to verify your email address.
        This link expires in <strong style="color:#fff">24 hours</strong>.
      </p>
      <a href="${verifyUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
        Verify Email
      </a>
      <p style="color:#52525b;font-size:12px;margin-top:24px;">
        If you didn't create an account, you can safely ignore this email.<br/>
        Link: <a href="${verifyUrl}" style="color:#818cf8;">${verifyUrl}</a>
      </p>
    </div>
  `
  return sendEmail(to, `Verify your ${APP_NAME} email address`, html)
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#18181b;color:#fff;border-radius:12px;padding:32px;">
      <h2 style="margin:0 0 8px;font-size:22px;">Reset your password</h2>
      <p style="color:#a1a1aa;margin:0 0 24px;">
        We received a request to reset your <strong style="color:#fff">${APP_NAME}</strong> password.
        Click the button below — this link expires in <strong style="color:#fff">1 hour</strong>.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
        Reset Password
      </a>
      <p style="color:#52525b;font-size:12px;margin-top:24px;">
        If you didn't request this, you can safely ignore this email.<br/>
        Link: <a href="${resetUrl}" style="color:#818cf8;">${resetUrl}</a>
      </p>
    </div>
  `
  return sendEmail(to, `Reset your ${APP_NAME} password`, html)
}

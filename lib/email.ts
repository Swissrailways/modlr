import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transporter = getTransporter()
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@modlr.app'
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Modlr'

  if (!transporter) {
    console.log(`\n========== EMAIL (no SMTP configured) ==========`)
    console.log(`To: ${to}\nSubject: ${subject}`)
    console.log('=================================================\n')
    return true
  }

  try {
    await transporter.sendMail({
      from: `"${appName}" <${from}>`,
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Failed to send email:', err)
    return false
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<boolean> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Modlr'
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#18181b;color:#fff;border-radius:12px;padding:32px;">
      <h2 style="margin:0 0 8px;font-size:22px;">Verify your email</h2>
      <p style="color:#a1a1aa;margin:0 0 24px;">
        Welcome to <strong style="color:#fff">${appName}</strong>! Click the button below to verify your email address.
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
  return sendEmail(to, `Verify your ${appName} email address`, html)
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Modlr'
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#18181b;color:#fff;border-radius:12px;padding:32px;">
      <h2 style="margin:0 0 8px;font-size:22px;">Reset your password</h2>
      <p style="color:#a1a1aa;margin:0 0 24px;">
        We received a request to reset your <strong style="color:#fff">${appName}</strong> password.
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
  return sendEmail(to, `Reset your ${appName} password`, html)
}

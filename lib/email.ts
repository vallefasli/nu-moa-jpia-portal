import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev' // Fallback to resend's test email

export async function sendPasswordResetEmail(to: string, resetLink: string, name?: string) {
  const subject = 'Reset Your Password — NU MOA JPIA Portal'
  const greeting = name ? `Hello ${name},` : 'Hello,'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              
              <!-- Gold Accent Stripe -->
              <tr>
                <td style="height: 5px; background: linear-gradient(90deg, #FFD54F, #ffe082, #FFD54F);"></td>
              </tr>

              <!-- Header Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #004d2b 0%, #006B3C 100%); padding: 32px 24px; text-align: center;">
                  <div style="font-size: 11px; font-weight: 800; letter-spacing: 2.5px; color: #FFD54F; text-transform: uppercase; margin-bottom: 4px;">
                    National University — MOA
                  </div>
                  <div style="font-size: 17px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                    Junior Philippine Institute of Accountants
                  </div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px 24px 28px;">
                  <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                    Reset Your Password
                  </h1>
                  
                  <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    ${greeting}
                  </p>
                  
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    We received a request to reset the password for your NU MOA JPIA Portal account. Click the button below to choose a new password:
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #006B3C; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 13px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 107, 60, 0.25); text-align: center; letter-spacing: 0.3px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Notice Box -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #FFD54F; border-radius: 6px; padding: 12px 14px; margin: 24px 0 16px 0;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                      <strong>Note:</strong> This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
                    </p>
                  </div>

                  <!-- Fallback Link -->
                  <p style="margin: 16px 0 0 0; font-size: 11px; line-height: 1.5; color: #94a3b8; word-break: break-all;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${resetLink}" style="color: #006B3C; text-decoration: underline;">${resetLink}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #006B3C; text-transform: uppercase; letter-spacing: 1px;">
                    NU MOA JPIA Portal
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.4;">
                    National University — Mall of Asia Campus<br>
                    This is an automated message. Please do not reply directly to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  if (resend) {
    try {
      await resend.emails.send({
        from: `NU MOA JPIA <${SENDER_EMAIL}>`,
        to,
        subject,
        html
      })
      console.log(`Password reset email sent successfully to ${to}`)
    } catch (error) {
      console.error('Failed to send password reset email via Resend:', error)
    }
  } else {
    console.log('\n=============================================')
    console.log('[SIMULATED EMAIL - NO RESEND API KEY FOUND]')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`RESET LINK: ${resetLink}`)
    console.log('=============================================\n')
  }
}

export async function sendConfirmationEmail(to: string, confirmationLink: string, name?: string) {
  const subject = 'Confirm Your Email Address — NU MOA JPIA Portal'
  const greeting = name ? `Hello ${name},` : 'Hello,'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              
              <!-- Gold Accent Stripe -->
              <tr>
                <td style="height: 5px; background: linear-gradient(90deg, #FFD54F, #ffe082, #FFD54F);"></td>
              </tr>

              <!-- Header Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #004d2b 0%, #006B3C 100%); padding: 32px 24px; text-align: center;">
                  <div style="font-size: 11px; font-weight: 800; letter-spacing: 2.5px; color: #FFD54F; text-transform: uppercase; margin-bottom: 4px;">
                    National University — MOA
                  </div>
                  <div style="font-size: 17px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                    Junior Philippine Institute of Accountants
                  </div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px 24px 28px;">
                  <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                    Confirm Your Email Address
                  </h1>
                  
                  <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    ${greeting}
                  </p>
                  
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    Thank you for signing up for the <strong>NU MOA JPIA Portal</strong>! Please verify your email address to confirm your registration and proceed with your account setup.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                    <tr>
                      <td align="center">
                        <a href="${confirmationLink}" target="_blank" style="display: inline-block; background-color: #006B3C; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 13px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 107, 60, 0.25); text-align: center; letter-spacing: 0.3px;">
                          Confirm Email Address
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Notice Box -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #FFD54F; border-radius: 6px; padding: 12px 14px; margin: 24px 0 16px 0;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                      <strong>Note:</strong> If you did not sign up for an account on the NU MOA JPIA Portal, you can safely ignore this email.
                    </p>
                  </div>

                  <!-- Fallback Link -->
                  <p style="margin: 16px 0 0 0; font-size: 11px; line-height: 1.5; color: #94a3b8; word-break: break-all;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${confirmationLink}" style="color: #006B3C; text-decoration: underline;">${confirmationLink}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #006B3C; text-transform: uppercase; letter-spacing: 1px;">
                    NU MOA JPIA Portal
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.4;">
                    National University — Mall of Asia Campus<br>
                    This is an automated message. Please do not reply directly to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  if (resend) {
    try {
      await resend.emails.send({
        from: `NU MOA JPIA <${SENDER_EMAIL}>`,
        to,
        subject,
        html
      })
      console.log(`Confirmation email sent successfully to ${to}`)
    } catch (error) {
      console.error('Failed to send confirmation email via Resend:', error)
    }
  } else {
    console.log('\n=============================================')
    console.log('[SIMULATED EMAIL - NO RESEND API KEY FOUND]')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`CONFIRMATION LINK: ${confirmationLink}`)
    console.log('=============================================\n')
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  const subject = 'Welcome to NU MOA JPIA!'
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="height: 5px; background: linear-gradient(90deg, #FFD54F, #ffe082, #FFD54F);"></div>
      <div style="background: linear-gradient(135deg, #004d2b, #006B3C); padding: 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px;">Welcome to NU MOA JPIA, ${name}!</h2>
      </div>
      <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p>Your membership registration has been <strong>approved</strong> by the administrators.</p>
        <p>You can now sign in to the Member Portal to access your Digital QR Code, view upcoming events, and track your attendance points.</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="https://nu-moa-jpia-portal.vercel.app/" style="display: inline-block; background-color: #006B3C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px;">Sign In to Portal</a>
        </div>
        <p style="color: #94a3b8; font-size: 11px;">If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `

  if (resend) {
    try {
      await resend.emails.send({
        from: `NU MOA JPIA <${SENDER_EMAIL}>`,
        to,
        subject,
        html
      })
      console.log(`Email sent successfully to ${to}`)
    } catch (error) {
      console.error('Failed to send Resend email:', error)
    }
  } else {
    console.log('\n=============================================')
    console.log('[SIMULATED EMAIL - NO RESEND API KEY FOUND]')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`BODY: ${html}`)
    console.log('=============================================\n')
  }
}

export async function sendRejectionEmail(to: string, name: string) {
  const subject = 'Update on your NU MOA JPIA Registration'
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="height: 5px; background: linear-gradient(90deg, #FFD54F, #ffe082, #FFD54F);"></div>
      <div style="background: linear-gradient(135deg, #004d2b, #006B3C); padding: 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; text-transform: uppercase;">Hello ${name},</h2>
      </div>
      <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p>Unfortunately, your membership registration for NU MOA JPIA could not be approved by the administrators at this time.</p>
        <p>This may be due to incomplete details (such as an unverified student number) or unverified membership validation.</p>
        <p>Please reach out to an officer or support if you believe this was an error.</p>
      </div>
    </div>
  `

  if (resend) {
    try {
      await resend.emails.send({
        from: `NU MOA JPIA <${SENDER_EMAIL}>`,
        to,
        subject,
        html
      })
      console.log(`Rejection email sent successfully to ${to}`)
    } catch (error) {
      console.error('Failed to send Resend email:', error)
    }
  } else {
    console.log('\n=============================================')
    console.log('[SIMULATED EMAIL - NO RESEND API KEY FOUND]')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`BODY: ${html}`)
    console.log('=============================================\n')
  }
}

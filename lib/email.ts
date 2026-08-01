import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev' // Fallback to resend's test email

export async function sendWelcomeEmail(to: string, name: string) {
  const subject = 'Welcome to NU MOA JPIA!'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #35408e;">Welcome to NU MOA JPIA, ${name}!</h2>
      <p>Your membership registration has been <strong>approved</strong> by the administrators.</p>
      <p>You can now log in to the Member Portal to access your Digital QR Code, view upcoming events, and track your attendance points.</p>
      <div style="margin: 30px 0;">
        <a href="https://nu-moa-jpia-portal.vercel.app/" style="background-color: #35408e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log in to Portal</a>
      </div>
      <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
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
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #35408e;">Hello ${name},</h2>
      <p>Unfortunately, your membership registration for NU MOA JPIA has been <strong>rejected</strong> by the administrators.</p>
      <p>This may be due to incorrect information (such as an invalid student number) or failure to pay the membership fee.</p>
      <p>Please contact an officer or reply to this email for further clarification.</p>
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

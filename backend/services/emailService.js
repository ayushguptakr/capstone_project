const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a password-reset email.
 * In development mode, also logs the URL to the console for easy testing.
 *
 * @param {{ to: string, resetUrl: string, userName?: string }} opts
 */
async function sendPasswordResetEmail({ to, resetUrl, userName }) {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a2e23;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:28px;font-weight:800;color:#22c55e;">🌿 EcoQuest</span>
      </div>

      <h2 style="font-size:22px;margin:0 0 12px;">Reset your password</h2>

      <p style="margin:0 0 16px;line-height:1.6;">
        Hi <strong>${userName || "there"}</strong>,
      </p>

      <p style="margin:0 0 24px;line-height:1.6;">
        We received a request to reset the password for your EcoQuest account.
        Click the button below to choose a new one:
      </p>

      <div style="text-align:center;margin:0 0 24px;">
        <a href="${resetUrl}"
           style="display:inline-block;padding:14px 28px;background:#22c55e;color:#fff;font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;">
          Reset Password
        </a>
      </div>

      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.6;">
        This link will expire in <strong>15 minutes</strong>.
      </p>

      <p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
        If you didn't request this, you can safely ignore this email — your password will remain unchanged.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />

      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        &copy; ${new Date().getFullYear()} EcoQuest &middot; Making sustainability fun
      </p>
    </div>
  `;

  // Always log in development for easy testing
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n\n[DEV] 🔐 Password Reset Link for ${to}:`);
    console.log(resetUrl);
    console.log(`(Expires in 15 minutes)\n`);
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "EcoQuest <onboarding@resend.dev>",
      to,
      subject: "Reset your EcoQuest password",
      html,
    });

    if (error) {
      console.error("[emailService] Resend error:", error);
      throw new Error(error.message || "Email delivery failed");
    }

    return data;
  } catch (err) {
    // In development, don't blow up the whole request if email fails —
    // the console.log above already gives the link.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[emailService] Email send failed (dev mode, link logged above):", err.message);
      return null;
    }
    throw err;
  }
}

module.exports = { sendPasswordResetEmail };

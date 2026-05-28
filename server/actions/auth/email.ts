import { Resend } from "resend";

import { CODE_EXPIRY_MINUTES } from "./constants";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  code: string
) {
  try {
    await resend.emails.send({
      from: "CODEXEDOC <verify@codexedoc.com>",
      replyTo: "contact@codexedoc.com",
      to: email,
      subject: "CODEXEDOC Verification",

      text: `Your verification code is: ${code}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
          <h2>Your verification code</h2>

          <div
            style="
              font-size: 42px;
              letter-spacing: 8px;
              font-weight: bold;
              color: #111827;
              margin: 24px 0;
            "
          >
            ${code}
          </div>

          <p>
            This code will expire in ${CODE_EXPIRY_MINUTES} minutes.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);

    throw new Error(
      "Failed to send verification email. Please try again."
    );
  }
}
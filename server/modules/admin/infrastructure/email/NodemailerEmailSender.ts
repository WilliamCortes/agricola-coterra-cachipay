import nodemailer from "nodemailer";
import type { EmailSender } from "../../domain/ports/EmailSender.js";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
};

export class NodemailerEmailSender implements EmailSender {
  constructor(private readonly config: SmtpConfig) {}

  async sendPasswordResetEmail(input: { toEmail: string; resetUrl: string }): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.port === 465,
      auth: { user: this.config.user, pass: this.config.pass },
    });

    await transporter.sendMail({
      from: this.config.fromEmail,
      to: input.toEmail,
      subject: "Reset Password (Admin Panel)",
      text: `To reset your password, open this link: ${input.resetUrl}`,
    });
  }
}

export interface EmailSender {
  sendPasswordResetEmail(input: { toEmail: string; resetUrl: string }): Promise<void>;
}


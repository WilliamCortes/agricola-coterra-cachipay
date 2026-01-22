import type { AdminUserRepository } from "../../domain/ports/AdminUserRepository";
import type { PasswordResetTokenRepository } from "../../domain/ports/PasswordResetTokenRepository";
import type { EmailSender } from "../../domain/ports/EmailSender";
import type { Clock } from "../../domain/ports/Clock";

export type RandomTokenGenerator = {
  generate(): string;
  hash(token: string): string;
};

export class RequestPasswordResetUseCase {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly emailSender: EmailSender,
    private readonly randomTokenGenerator: RandomTokenGenerator,
    private readonly clock: Clock,
    private readonly appBaseUrl: string
  ) {}

  async execute(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.adminUserRepository.findByEmail(normalizedEmail);
    if (!user || !user.isActive) {
      return;
    }

    const token = this.randomTokenGenerator.generate();
    const tokenHash = this.randomTokenGenerator.hash(token);
    const expiresAt = new Date(this.clock.now().getTime() + 60 * 60 * 1000);

    await this.passwordResetTokenRepository.create({
      adminUserId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${this.appBaseUrl}/admin/reset-password?token=${encodeURIComponent(token)}`;
    await this.emailSender.sendPasswordResetEmail({ toEmail: user.email, resetUrl });
  }
}

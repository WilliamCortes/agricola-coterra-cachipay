import type { StorefrontSettingsRepository } from "../domain/ports/StorefrontSettingsRepository.js";

export class GetStorefrontSettingsUseCase {
  constructor(private readonly settingsRepository: StorefrontSettingsRepository) {}

  async execute() {
    return await this.settingsRepository.get();
  }
}


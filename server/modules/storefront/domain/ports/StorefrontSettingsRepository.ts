export type StorefrontSettings = {
  businessName: string;
  phone: string | null;
  address: string | null;
  shippingCosts: unknown | null;
  paymentMethods: unknown | null;
};

export interface StorefrontSettingsRepository {
  get(): Promise<StorefrontSettings>;
}


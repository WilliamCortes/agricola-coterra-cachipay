export type ProductPricing = {
  id: number;
  name: string;
  price: number;
  promoPrice: number | null;
  isActive: boolean;
};

export interface ProductPricingRepository {
  findByIds(ids: number[]): Promise<ProductPricing[]>;
}


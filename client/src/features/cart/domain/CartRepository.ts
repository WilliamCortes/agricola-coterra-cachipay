import type { Cart } from "./cart";

export interface CartRepository {
  getCart(): Cart;
  saveCart(cart: Cart): void;
  clear(): void;
}

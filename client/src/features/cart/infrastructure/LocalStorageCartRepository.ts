import type { CartRepository } from "../domain/CartRepository";
import { buildEmptyCart, type Cart } from "../domain/cart";

const CART_STORAGE_KEY = "storefront_cart_v1";

export class LocalStorageCartRepository implements CartRepository {
  getCart(): Cart {
    if (typeof window === "undefined") return buildEmptyCart();

    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return buildEmptyCart();
      const parsed = JSON.parse(raw) as Cart;
      if (!parsed || !Array.isArray(parsed.items)) return buildEmptyCart();
      return { items: parsed.items };
    } catch {
      return buildEmptyCart();
    }
  }

  saveCart(cart: Cart): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }
}

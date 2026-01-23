import type { Product } from "@shared/schema";
import { buildEmptyCart, type Cart } from "../domain/cart";

export function addProductToCart(cart: Cart, product: Product, quantity: number): Cart {
  const safeQuantity = clampQuantity(quantity);

  const existing = cart.items.find((i) => i.productId === product.id);
  if (!existing) {
    return {
      items: [
        ...cart.items,
        {
          productId: product.id,
          quantity: safeQuantity,
          name: product.name,
          unitPrice: product.price,
          imageUrl: product.imageUrl ?? null,
          categoryId: product.categoryId ?? null,
        },
      ],
    };
  }

  return updateCartItemQuantity(cart, product.id, existing.quantity + safeQuantity);
}

export function updateCartItemQuantity(cart: Cart, productId: number, quantity: number): Cart {
  const safeQuantity = clampQuantity(quantity);

  return {
    items: cart.items.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item)),
  };
}

export function removeCartItem(cart: Cart, productId: number): Cart {
  return { items: cart.items.filter((i) => i.productId !== productId) };
}

export function clearCart(): Cart {
  return buildEmptyCart();
}

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

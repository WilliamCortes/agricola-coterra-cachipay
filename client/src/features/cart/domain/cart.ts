export type CartItem = {
  productId: number;
  quantity: number;
  name: string;
  unitPrice: number;
  imageUrl: string | null;
  categoryId: number | null;
};

export type Cart = {
  items: CartItem[];
};

export type CartSummary = {
  itemsCount: number;
  subtotal: number;
};

export function buildEmptyCart(): Cart {
  return { items: [] };
}

export function calculateCartSummary(cart: Cart): CartSummary {
  const itemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  return { itemsCount, subtotal };
}

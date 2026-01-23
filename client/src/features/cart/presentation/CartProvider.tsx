import * as React from "react";
import type { Product } from "@shared/schema";
import type { CartRepository } from "../domain/CartRepository";
import { calculateCartSummary, type Cart } from "../domain/cart";
import { LocalStorageCartRepository } from "../infrastructure/LocalStorageCartRepository";
import { addProductToCart, clearCart, removeCartItem, updateCartItemQuantity } from "../application/cartUseCases";

type CartContextValue = {
  cart: Cart;
  itemsCount: number;
  subtotal: number;
  addProduct: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider(props: React.PropsWithChildren<{ repository?: CartRepository }>) {
  const repository = React.useMemo(() => props.repository ?? new LocalStorageCartRepository(), [props.repository]);
  const [cart, setCart] = React.useState<Cart>(() => repository.getCart());

  React.useEffect(() => {
    repository.saveCart(cart);
  }, [cart, repository]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (!event.key) return;
      if (event.key !== "storefront_cart_v1") return;
      setCart(repository.getCart());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [repository]);

  const { itemsCount, subtotal } = React.useMemo(() => calculateCartSummary(cart), [cart]);

  const value = React.useMemo<CartContextValue>(() => {
    return {
      cart,
      itemsCount,
      subtotal,
      addProduct: (product, quantity = 1) => setCart((current) => addProductToCart(current, product, quantity)),
      updateQuantity: (productId, quantity) => setCart((current) => updateCartItemQuantity(current, productId, quantity)),
      removeItem: (productId) => setCart((current) => removeCartItem(current, productId)),
      clear: () => {
        repository.clear();
        setCart(clearCart());
      },
    };
  }, [cart, itemsCount, subtotal, repository]);

  return <CartContext.Provider value={value}>{props.children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


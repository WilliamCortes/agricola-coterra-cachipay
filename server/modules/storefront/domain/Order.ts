export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "canceled";

export type PlaceOrderItem = {
  productId: number;
  quantity: number;
};

export type PlaceOrderCustomer = {
  name: string;
  phone: string;
  email: string | null;
};

export type PlaceOrderShipping = {
  cost: number;
  zone: string;
};

export type PlaceOrderRequest = {
  customer: PlaceOrderCustomer;
  deliveryAddress: string | null;
  notes: string | null;
  items: PlaceOrderItem[];
  shipping: PlaceOrderShipping | null;
};

export type PlacedOrder = {
  orderId: number;
  orderNumber: string;
  status: OrderStatus;
  total: number;
};


import type { OrderStatus } from "../Order";

export type NewOrderItem = {
  productId: number | null;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export interface OrderRepository {
  createOrder(input: {
    orderNumber: string;
    customerId: number | null;
    status: OrderStatus;
    total: number;
    notes: string | null;
    deliveryAddress: string | null;
  }): Promise<{ id: number; orderNumber: string; status: OrderStatus; total: number }>;
  createOrderItems(orderId: number, items: NewOrderItem[]): Promise<void>;
  createStatusHistory(input: { orderId: number; fromStatus: OrderStatus | null; toStatus: OrderStatus; note: string | null }): Promise<void>;
}


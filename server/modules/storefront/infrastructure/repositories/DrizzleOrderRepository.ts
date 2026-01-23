import { db } from "../../../../db.js";
import { orderItems, orderStatusHistory, orders } from "../../../../../shared/schema.js";
import type { OrderRepository } from "../../domain/ports/OrderRepository.js";
import type { OrderStatus } from "../../domain/Order.js";
import type { NewOrderItem } from "../../domain/ports/OrderRepository.js";

export class DrizzleOrderRepository implements OrderRepository {
  async createOrder(input: {
    orderNumber: string;
    customerId: number | null;
    status: OrderStatus;
    total: number;
    notes: string | null;
    deliveryAddress: string | null;
  }): Promise<{ id: number; orderNumber: string; status: OrderStatus; total: number }> {
    const [row] = await db
      .insert(orders)
      .values({
        orderNumber: input.orderNumber,
        customerId: input.customerId ?? null,
        status: input.status,
        total: input.total,
        notes: input.notes ?? null,
        deliveryAddress: input.deliveryAddress ?? null,
        assignedDelivery: null,
        shippingGuideNumber: null,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status, total: orders.total });

    return { ...row, status: row.status as OrderStatus };
  }

  async createOrderItems(orderId: number, items: NewOrderItem[]): Promise<void> {
    if (!items.length) return;
    await db.insert(orderItems).values(items.map((i) => ({ ...i, orderId })));
  }

  async createStatusHistory(input: {
    orderId: number;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note: string | null;
  }): Promise<void> {
    await db.insert(orderStatusHistory).values({
      orderId: input.orderId,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus,
      note: input.note ?? null,
      changedByAdminUserId: null,
    });
  }
}

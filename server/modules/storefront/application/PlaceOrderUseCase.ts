import type { PlacedOrder, PlaceOrderRequest } from "../domain/Order.js";
import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";
import type { OrderRepository } from "../domain/ports/OrderRepository.js";
import type { ProductPricingRepository } from "../domain/ports/ProductPricingRepository.js";

export class PlaceOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly productPricingRepository: ProductPricingRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(input: PlaceOrderRequest): Promise<PlacedOrder> {
    if (!input.items.length) {
      const err = new Error("Cart is empty");
      (err as any).status = 400;
      throw err;
    }

    const customerId = await this.findOrCreateCustomer(input.customer);
    const pricing = await this.productPricingRepository.findByIds(uniqueIds(input.items.map((i) => i.productId)));
    const byId = new Map(pricing.map((p) => [p.id, p]));

    const items = input.items.map((i) => {
      if (!Number.isFinite(i.quantity) || i.quantity <= 0) {
        const err = new Error("Invalid item quantity");
        (err as any).status = 400;
        throw err;
      }

      const product = byId.get(i.productId);
      if (!product) {
        const err = new Error("Product not found");
        (err as any).status = 400;
        throw err;
      }
      if (!product.isActive) {
        const err = new Error("Product is not active");
        (err as any).status = 400;
        throw err;
      }

      const unitPrice = product.promoPrice ?? product.price;
      const quantity = Math.floor(i.quantity);
      return {
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice,
        total: unitPrice * quantity,
      };
    });

    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const shippingCost = input.shipping?.cost ?? 0;
    if (!Number.isFinite(shippingCost) || shippingCost < 0) {
      const err = new Error("Invalid shipping cost");
      (err as any).status = 400;
      throw err;
    }

    const total = subtotal + Math.floor(shippingCost);
    const notes = buildNotes(input.notes, input.shipping);

    const status = "pending" as const;

    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNumber = generateOrderNumber();
      try {
        const created = await this.orderRepository.createOrder({
          orderNumber,
          customerId,
          status,
          total,
          notes,
          deliveryAddress: input.deliveryAddress,
        });

        await this.orderRepository.createOrderItems(created.id, items);
        await this.orderRepository.createStatusHistory({ orderId: created.id, fromStatus: null, toStatus: status, note: null });

        return { orderId: created.id, orderNumber: created.orderNumber, status, total: created.total };
      } catch (err) {
        lastError = err;
        const code = (err as any)?.code;
        if (code !== "23505") break;
      }
    }

    throw lastError ?? new Error("Failed to place order");
  }

  private async findOrCreateCustomer(input: PlaceOrderRequest["customer"]): Promise<number | null> {
    const phone = input.phone.trim();
    const email = (input.email ?? "").trim();

    if (phone) {
      const existing = await this.customerRepository.findByPhone(phone);
      if (existing) {
        if (existing.name !== input.name) await this.customerRepository.updateName(existing.id, input.name);
        return existing.id;
      }
    }

    if (email) {
      const existing = await this.customerRepository.findByEmail(email);
      if (existing) {
        if (existing.name !== input.name) await this.customerRepository.updateName(existing.id, input.name);
        return existing.id;
      }
    }

    if (!phone && !email) return null;
    const created = await this.customerRepository.create({ name: input.name, phone: phone || null, email: email || null });
    return created.id;
  }
}

function uniqueIds(ids: number[]): number[] {
  return Array.from(new Set(ids));
}

function generateOrderNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CO-${yyyy}${mm}${dd}-${rand}`;
}

function buildNotes(notes: string | null, shipping: { cost: number; zone: string } | null): string | null {
  const pieces: string[] = [];
  if (notes && notes.trim()) pieces.push(notes.trim());
  if (shipping) pieces.push(`Envío: zona=${shipping.zone} · costo=${shipping.cost}`);
  return pieces.length ? pieces.join("\n") : null;
}


import { z } from 'zod';
import { insertMessageSchema, categories, products, testimonials } from './schema.js';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/categories/:slug',
      responses: {
        200: z.custom<typeof categories.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    getByCategory: {
      method: 'GET' as const,
      path: '/api/categories/:slug/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
  },
  testimonials: {
    list: {
      method: 'GET' as const,
      path: '/api/testimonials',
      responses: {
        200: z.array(z.custom<typeof testimonials.$inferSelect>()),
      },
    },
  },
  contact: {
    submit: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertMessageSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      },
    },
  },
  storefront: {
    settings: {
      method: 'GET' as const,
      path: '/api/storefront/settings',
      responses: {
        200: z.object({
          settings: z.object({
            businessName: z.string(),
            phone: z.string().nullable(),
            address: z.string().nullable(),
            shippingCosts: z.unknown().nullable(),
            paymentMethods: z.unknown().nullable(),
          }),
        }),
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({
        customer: z.object({
          name: z.string().min(2).max(200),
          phone: z.string().min(3).max(60),
          email: z.string().email().nullable().optional(),
        }),
        deliveryAddress: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(999) })).min(1),
        shipping: z
          .object({
            cost: z.number().int().min(0),
            zone: z.string().min(1).max(120),
          })
          .nullable()
          .optional(),
      }),
      responses: {
        201: z.object({
          orderId: z.number().int(),
          orderNumber: z.string(),
          total: z.number().int(),
          status: z.string(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

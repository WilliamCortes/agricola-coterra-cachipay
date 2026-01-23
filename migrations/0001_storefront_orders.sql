CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"segment" text,
	"communication_preferences" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" integer,
	"status" text NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"delivery_address" text,
	"assigned_delivery" text,
	"shipping_guide_number" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"note" text,
	"changed_by_admin_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"reason" text NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_id_customers_id_fk'
	) THEN
		ALTER TABLE "orders"
			ADD CONSTRAINT "orders_customer_id_customers_id_fk"
			FOREIGN KEY ("customer_id")
			REFERENCES "public"."customers"("id")
			ON DELETE set null ON UPDATE no action;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_orders_id_fk'
	) THEN
		ALTER TABLE "order_items"
			ADD CONSTRAINT "order_items_order_id_orders_id_fk"
			FOREIGN KEY ("order_id")
			REFERENCES "public"."orders"("id")
			ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'order_status_history_order_id_orders_id_fk'
	) THEN
		ALTER TABLE "order_status_history"
			ADD CONSTRAINT "order_status_history_order_id_orders_id_fk"
			FOREIGN KEY ("order_id")
			REFERENCES "public"."orders"("id")
			ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'order_returns_order_id_orders_id_fk'
	) THEN
		ALTER TABLE "order_returns"
			ADD CONSTRAINT "order_returns_order_id_orders_id_fk"
			FOREIGN KEY ("order_id")
			REFERENCES "public"."orders"("id")
			ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;


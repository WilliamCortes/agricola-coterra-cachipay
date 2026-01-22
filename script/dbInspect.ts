import "dotenv/config";
import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";

const { Client } = pg;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  const tables = [
    "categories",
    "products",
    "messages",
    "testimonials",
    "admin_users",
    "admin_refresh_tokens",
    "password_reset_tokens",
    "admin_activity_logs",
    "business_settings",
    "product_images",
    "warehouses",
    "stock_levels",
    "inventory_movements",
    "customers",
    "orders",
    "order_items",
    "order_status_history",
    "order_returns",
    "customer_notes",
    "customer_interactions",
  ];

  const owners = await client.query(
    `select tablename, tableowner
     from pg_tables
     where schemaname='public' and tablename = any($1::text[])
     order by tablename`,
    [tables]
  );

  const output: any = { owners: owners.rows, columns: {} as Record<string, any> };

  for (const table of ["categories", "products", "messages"]) {
    const cols = await client.query(
      `select column_name, data_type
       from information_schema.columns
       where table_schema='public' and table_name=$1
       order by ordinal_position`,
      [table]
    );
    output.columns[table] = cols.rows;
  }

  await client.end();

  const outPath = path.join(process.cwd(), "script", "dbInspect.out.json");
  await fs.writeFile(outPath, JSON.stringify(output, null, 2), "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import "dotenv/config";
import pg from "pg";

const { Client } = pg;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const client = new Client({ connectionString: url });
  await client.connect();

  await client.query(`
    create table if not exists contact_messages (
      id serial primary key,
      name text not null,
      email text not null,
      message text not null
    );
  `);

  await client.query(`
    create table if not exists store_categories (
      id serial primary key,
      name text not null,
      slug text not null unique,
      description text,
      image_url text,
      parent_id integer,
      sort_order integer not null default 0
    );
  `);

  await client.query(`
    create table if not exists store_products (
      id serial primary key,
      category_id integer references store_categories(id),
      name text not null,
      description text not null,
      price integer not null,
      image_url text,
      stock integer default 100,
      sku text unique,
      barcode text unique,
      cost_price integer not null default 0,
      promo_price integer,
      stock_min integer not null default 0,
      stock_max integer,
      unit text,
      supplier text,
      expires_at timestamptz,
      tags text[],
      is_active boolean not null default true,
      created_at timestamptz not null default now()
    );
  `);

  await client.query(`
    create table if not exists store_testimonials (
      id serial primary key,
      name text not null,
      role text not null,
      content text not null,
      rating integer default 5
    );
  `);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


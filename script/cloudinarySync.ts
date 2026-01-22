import "dotenv/config";
import { eq, isNotNull } from "drizzle-orm";
import { categories, products } from "../shared/schema";
import { db } from "../server/db";
import { getCloudinaryClient } from "../server/infrastructure/cloudinary/cloudinaryClient";

type UploadTarget = {
  id: number;
  imageUrl: string;
};

const cloudinary = getCloudinaryClient();

function buildProductPublicId(productId: number) {
  return `forest-elemental/products/product-${productId}`;
}

function buildCategoryPublicId(categoryId: number) {
  return `forest-elemental/categories/category-${categoryId}`;
}

function buildSquareDeliveryUrl(publicId: string) {
  return cloudinary.url(publicId, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
    crop: "fill",
    gravity: "auto",
    width: 800,
    height: 800,
  });
}

function buildCategoryDeliveryUrl(publicId: string) {
  return cloudinary.url(publicId, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
    crop: "fill",
    gravity: "auto",
    width: 1200,
    height: 800,
  });
}

async function uploadRemoteImage(sourceUrl: string, publicId: string) {
  const effectiveUrl = rewriteUnsplashSourceUrl(sourceUrl);

  const maxAttempts = 3;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await cloudinary.uploader.upload(effectiveUrl, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
        continue;
      }
    }
  }

  throw lastError;
}

function formatUnknownError(err: unknown) {
  if (err instanceof Error) {
    const details = JSON.stringify(err, Object.getOwnPropertyNames(err));
    return `${err.message}\n${details}`;
  }

  if (typeof err === "object" && err !== null) {
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  return String(err);
}

function rewriteUnsplashSourceUrl(url: string) {
  const normalized = url.trim();
  const prefix = "https://source.unsplash.com/";
  if (!normalized.startsWith(prefix)) {
    return normalized;
  }

  const path = normalized.slice(prefix.length);
  const photoId = path.split("/")[0]?.trim();
  if (!photoId) {
    return normalized;
  }

  return `https://unsplash.com/photos/${photoId}/download?force=true`;
}

async function syncProducts() {
  const rows = await db
    .select({ id: products.id, imageUrl: products.imageUrl })
    .from(products)
    .where(isNotNull(products.imageUrl));

  const targets: UploadTarget[] = rows
    .filter(
      (r) =>
        typeof r.imageUrl === "string" &&
        r.imageUrl.trim().length > 0 &&
        !r.imageUrl.startsWith("https://res.cloudinary.com/"),
    )
    .map((r) => ({ id: r.id, imageUrl: r.imageUrl as string }));

  for (const target of targets) {
    const publicId = buildProductPublicId(target.id);
    try {
      await uploadRemoteImage(target.imageUrl, publicId);
    } catch (err) {
      throw new Error(
        `Cloudinary upload failed for product ${target.id}: ${formatUnknownError(err)}`,
      );
    }
    const deliveryUrl = buildSquareDeliveryUrl(publicId);

    await db
      .update(products)
      .set({ imageUrl: deliveryUrl })
      .where(eq(products.id, target.id));

    process.stdout.write(`Synced product ${target.id}\n`);
  }
}

async function syncCategories() {
  const rows = await db
    .select({ id: categories.id, imageUrl: categories.imageUrl })
    .from(categories)
    .where(isNotNull(categories.imageUrl));

  const targets: UploadTarget[] = rows
    .filter(
      (r) =>
        typeof r.imageUrl === "string" &&
        r.imageUrl.trim().length > 0 &&
        !r.imageUrl.startsWith("https://res.cloudinary.com/"),
    )
    .map((r) => ({ id: r.id, imageUrl: r.imageUrl as string }));

  for (const target of targets) {
    const publicId = buildCategoryPublicId(target.id);
    try {
      await uploadRemoteImage(target.imageUrl, publicId);
    } catch (err) {
      throw new Error(
        `Cloudinary upload failed for category ${target.id}: ${formatUnknownError(err)}`,
      );
    }
    const deliveryUrl = buildCategoryDeliveryUrl(publicId);

    await db
      .update(categories)
      .set({ imageUrl: deliveryUrl })
      .where(eq(categories.id, target.id));

    process.stdout.write(`Synced category ${target.id}\n`);
  }
}

async function main() {
  await syncCategories();
  await syncProducts();
}

main().catch((err) => {
  process.stderr.write(`${formatUnknownError(err)}\n`);
  process.exitCode = 1;
});

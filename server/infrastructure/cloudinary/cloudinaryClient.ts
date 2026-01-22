import { v2 as cloudinary } from "cloudinary";

function normalizeCloudinaryUrl(rawValue: string) {
  const trimmed = rawValue.trim().replace(/^['"]|['"]$/g, "");
  const protocolIndex = trimmed.indexOf("cloudinary://");
  if (protocolIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(protocolIndex);
}

export function getCloudinaryClient() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    throw new Error("CLOUDINARY_URL must be set");
  }

  const normalizedUrl = normalizeCloudinaryUrl(cloudinaryUrl);
  cloudinary.config({ cloudinary_url: normalizedUrl });
  return cloudinary;
}

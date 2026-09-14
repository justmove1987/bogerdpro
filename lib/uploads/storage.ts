import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);
const maxImageSizeBytes = 5 * 1024 * 1024;

export function validateImageUpload(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Formato de imagen no permitido. Usa JPG, PNG, WEBP o AVIF.");
  }

  if (file.size > maxImageSizeBytes) {
    throw new Error("La imagen supera el límite de 5 MB.");
  }
}

export async function saveLocalUpload(file: File) {
  validateImageUpload(file);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const extension = allowedImageTypes.get(file.type) ?? path.extname(file.name).toLowerCase();
    const safeName = path
      .basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `product-images/${safeName || "producte"}-${randomUUID()}${extension}`;
    const blob = await put(filename, file, { access: "public" });

    return blob.url;
  }

  await mkdir(uploadDir, { recursive: true });

  const extension = allowedImageTypes.get(file.type) ?? path.extname(file.name).toLowerCase();
  const filename = `${randomUUID()}${extension}`;
  const fullPath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return `/uploads/${filename}`;
}

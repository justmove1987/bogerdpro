import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

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
  await mkdir(uploadDir, { recursive: true });

  const extension = allowedImageTypes.get(file.type) ?? path.extname(file.name).toLowerCase();
  const filename = `${randomUUID()}${extension}`;
  const fullPath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return `/uploads/${filename}`;
}

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function saveLocalUpload(file: File) {
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.name);
  const filename = `${randomUUID()}${extension}`;
  const fullPath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return `/uploads/${filename}`;
}

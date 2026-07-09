import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { saveLocalUpload } from "@/lib/uploads/storage";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "El archivo es obligatorio." }, { status: 400 });
  }

  const url = await saveLocalUpload(file);

  return NextResponse.json({ url });
}

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const registerSchema = z.object({
  firstName: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80, "El nombre es demasiado largo."),
  lastName: z.string().trim().min(2, "Los apellidos deben tener al menos 2 caracteres.").max(120, "Los apellidos son demasiado largos."),
  email: z.string().trim().email("Introduce un email válido.").max(180, "El email es demasiado largo.").transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(40, "El teléfono es demasiado largo.").optional(),
  companyName: z.string().trim().max(160, "La empresa es demasiado larga.").optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(120, "La contraseña es demasiado larga."),
  confirmPassword: z.string().min(1, "Confirma la contraseña."),
  marketingAccepted: z.boolean().optional(),
}).refine((value) => value.password === value.confirmPassword, {
  message: "La confirmación no coincide con la contraseña.",
  path: ["confirmPassword"],
});

function firstFormError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Revisa los campos del formulario.";
}

function emptyToNull(value?: string) {
  return value?.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: firstFormError(parsed.error) }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Este email ya está registrado." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email: parsed.data.email,
          passwordHash,
          role: "CUSTOMER",
        },
        select: { id: true },
      });

      await tx.customer.upsert({
        where: { email: parsed.data.email },
        update: {
          userId: user.id,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: emptyToNull(parsed.data.phone),
          companyName: emptyToNull(parsed.data.companyName),
          marketingAccepted: parsed.data.marketingAccepted ?? false,
        },
        create: {
          userId: user.id,
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: emptyToNull(parsed.data.phone),
          companyName: emptyToNull(parsed.data.companyName),
          marketingAccepted: parsed.data.marketingAccepted ?? false,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "No se ha podido crear la cuenta. Inténtalo de nuevo." }, { status: 500 });
  }
}

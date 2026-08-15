"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export type AccountActionState = {
  ok: boolean;
  message: string;
};

const profileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120, "El nombre es demasiado largo."),
  email: z.string().trim().email("Introduce un email válido.").max(180, "El email es demasiado largo.").transform((email) => email.toLowerCase()),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Introduce tu contraseña actual."),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres.").max(120, "La contraseña es demasiado larga."),
  confirmPassword: z.string().min(1, "Confirma la nueva contraseña."),
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "La confirmación no coincide con la nueva contraseña.",
  path: ["confirmPassword"],
});

const billingSchema = z.object({
  firstName: z.string().trim().max(80, "El nombre es demasiado largo.").optional(),
  lastName: z.string().trim().max(120, "Los apellidos son demasiado largos.").optional(),
  companyName: z.string().trim().max(160, "La empresa es demasiado larga.").optional(),
  taxId: z.string().trim().max(40, "El NIF/CIF es demasiado largo.").optional(),
  phone: z.string().trim().max(40, "El teléfono es demasiado largo.").optional(),
  addressLine1: z.string().trim().max(180, "La dirección es demasiado larga.").optional(),
  addressLine2: z.string().trim().max(180, "La dirección adicional es demasiado larga.").optional(),
  postalCode: z.string().trim().max(20, "El código postal es demasiado largo.").optional(),
  city: z.string().trim().max(100, "La ciudad es demasiado larga.").optional(),
  province: z.string().trim().max(100, "La provincia es demasiado larga.").optional(),
  country: z.string().trim().max(80, "El país es demasiado largo.").optional(),
});

function firstFormError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Revisa los campos del formulario.";
}

function emptyToNull(value: string | undefined) {
  return value?.trim() ? value.trim() : null;
}

async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para modificar tu cuenta.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user) {
    throw new Error("No hemos encontrado tu cuenta.");
  }

  return user;
}

export async function updateAccountProfile(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  try {
    const user = await getCurrentUser();
    const parsed = profileSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
    });

    if (!parsed.success) {
      return { ok: false, message: firstFormError(parsed.error) };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        id: { not: user.id },
      },
      select: { id: true },
    });

    if (existingEmail) {
      return { ok: false, message: "Este email ya está asociado a otra cuenta." };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
        },
      }),
      prisma.customer.updateMany({
        where: { userId: user.id },
        data: { email: parsed.data.email },
      }),
    ]);

    revalidatePath("/cuenta");
    return { ok: true, message: "Datos actualizados correctamente. Si has cambiado el email, vuelve a iniciar sesión para refrescar la sesión." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se han podido guardar los cambios." };
  }
}

export async function updateAccountPassword(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  try {
    const user = await getCurrentUser();
    const parsed = passwordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return { ok: false, message: firstFormError(parsed.error) };
    }

    if (!user.passwordHash) {
      return { ok: false, message: "Esta cuenta no tiene contraseña local configurada." };
    }

    const validCurrentPassword = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);

    if (!validCurrentPassword) {
      return { ok: false, message: "La contraseña actual no es correcta." };
    }

    const samePassword = await bcrypt.compare(parsed.data.newPassword, user.passwordHash);

    if (samePassword) {
      return { ok: false, message: "La nueva contraseña debe ser diferente a la actual." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { ok: true, message: "Contraseña actualizada correctamente." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se ha podido actualizar la contraseña." };
  }
}

export async function updateBillingData(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  try {
    const user = await getCurrentUser();
    const parsed = billingSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      companyName: formData.get("companyName"),
      taxId: formData.get("taxId"),
      phone: formData.get("phone"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      postalCode: formData.get("postalCode"),
      city: formData.get("city"),
      province: formData.get("province"),
      country: formData.get("country"),
    });

    if (!parsed.success) {
      return { ok: false, message: firstFormError(parsed.error) };
    }

    const billingAddress = {
      addressLine1: emptyToNull(parsed.data.addressLine1),
      addressLine2: emptyToNull(parsed.data.addressLine2),
      postalCode: emptyToNull(parsed.data.postalCode),
      city: emptyToNull(parsed.data.city),
      province: emptyToNull(parsed.data.province),
      country: emptyToNull(parsed.data.country) ?? "España",
    };

    await prisma.customer.upsert({
      where: { userId: user.id },
      update: {
        email: user.email ?? "",
        firstName: emptyToNull(parsed.data.firstName),
        lastName: emptyToNull(parsed.data.lastName),
        companyName: emptyToNull(parsed.data.companyName),
        taxId: emptyToNull(parsed.data.taxId),
        phone: emptyToNull(parsed.data.phone),
        billingAddress,
      },
      create: {
        userId: user.id,
        email: user.email ?? `cliente-${user.id}@bogerdpro.local`,
        firstName: emptyToNull(parsed.data.firstName),
        lastName: emptyToNull(parsed.data.lastName),
        companyName: emptyToNull(parsed.data.companyName),
        taxId: emptyToNull(parsed.data.taxId),
        phone: emptyToNull(parsed.data.phone),
        billingAddress,
      },
    });

    revalidatePath("/cuenta");
    return { ok: true, message: "Datos de facturación guardados correctamente." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se han podido guardar los datos de facturación." };
  }
}

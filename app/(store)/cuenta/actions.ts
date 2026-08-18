"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { getCurrentDictionary } from "@/lib/i18n/locale";

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

const shippingSchema = z.object({
  sameAsBilling: z.boolean(),
  contactName: z.string().trim().max(140, "El contacto es demasiado largo.").optional(),
  companyName: z.string().trim().max(160, "La empresa es demasiado larga.").optional(),
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
    const labels = (await getCurrentDictionary()).account.actions;
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
      return { ok: false, message: labels.emailExists };
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
    return { ok: true, message: labels.profileSaved };
  } catch (error) {
    const labels = (await getCurrentDictionary()).account.actions;
    return { ok: false, message: error instanceof Error ? error.message : labels.profileError };
  }
}

export async function updateAccountPassword(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  try {
    const labels = (await getCurrentDictionary()).account.actions;
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
      return { ok: false, message: labels.noLocalPassword };
    }

    const validCurrentPassword = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);

    if (!validCurrentPassword) {
      return { ok: false, message: labels.currentPasswordInvalid };
    }

    const samePassword = await bcrypt.compare(parsed.data.newPassword, user.passwordHash);

    if (samePassword) {
      return { ok: false, message: labels.newPasswordMustDiffer };
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { ok: true, message: labels.passwordSaved };
  } catch (error) {
    const labels = (await getCurrentDictionary()).account.actions;
    return { ok: false, message: error instanceof Error ? error.message : labels.passwordError };
  }
}

export async function updateBillingData(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  try {
    const labels = (await getCurrentDictionary()).account.actions;
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
    return { ok: true, message: labels.billingSaved };
  } catch (error) {
    const labels = (await getCurrentDictionary()).account.actions;
    return { ok: false, message: error instanceof Error ? error.message : labels.billingError };
  }
}

export async function updateShippingData(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  try {
    const labels = (await getCurrentDictionary()).account.actions;
    const user = await getCurrentUser();
    const parsed = shippingSchema.safeParse({
      sameAsBilling: formData.get("sameAsBilling") === "on",
      contactName: formData.get("contactName"),
      companyName: formData.get("companyName"),
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

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
      select: { billingAddress: true, firstName: true, lastName: true, companyName: true, phone: true },
    });

    const billingAddress = customer?.billingAddress && typeof customer.billingAddress === "object" && !Array.isArray(customer.billingAddress)
      ? customer.billingAddress as Record<string, unknown>
      : {};

    const shippingAddress = parsed.data.sameAsBilling
      ? {
          contactName: [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || null,
          companyName: customer?.companyName ?? null,
          phone: customer?.phone ?? null,
          addressLine1: typeof billingAddress.addressLine1 === "string" ? billingAddress.addressLine1 : null,
          addressLine2: typeof billingAddress.addressLine2 === "string" ? billingAddress.addressLine2 : null,
          postalCode: typeof billingAddress.postalCode === "string" ? billingAddress.postalCode : null,
          city: typeof billingAddress.city === "string" ? billingAddress.city : null,
          province: typeof billingAddress.province === "string" ? billingAddress.province : null,
          country: typeof billingAddress.country === "string" ? billingAddress.country : "España",
        }
      : {
          contactName: emptyToNull(parsed.data.contactName),
          companyName: emptyToNull(parsed.data.companyName),
          phone: emptyToNull(parsed.data.phone),
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
        shippingAddress,
      },
      create: {
        userId: user.id,
        email: user.email ?? `cliente-${user.id}@bogerdpro.local`,
        shippingAddress,
      },
    });

    revalidatePath("/cuenta");
    return { ok: true, message: labels.shippingSaved };
  } catch (error) {
    const labels = (await getCurrentDictionary()).account.actions;
    return { ok: false, message: error instanceof Error ? error.message : labels.shippingError };
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export type BrandDiscountMap = Record<string, number>;

export function normalizeDiscountPercent(percent: number) {
  return Math.max(0, Math.min(100, Math.floor(percent)));
}

export function applyDiscountCents(cents: number, percent?: number | null) {
  if (!percent) return cents;
  const safePercent = normalizeDiscountPercent(percent);
  return Math.max(0, Math.round((cents * (100 - safePercent)) / 100));
}

export function applyDiscountRange(min?: number | null, max?: number | null, percent?: number | null) {
  return {
    min: typeof min === "number" ? applyDiscountCents(min, percent) : min,
    max: typeof max === "number" ? applyDiscountCents(max, percent) : max,
  };
}

export async function getCurrentUserBrandDiscounts(): Promise<BrandDiscountMap> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {};
  }

  const discounts = await prisma.userBrandDiscount.findMany({
    where: { userId: session.user.id },
    select: { brandId: true, percent: true },
  });

  return Object.fromEntries(discounts.map((discount) => [discount.brandId, normalizeDiscountPercent(discount.percent)]));
}

const requiredForProduction = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

const recommendedForProduction = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "ORDER_NOTIFICATION_EMAIL",
] as const;

function missing(keys: readonly string[]) {
  return keys.filter((key) => !process.env[key]);
}

export function validateProductionEnv() {
  const missingRequired = missing(requiredForProduction);
  const missingRecommended = missing(recommendedForProduction);

  return {
    ok: missingRequired.length === 0,
    missingRequired,
    missingRecommended,
  };
}

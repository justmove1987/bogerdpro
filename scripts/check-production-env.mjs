import { config } from "dotenv";

config({ path: ".env" });

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const recommended = ["RESEND_API_KEY", "EMAIL_FROM", "ORDER_NOTIFICATION_EMAIL"];

const missingRequired = required.filter((key) => !process.env[key]);
const missingRecommended = recommended.filter((key) => !process.env[key]);

if (missingRequired.length) {
  console.error(`Missing required environment variables: ${missingRequired.join(", ")}`);
  process.exit(1);
}

if (missingRecommended.length) {
  console.warn(`Missing recommended environment variables: ${missingRecommended.join(", ")}`);
}

console.log("Production environment variables look ready.");

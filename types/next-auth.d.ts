import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      accountApproved?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    accountApproved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    accountApproved?: boolean;
  }
}

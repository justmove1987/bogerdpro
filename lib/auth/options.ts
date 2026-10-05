import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email y contraseña",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { customer: { select: { approvedAt: true } } },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const validPassword = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!validPassword) {
          return null;
        }

        if (user.role !== "ADMIN" && !user.customer?.approvedAt) {
          throw new Error("PENDING_APPROVAL");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountApproved: user.role === "ADMIN" || Boolean(user.customer?.approvedAt),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accountApproved = user.accountApproved;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.accountApproved = token.accountApproved;

        if (token.sub) {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { name: true, email: true, role: true, customer: { select: { approvedAt: true } } },
          });

          if (freshUser) {
            session.user.name = freshUser.name;
            session.user.email = freshUser.email;
            session.user.role = freshUser.role;
            session.user.accountApproved = freshUser.role === "ADMIN" || Boolean(freshUser.customer?.approvedAt);
          }
        }
      }

      return session;
    },
  },
};

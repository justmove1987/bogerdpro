"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-4 text-sm font-semibold text-[#151515] transition hover:border-[#151515]"
    >
      Cerrar sesión
    </button>
  );
}

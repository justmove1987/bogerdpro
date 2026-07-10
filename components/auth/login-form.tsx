"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl = "/cuenta" }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">BogerdPro</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Acceso cliente</h1>
      <p className="mt-3 text-sm leading-6 text-[#62615d]">
        Inicia sesión para consultar condiciones especiales, descuentos aplicados y futuras ventajas para empresas.
      </p>

      <label className="mt-6 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input id="email" name="email" type="email" className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="email" required />

      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Contraseña
      </label>
      <input id="password" name="password" type="password" className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="current-password" required />

      {error ? <p className="mt-4 rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button type="submit" className="premium-focus mt-6 h-11 w-full rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black" style={{ color: "#ffffff" }}>
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

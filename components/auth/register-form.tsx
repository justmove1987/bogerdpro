"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";

type RegisterFormProps = {
  callbackUrl?: string;
  labels: Dictionary["auth"];
};

export function RegisterForm({ callbackUrl = "/cuenta", labels }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          companyName: formData.get("companyName"),
          password,
          confirmPassword: formData.get("confirmPassword"),
          marketingAccepted: formData.get("marketingAccepted") === "on",
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : labels.registerError);
        return;
      }

      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login?callbackUrl=/cuenta");
        router.refresh();
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">BogerdPro</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{labels.registerTitle}</h1>
      <p className="mt-3 text-sm leading-6 text-[#62615d]">{labels.registerText}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium" htmlFor="firstName">
          {labels.firstName}
          <input id="firstName" name="firstName" type="text" className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="given-name" required />
        </label>

        <label className="block text-sm font-medium" htmlFor="lastName">
          {labels.lastName}
          <input id="lastName" name="lastName" type="text" className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="family-name" required />
        </label>

        <label className="block text-sm font-medium" htmlFor="email">
          Email
          <input id="email" name="email" type="email" className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="email" required />
        </label>

        <label className="block text-sm font-medium" htmlFor="phone">
          {labels.phone}
          <input id="phone" name="phone" type="tel" className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="tel" />
        </label>

        <label className="block text-sm font-medium sm:col-span-2" htmlFor="companyName">
          {labels.company}
          <input id="companyName" name="companyName" type="text" className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="organization" />
        </label>

        <label className="block text-sm font-medium" htmlFor="password">
          {labels.password}
          <input id="password" name="password" type="password" minLength={8} className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="new-password" required />
        </label>

        <label className="block text-sm font-medium" htmlFor="confirmPassword">
          {labels.confirmPassword}
          <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" autoComplete="new-password" required />
        </label>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#62615d]">
        <input name="marketingAccepted" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
        {labels.marketingAccepted}
      </label>

      {error ? <p className="mt-4 rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button type="submit" disabled={isPending} className="premium-focus mt-6 h-11 w-full rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60" style={{ color: "#ffffff" }}>
        {isPending ? labels.creatingAccount : labels.createAccount}
      </button>

      <p className="mt-5 text-center text-sm text-[#62615d]">
        {labels.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
          {labels.loginButton}
        </Link>
      </p>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

type ContactFormLabels = Dictionary["contact"];

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            company: formData.get("company"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            message: formData.get("message"),
          }),
        });

        if (!response.ok) {
          setMessage({ type: "error", text: labels.error });
          return;
        }

        form.reset();
        setMessage({ type: "success", text: labels.success });
      } catch {
        setMessage({ type: "error", text: labels.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 grid gap-4" aria-label="Formulario de contacto">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[#151515]">
          {labels.name}
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal"
            placeholder={labels.namePlaceholder}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#151515]">
          {labels.company}
          <input
            name="company"
            maxLength={160}
            className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal"
            placeholder={labels.companyPlaceholder}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[#151515]">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal"
            placeholder="empresa@email.com"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#151515]">
          {labels.phone}
          <input
            name="phone"
            maxLength={50}
            className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal"
            placeholder={labels.phonePlaceholder}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-[#151515]">
        {labels.message}
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          className="premium-focus min-h-36 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 py-3 text-sm font-normal leading-6"
          placeholder={labels.messagePlaceholder}
        />
      </label>
      {message ? (
        <p className={`rounded-[var(--radius-sm)] px-3 py-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="premium-focus mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={17} />
        {isPending ? labels.sending : labels.send}
      </button>
      <p className="text-xs leading-5 text-[#62615d]">{labels.privacyNote}</p>
    </form>
  );
}

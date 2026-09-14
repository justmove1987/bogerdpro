"use client";

import { useActionState } from "react";
import { saveProductImageState, type ProductImageFormState } from "@/app/admin/actions";

const inputClass = "premium-focus h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#151515]">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const initialState: ProductImageFormState = { ok: false, message: "" };

export function ProductImageForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(saveProductImageState, initialState);

  return (
    <form action={formAction} className="mt-5 grid gap-3 rounded-[var(--radius-sm)] bg-[#f7f5f0] p-4 md:grid-cols-[1fr_1fr_100px_auto] md:items-end">
      <input type="hidden" name="productId" value={productId} />
      <Field label="Subir archivo">
        <input className={inputClass} name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
      </Field>
      <Field label="O URL de imagen">
        <input className={inputClass} name="url" placeholder="https://... o /images/..." />
      </Field>
      <Field label="Orden">
        <input className={inputClass} name="position" type="number" defaultValue="0" />
      </Field>
      <Field label="Alt">
        <input className={inputClass} name="alt" placeholder="Descripción breve" />
      </Field>
      <div className="grid gap-3 md:col-span-4">
        {state.message ? (
          <p className={`rounded-[var(--radius-sm)] px-3 py-2 text-sm ${state.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {state.message}
          </p>
        ) : null}
        <button className="h-11 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isPending}>
          {isPending ? "Subiendo imagen..." : "Añadir imagen"}
        </button>
      </div>
    </form>
  );
}

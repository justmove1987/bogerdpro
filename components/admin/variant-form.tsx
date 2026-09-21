"use client";

import { useActionState } from "react";
import { deleteVariant, saveVariantState, type ProductVariantFormState } from "@/app/admin/actions";
import { centsToEuros } from "@/lib/admin/utils";

const inputClass = "premium-focus h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm";
const initialState: ProductVariantFormState = { ok: false, message: "" };

type VariantFormVariant = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  size: string | null;
  priceCents: number;
  stock: number;
  isActive: boolean;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#151515]">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function VariantForm({ productId, variant }: { productId: string; variant?: VariantFormVariant }) {
  const [state, formAction, isPending] = useActionState(saveVariantState, initialState);
  const isNew = !variant;

  return (
    <form action={formAction} className={isNew ? "mt-5 grid gap-3 rounded-[var(--radius-sm)] bg-[#f7f5f0] p-4 md:grid-cols-3" : "grid gap-3 rounded-[var(--radius-sm)] border border-[#e7e2d8] p-3 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_0.7fr_auto] md:items-end"}>
      <input type="hidden" name="id" value={variant?.id ?? ""} />
      <input type="hidden" name="productId" value={productId} />
      <Field label="SKU"><input className={inputClass} name="sku" defaultValue={variant?.sku ?? ""} required /></Field>
      <Field label="Nombre"><input className={inputClass} name="name" defaultValue={variant?.name ?? ""} /></Field>
      <Field label="Color"><input className={inputClass} name="color" defaultValue={variant?.color ?? ""} /></Field>
      <Field label="Talla"><input className={inputClass} name="size" defaultValue={variant?.size ?? ""} /></Field>
      <Field label="Precio €"><input className={inputClass} name="price" type="text" inputMode="decimal" defaultValue={variant ? centsToEuros(variant.priceCents) : ""} required /></Field>
      <input type="hidden" name="stock" value={variant?.stock ?? 999} />
      <label className={`flex items-center gap-2 text-sm font-medium ${isNew ? "" : "pb-3"}`}>
        <input name="isActive" type="checkbox" defaultChecked={variant?.isActive ?? true} className="h-4 w-4 accent-[var(--accent)]" />
        Variante disponible
      </label>
      {state.message ? (
        <p className={`rounded-[var(--radius-sm)] px-3 py-2 text-sm ${state.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} ${isNew ? "md:col-span-3" : "md:col-span-7"}`}>
          {state.message}
        </p>
      ) : null}
      <div className={`flex gap-2 ${isNew ? "md:col-span-3" : "md:col-span-7"}`}>
        <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : isNew ? "Añadir variante" : "Guardar variante"}
        </button>
        {!isNew ? (
          <button formAction={deleteVariant} className="h-10 rounded-[var(--radius-sm)] border border-red-200 px-4 text-sm font-semibold text-red-600" type="submit">
            Eliminar
          </button>
        ) : null}
      </div>
    </form>
  );
}

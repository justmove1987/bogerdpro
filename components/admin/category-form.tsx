"use client";
import { useActionState, useState } from "react";
import { deleteCategoryState, saveCategoryState } from "@/app/admin/actions";
import { categoryDescendants, categoryPath, type CategoryNode } from "@/lib/catalog/category-tree";

const sectors = [["general", "Catálogos generales"], ["high-visibility", "Alta visibilidad"], ["footwear", "Calzado de trabajo"], ["protective-equipment", "Equipos de protección"], ["hospitality", "Hostelería y restauración"], ["industry", "Industria, construcción y logística"], ["healthcare", "Sanidad y servicios"], ["sport-promo", "Sport, casual, promo y eventos"]];
const inputClass = "mt-1 h-10 w-full rounded border border-neutral-300 bg-white px-3 text-sm";
type Category = CategoryNode & { slug: string; description: string | null };

export function CategoryForm({ category, categories }: { category?: Category; categories: Category[] }) {
  const [state, action, pending] = useActionState(saveCategoryState, { ok: false, message: "" });
  const excluded = category ? categoryDescendants(categories, category.id) : new Set<string>();
  return <form action={action} className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-2">
    <input type="hidden" name="id" value={category?.id ?? ""} />
    <label className="text-sm">Nombre<input className={inputClass} name="name" defaultValue={category?.name ?? ""} required /></label>
    <label className="text-sm">Slug<input className={inputClass} name="slug" defaultValue={category?.slug ?? ""} placeholder="Se genera a partir del nombre" /></label>
    <label className="text-sm">Categoría padre<select className={inputClass} name="parentId" defaultValue={category?.parentId ?? ""}>
      <option value="">Sin padre (categoría principal)</option>
      {categories.filter((item) => !excluded.has(item.id)).map((item) => <option key={item.id} value={item.id}>{categoryPath(categories, item.id)}</option>)}
    </select></label>
    <label className="text-sm">Catálogo de la tienda<select className={inputClass} name="catalogGroup" defaultValue={category?.catalogGroup ?? ""}>
      <option value="">Heredar del padre; automático si no tiene catálogo</option>
      {sectors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select></label>
    <label className="text-sm md:col-span-2">Descripción<input className={inputClass} name="description" defaultValue={category?.description ?? ""} /></label>
    <p className="text-xs text-neutral-600 md:col-span-2">El catálogo se hereda en las subcategorías y tiene prioridad sobre la clasificación automática del proveedor.</p>
    {state.message && <p role="status" className={`text-sm md:col-span-2 ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
    <button disabled={pending} className="rounded bg-[#151515] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 md:col-span-2">{pending ? "Guardando..." : category ? "Guardar cambios" : "Crear categoría"}</button>
  </form>;
}

export function DeleteCategoryForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteCategoryState, { ok: false, message: "" });
  const [confirmed, setConfirmed] = useState(false);
  return <form action={action} className="mt-3 text-sm">
    <input type="hidden" name="id" value={id} />
    <label className="mr-3"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Confirmar eliminación</label>
    <button disabled={!confirmed || pending} className="text-red-700 disabled:opacity-40">Eliminar categoría vacía</button>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}

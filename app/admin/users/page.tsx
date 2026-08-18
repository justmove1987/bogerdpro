import { Percent, Trash2 } from "lucide-react";
import { deleteUser, deleteUserBrandDiscount, saveUserBrandDiscount, saveUserProfile } from "@/app/admin/actions";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const inputClass = "premium-focus h-10 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm";
const labelClass = "text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]";

export default async function AdminUsersPage() {
  const [users, brands] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: true,
        brandDiscounts: {
          orderBy: { brand: { name: "asc" } },
          include: { brand: true },
        },
        _count: { select: { orders: true } },
      },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Usuarios</h1>
      <p className="mt-2 text-sm text-[#62615d]">
        Gestiona datos de usuarios registrados y descuentos por marca que se aplican en catálogo, carrito y checkout.
      </p>

      <div className="mt-6 grid gap-5">
        {users.map((user) => (
          <section key={user.id} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
            <div className="flex flex-col gap-3 border-b border-[#eee9df] pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{user.name ?? user.email ?? "Usuario sin nombre"}</h2>
                <p className="mt-1 text-sm text-[#62615d]">{user.email ?? "Sin email"} · {user.role} · {user._count.orders} pedidos</p>
              </div>
              <form action={deleteUser}>
                <input type="hidden" name="id" value={user.id} />
                <button className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50" type="submit">
                  <Trash2 size={15} />
                  Borrar usuario
                </button>
              </form>
            </div>

            <form action={saveUserProfile} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input type="hidden" name="id" value={user.id} />
              <label>
                <span className={labelClass}>Nombre</span>
                <input className={`${inputClass} mt-1`} name="name" defaultValue={user.name ?? ""} />
              </label>
              <label>
                <span className={labelClass}>Email</span>
                <input className={`${inputClass} mt-1`} name="email" type="email" defaultValue={user.email ?? ""} required />
              </label>
              <label>
                <span className={labelClass}>Empresa</span>
                <input className={`${inputClass} mt-1`} name="companyName" defaultValue={user.customer?.companyName ?? ""} />
              </label>
              <label>
                <span className={labelClass}>Teléfono</span>
                <input className={`${inputClass} mt-1`} name="phone" defaultValue={user.customer?.phone ?? ""} />
              </label>
              <label>
                <span className={labelClass}>NIF/CIF</span>
                <input className={`${inputClass} mt-1`} name="taxId" defaultValue={user.customer?.taxId ?? ""} />
              </label>
              <div className="md:col-span-2 xl:col-span-5">
                <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white" type="submit">
                  Guardar datos
                </button>
              </div>
            </form>

            <div className="mt-6 rounded-[var(--radius-sm)] bg-[#f7f5f0] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Percent size={16} className="text-[var(--accent)]" />
                Descuentos por marca
              </h3>
              <form action={saveUserBrandDiscount} className="mt-3 grid gap-3 md:grid-cols-[1fr_140px_auto]">
                <input type="hidden" name="userId" value={user.id} />
                <select className={inputClass} name="brandId" required defaultValue="">
                  <option value="" disabled>Selecciona marca</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                <input className={inputClass} name="percent" type="number" min={1} max={100} step={1} placeholder="%" required />
                <button className="h-10 rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 text-sm font-semibold text-white" type="submit">
                  Aplicar
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {user.brandDiscounts.map((discount) => (
                  <form key={discount.id} action={deleteUserBrandDiscount} className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c5] bg-white px-3 py-1 text-sm">
                    <input type="hidden" name="id" value={discount.id} />
                    <span className="font-semibold">{discount.brand.name}</span>
                    <span className="text-[var(--accent)]">-{discount.percent}%</span>
                    <button className="text-red-600" type="submit" aria-label={`Eliminar descuento ${discount.brand.name}`}>
                      <Trash2 size={14} />
                    </button>
                  </form>
                ))}
                {user.brandDiscounts.length === 0 ? (
                  <p className="text-sm text-[#62615d]">Este usuario no tiene descuentos asignados.</p>
                ) : null}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

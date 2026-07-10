import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { authOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/cuenta");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Mi cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Área cliente</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#62615d]">
        Desde aquí se gestionarán las condiciones especiales, descuentos por cliente, pedidos y documentación asociada.
      </p>

      <section className="mt-8 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Nombre</dt>
            <dd className="mt-1 text-base font-semibold">{session.user.name ?? "Cliente BogerdPro"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Email</dt>
            <dd className="mt-1 text-base font-semibold">{session.user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Tipo de cuenta</dt>
            <dd className="mt-1 text-base font-semibold">{isAdmin ? "Administrador" : "Cliente"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Descuentos</dt>
            <dd className="mt-1 text-base font-semibold">Pendiente de configuración</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          {isAdmin ? (
            <Link href="/admin" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition hover:bg-black" style={{ color: "#ffffff" }}>
              Panel de administración
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

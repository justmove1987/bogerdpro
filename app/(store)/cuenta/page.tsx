import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AccountOrdersHistory } from "@/components/account/account-orders-history";
import type { AccountBillingData } from "@/components/account/account-settings-forms";
import { AccountSettingsForms } from "@/components/account/account-settings-forms";
import { LogoutButton } from "@/components/auth/logout-button";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/cuenta");
  }

  const isAdmin = session.user.role === "ADMIN";
  const user = session.user.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              companyName: true,
              taxId: true,
              phone: true,
              billingAddress: true,
            },
          },
        },
      })
    : null;

  const name = user?.name ?? session.user.name ?? "Cliente BogerdPro";
  const email = user?.email ?? session.user.email ?? "";
  const billingAddress = user?.customer?.billingAddress && typeof user.customer.billingAddress === "object" && !Array.isArray(user.customer.billingAddress)
    ? user.customer.billingAddress as Partial<AccountBillingData>
    : {};
  const billing: AccountBillingData = {
    firstName: user?.customer?.firstName ?? "",
    lastName: user?.customer?.lastName ?? "",
    companyName: user?.customer?.companyName ?? "",
    taxId: user?.customer?.taxId ?? "",
    phone: user?.customer?.phone ?? "",
    addressLine1: billingAddress.addressLine1 ?? "",
    addressLine2: billingAddress.addressLine2 ?? "",
    postalCode: billingAddress.postalCode ?? "",
    city: billingAddress.city ?? "",
    province: billingAddress.province ?? "",
    country: billingAddress.country ?? "España",
  };
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        ...(session.user.id ? [{ userId: session.user.id }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Mi cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Área cliente</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#62615d]">
        Gestiona tus datos de acceso, condiciones especiales, descuentos por cliente, pedidos y documentación asociada.
      </p>

      <section className="mt-8 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Nombre</dt>
            <dd className="mt-1 text-base font-semibold">{name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Email</dt>
            <dd className="mt-1 text-base font-semibold">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Tipo de cuenta</dt>
            <dd className="mt-1 text-base font-semibold">{isAdmin ? "Administrador" : "Cliente"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Descuentos</dt>
            <dd className="mt-1 text-base font-semibold">Pendiente de configuración</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Empresa</dt>
            <dd className="mt-1 text-base font-semibold">{user?.customer?.companyName ?? "No indicada"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Teléfono</dt>
            <dd className="mt-1 text-base font-semibold">{user?.customer?.phone ?? "No indicado"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">NIF/CIF</dt>
            <dd className="mt-1 text-base font-semibold">{user?.customer?.taxId ?? "No indicado"}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          {isAdmin ? (
            <Link
              href="/admin"
              className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition hover:bg-black"
              style={{ color: "#ffffff" }}
            >
              Panel de administración
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </section>

      <AccountOrdersHistory orders={orders} />
      <AccountSettingsForms name={name} email={email} billing={billing} />
    </main>
  );
}

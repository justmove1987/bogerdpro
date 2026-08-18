import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AccountOrdersHistory } from "@/components/account/account-orders-history";
import type { AccountBillingData, AccountShippingData } from "@/components/account/account-settings-forms";
import { AccountSettingsForms } from "@/components/account/account-settings-forms";
import { LogoutButton } from "@/components/auth/logout-button";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { getCurrentDictionary, getCurrentLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const dictionary = await getCurrentDictionary();
  const locale = await getCurrentLocale();

  if (!session?.user) {
    redirect("/login?callbackUrl=/cuenta");
  }

  const isAdmin = session.user.role === "ADMIN";
  const accountType = isAdmin ? dictionary.account.admin : dictionary.account.customer;
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
              shippingAddress: true,
            },
          },
        },
      })
    : null;

  const name = user?.name ?? session.user.name ?? dictionary.account.defaultCustomerName;
  const email = user?.email ?? session.user.email ?? "";
  const billingAddress = user?.customer?.billingAddress && typeof user.customer.billingAddress === "object" && !Array.isArray(user.customer.billingAddress)
    ? user.customer.billingAddress as Partial<AccountBillingData>
    : {};
  const shippingAddress = user?.customer?.shippingAddress && typeof user.customer.shippingAddress === "object" && !Array.isArray(user.customer.shippingAddress)
    ? user.customer.shippingAddress as Partial<AccountShippingData>
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
  const shipping: AccountShippingData = {
    contactName: shippingAddress.contactName ?? "",
    companyName: shippingAddress.companyName ?? "",
    phone: shippingAddress.phone ?? "",
    addressLine1: shippingAddress.addressLine1 ?? "",
    addressLine2: shippingAddress.addressLine2 ?? "",
    postalCode: shippingAddress.postalCode ?? "",
    city: shippingAddress.city ?? "",
    province: shippingAddress.province ?? "",
    country: shippingAddress.country ?? billing.country ?? "España",
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
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{dictionary.account.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{dictionary.account.title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#62615d]">
        {dictionary.account.intro}
      </p>

      <section className="mt-8 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">{dictionary.account.name}</dt>
            <dd className="mt-1 text-base font-semibold">{name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Email</dt>
            <dd className="mt-1 text-base font-semibold">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">{dictionary.account.accountType}</dt>
            <dd className="mt-1 text-base font-semibold">{accountType}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">{dictionary.account.discounts}</dt>
            <dd className="mt-1 text-base font-semibold">{dictionary.account.pendingSetup}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">{dictionary.account.company}</dt>
            <dd className="mt-1 text-base font-semibold">{user?.customer?.companyName ?? dictionary.account.notProvidedFemale}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">{dictionary.account.phone}</dt>
            <dd className="mt-1 text-base font-semibold">{user?.customer?.phone ?? dictionary.account.notProvidedMale}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">NIF/CIF</dt>
            <dd className="mt-1 text-base font-semibold">{user?.customer?.taxId ?? dictionary.account.notProvidedMale}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          {isAdmin ? (
            <Link
              href="/admin"
              className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition hover:bg-black"
              style={{ color: "#ffffff" }}
            >
              {dictionary.account.adminPanel}
            </Link>
          ) : null}
          <LogoutButton label={dictionary.account.logout} />
        </div>
      </section>

      <AccountOrdersHistory
        orders={orders.map((order) => ({
          ...order,
          createdAtLabel: order.createdAt.toLocaleDateString(locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : locale === "ca" ? "ca-ES" : "es-ES"),
          searchText: [
            order.orderNumber,
            order.createdAt.toLocaleDateString(locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : locale === "ca" ? "ca-ES" : "es-ES"),
            order.status,
            order.paymentStatus,
            ...order.items.flatMap((item) => [item.name, item.sku ?? "", String(item.quantity)]),
          ].join(" ").toLowerCase(),
        }))}
        labels={dictionary.account.orders}
      />
      <AccountSettingsForms name={name} email={email} billing={billing} shipping={shipping} shippingSameAsBilling={!user?.customer?.shippingAddress} labels={dictionary.account.forms} />
    </main>
  );
}

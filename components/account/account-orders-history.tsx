import Link from "next/link";
import { Download, FileText, PackageCheck } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { formatOrderMoney, orderStatusLabels, paymentStatusLabels } from "@/lib/orders/labels";

type AccountOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalCents: number;
  currency: string;
  createdAt: Date;
  items: {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
  }[];
};

type AccountOrdersHistoryProps = {
  orders: AccountOrder[];
};

function canDownloadInvoice(order: AccountOrder) {
  return order.paymentStatus === "PAID" || order.status === "FULFILLED";
}

export function AccountOrdersHistory({ orders }: AccountOrdersHistoryProps) {
  return (
    <section className="mt-8 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Historial</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pedidos y facturas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#62615d]">
            Revisa compras anteriores, solicitudes B2B y descarga facturas cuando estén disponibles.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          <PackageCheck size={14} />
          {orders.length} pedidos
        </span>
      </div>

      {orders.length ? (
        <div className="mt-6 grid gap-4">
          {orders.map((order) => {
            const invoiceAvailable = canDownloadInvoice(order);

            return (
              <article key={order.id} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-[#fdfcf9] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{order.orderNumber}</p>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#62615d]">
                        {order.createdAt.toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#eef6ff] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{orderStatusLabels[order.status]}</span>
                      <span className="rounded-full bg-[#f7f5f0] px-2 py-1 text-xs font-semibold text-[#62615d]">{paymentStatusLabels[order.paymentStatus]}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className="text-xl font-bold">{formatOrderMoney(order.totalCents, order.currency)}</p>
                    {invoiceAvailable ? (
                      <Link
                        href={`/api/account/orders/${order.id}/invoice`}
                        className="premium-focus inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white"
                        style={{ color: "#ffffff" }}
                      >
                        <Download size={16} color="#ffffff" />
                        <span style={{ color: "#ffffff" }}>Descargar factura</span>
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-4 text-sm font-semibold text-[#62615d]">
                        <FileText size={16} />
                        Factura pendiente
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-[#e7e2d8] pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#62615d]">Productos</p>
                  <ul className="mt-3 grid gap-2 text-sm text-[#62615d]">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-[#151515]">{item.name}</span>
                        <span>
                          {item.sku ?? "-"} · Cantidad: {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[var(--radius-md)] border border-dashed border-[#d8d1c5] bg-[#f7f5f0] p-6 text-sm leading-6 text-[#62615d]">
          Todavía no tienes pedidos asociados a esta cuenta. Cuando compres o solicites condiciones especiales, aparecerán aquí.
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Download, FileText, PackageCheck, Search } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { formatOrderMoney } from "@/lib/orders/labels";

type AccountOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalCents: number;
  currency: string;
  createdAtLabel: string;
  searchText: string;
  items: {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
  }[];
};

type AccountOrdersHistoryProps = {
  orders: AccountOrder[];
  labels: {
    historyEyebrow: string;
    ordersTitle: string;
    ordersText: string;
    ordersCount: string;
    orderStatus: Record<string, string>;
    paymentStatus: Record<string, string>;
    searchPlaceholder: string;
    downloadInvoice: string;
    pendingInvoice: string;
    hideProducts: string;
    viewProducts: string;
    quantity: string;
    noSearchResults: string;
    noOrders: string;
  };
};

function canDownloadInvoice(order: AccountOrder) {
  return order.paymentStatus === "PAID" || order.status === "FULFILLED";
}

export function AccountOrdersHistory({ orders, labels }: AccountOrdersHistoryProps) {
  const [query, setQuery] = useState("");
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set());
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOrders = useMemo(
    () => (normalizedQuery ? orders.filter((order) => order.searchText.includes(normalizedQuery)) : orders),
    [normalizedQuery, orders],
  );

  function toggleOrder(orderId: string) {
    setOpenOrders((current) => {
      const next = new Set(current);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  return (
    <section className="mt-8 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{labels.historyEyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{labels.ordersTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#62615d]">
            {labels.ordersText}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          <PackageCheck size={14} />
          {labels.ordersCount.replace("{count}", String(orders.length))}
        </span>
      </div>

      {orders.length ? (
        <label className="mt-6 flex h-12 items-center gap-3 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-4 transition focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
          <Search size={18} className="shrink-0 text-[var(--accent)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-full w-full bg-transparent text-sm outline-none"
            placeholder={labels.searchPlaceholder}
            type="search"
          />
        </label>
      ) : null}

      {orders.length ? (
        <div className="mt-6 grid gap-4">
          {filteredOrders.map((order) => {
            const invoiceAvailable = canDownloadInvoice(order);
            const isOpen = openOrders.has(order.id);

            return (
              <article key={order.id} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-[#fdfcf9] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{order.orderNumber}</p>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#62615d]">
                        {order.createdAtLabel}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#eef6ff] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{labels.orderStatus[order.status] ?? order.status}</span>
                      <span className="rounded-full bg-[#f7f5f0] px-2 py-1 text-xs font-semibold text-[#62615d]">{labels.paymentStatus[order.paymentStatus] ?? order.paymentStatus}</span>
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
                        <span style={{ color: "#ffffff" }}>{labels.downloadInvoice}</span>
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-4 text-sm font-semibold text-[#62615d]">
                        <FileText size={16} />
                        {labels.pendingInvoice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-[#e7e2d8] pt-4">
                  <button
                    type="button"
                    onClick={() => toggleOrder(order.id)}
                    className="premium-focus inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm font-semibold text-[#151515] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isOpen ? labels.hideProducts : `${labels.viewProducts} (${order.items.length})`}
                  </button>
                  {isOpen ? (
                    <ul className="mt-3 grid gap-2 text-sm text-[#62615d]">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex flex-col gap-1 rounded-[var(--radius-sm)] bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium text-[#151515]">{item.name}</span>
                          <span>
                            {item.sku ?? "-"} · {labels.quantity}: {item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            );
          })}
          {filteredOrders.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[#d8d1c5] bg-[#f7f5f0] p-6 text-sm leading-6 text-[#62615d]">
              {labels.noSearchResults}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 rounded-[var(--radius-md)] border border-dashed border-[#d8d1c5] bg-[#f7f5f0] p-6 text-sm leading-6 text-[#62615d]">
          {labels.noOrders}
        </div>
      )}
    </section>
  );
}

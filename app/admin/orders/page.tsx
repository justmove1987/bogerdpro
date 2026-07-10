import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatOrderMoney, orderStatusLabels, paymentStatusLabels } from "@/lib/orders/labels";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: true, customer: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Pedidos</h1>
      <p className="mt-2 text-sm text-[#62615d]">Consulta pedidos, líneas, cliente, pago y estado operativo.</p>

      <div className="mt-6 overflow-hidden rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7f5f0] text-[#62615d]">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Líneas</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-[#e7e2d8]">
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-[var(--accent)]">
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-xs font-normal text-[#62615d]">{order.createdAt.toLocaleDateString("es-ES")}</p>
                </td>
                <td className="px-4 py-3 text-[#62615d]">
                  <p className="font-medium text-[#151515]">{order.customerName ?? order.customer?.companyName ?? "Cliente"}</p>
                  <p className="mt-1 text-xs">{order.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#eef5ff] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{orderStatusLabels[order.status]}</span>
                </td>
                <td className="px-4 py-3 text-[#62615d]">{paymentStatusLabels[order.paymentStatus]}</td>
                <td className="px-4 py-3 font-semibold">{formatOrderMoney(order.totalCents, order.currency)}</td>
                <td className="px-4 py-3 text-[#62615d]">{order.items.length}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-[var(--accent)]">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#62615d]" colSpan={7}>
                  Todavía no hay pedidos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

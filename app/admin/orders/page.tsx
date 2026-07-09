import { prisma } from "@/lib/db/prisma";
import { updateOrderStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const orderStatuses = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];
const paymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

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
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{order.orderNumber}</h2>
                <p className="mt-1 text-sm text-[#62615d]">{order.customerName ?? order.customer?.companyName ?? order.email}</p>
                <p className="mt-1 text-xs text-[#62615d]">{order.email}</p>
              </div>
              <form action={updateOrderStatus} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className="h-10 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm">
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select name="paymentStatus" defaultValue={order.paymentStatus} className="h-10 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm">
                  {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white" type="submit">Guardar</button>
              </form>
            </div>
            <div className="mt-4 overflow-hidden rounded-[var(--radius-sm)] border border-[#e7e2d8]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f7f5f0] text-[#62615d]">
                  <tr>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Cantidad</th>
                    <th className="px-3 py-2">Unitario</th>
                    <th className="px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-[#e7e2d8]">
                      <td className="px-3 py-2 font-medium">{item.name}</td>
                      <td className="px-3 py-2 text-[#62615d]">{item.sku ?? "-"}</td>
                      <td className="px-3 py-2 text-[#62615d]">{item.quantity}</td>
                      <td className="px-3 py-2 text-[#62615d]">{(item.unitCents / 100).toFixed(2)} {order.currency}</td>
                      <td className="px-3 py-2 font-semibold">{(item.totalCents / 100).toFixed(2)} {order.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-3 text-sm">
              <span>Subtotal: {(order.subtotalCents / 100).toFixed(2)} {order.currency}</span>
              <span>IVA: {(order.taxCents / 100).toFixed(2)} {order.currency}</span>
              <span className="font-semibold">Total: {(order.totalCents / 100).toFixed(2)} {order.currency}</span>
            </div>
          </article>
        ))}
        {orders.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[#d8d1c5] bg-white p-8 text-center text-sm text-[#62615d]">
            Todavía no hay pedidos.
          </div>
        ) : null}
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";
import { prisma } from "@/lib/db/prisma";
import { formatOrderMoney, orderStatusLabels, paymentStatusLabels } from "@/lib/orders/labels";

export const dynamic = "force-dynamic";

const orderStatuses = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];
const paymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true, user: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/orders" className="text-sm font-semibold text-[var(--accent)]">Volver a pedidos</Link>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-[#62615d]">
            Pedido creado el {order.createdAt.toLocaleString("es-ES")}
          </p>
        </div>
        <form action={updateOrderStatus} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-4">
          <input type="hidden" name="id" value={order.id} />
          <div className="grid gap-3 sm:grid-cols-[180px_180px_auto]">
            <select name="status" defaultValue={order.status} className="h-10 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm">
              {orderStatuses.map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}
            </select>
            <select name="paymentStatus" defaultValue={order.paymentStatus} className="h-10 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm">
              {paymentStatuses.map((status) => <option key={status} value={status}>{paymentStatusLabels[status]}</option>)}
            </select>
            <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white" type="submit">
              Guardar
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
          <h2 className="text-lg font-semibold">Productos</h2>
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
                    <td className="px-3 py-2 text-[#62615d]">{formatOrderMoney(item.unitCents, order.currency)}</td>
                    <td className="px-3 py-2 font-semibold">{formatOrderMoney(item.totalCents, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="grid h-fit gap-5">
          <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
            <h2 className="text-lg font-semibold">Cliente</h2>
            <div className="mt-4 grid gap-2 text-sm text-[#62615d]">
              <p><span className="font-semibold text-[#151515]">Nombre:</span> {order.customerName ?? order.user?.name ?? "-"}</p>
              <p><span className="font-semibold text-[#151515]">Email:</span> {order.email}</p>
              <p><span className="font-semibold text-[#151515]">Teléfono:</span> {order.customerPhone ?? "-"}</p>
              <p><span className="font-semibold text-[#151515]">Empresa:</span> {order.customerCompany ?? order.customer?.companyName ?? "-"}</p>
              <p><span className="font-semibold text-[#151515]">NIF/CIF:</span> {order.customerTaxId ?? "-"}</p>
            </div>
          </section>

          <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
            <h2 className="text-lg font-semibold">Resumen</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between text-[#62615d]"><span>Estado</span><span>{orderStatusLabels[order.status]}</span></div>
              <div className="flex justify-between text-[#62615d]"><span>Pago</span><span>{paymentStatusLabels[order.paymentStatus]}</span></div>
              <div className="flex justify-between text-[#62615d]"><span>Subtotal</span><span>{formatOrderMoney(order.subtotalCents, order.currency)}</span></div>
              <div className="flex justify-between text-[#62615d]"><span>Envío</span><span>{formatOrderMoney(order.shippingCents, order.currency)}</span></div>
              <div className="flex justify-between text-[#62615d]"><span>IVA</span><span>{formatOrderMoney(order.taxCents, order.currency)}</span></div>
              <div className="flex justify-between border-t border-[#e7e2d8] pt-3 text-lg font-bold"><span>Total</span><span>{formatOrderMoney(order.totalCents, order.currency)}</span></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

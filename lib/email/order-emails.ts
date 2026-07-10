import type { Order, OrderItem } from "@/generated/prisma/client";
import { sendTransactionalEmail } from "@/lib/email/resend";

type OrderWithItems = Order & {
  items: OrderItem[];
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

function orderRows(order: OrderWithItems) {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e7e2d8;">${item.name}</td>
          <td style="padding:12px;border-bottom:1px solid #e7e2d8;">${item.sku ?? "-"}</td>
          <td style="padding:12px;border-bottom:1px solid #e7e2d8;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #e7e2d8;text-align:right;">${money(item.totalCents, order.currency)}</td>
        </tr>
      `,
    )
    .join("");
}

function emailShell(title: string, body: string) {
  return `
    <div style="margin:0;padding:32px;background:#f7f5f0;font-family:Arial,sans-serif;color:#151515;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e7e2d8;border-radius:12px;overflow:hidden;">
        <div style="padding:24px 28px;background:#101820;color:#ffffff;">
          <p style="margin:0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#9fc6f0;">BogerdPro</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">${title}</h1>
        </div>
        <div style="padding:28px;">${body}</div>
      </div>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  if (order.email.endsWith("@bogerdpro.local")) return;

  const html = emailShell(
    `Pedido ${order.orderNumber} confirmado`,
    `
      <p style="margin:0 0 18px;line-height:1.6;color:#62615d;">Gracias por tu compra. Hemos recibido el pago correctamente y prepararemos tu pedido.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f7f5f0;color:#62615d;">
            <th style="padding:12px;text-align:left;">Producto</th>
            <th style="padding:12px;text-align:left;">SKU</th>
            <th style="padding:12px;text-align:center;">Cantidad</th>
            <th style="padding:12px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${orderRows(order)}</tbody>
      </table>
      <p style="margin:22px 0 0;text-align:right;font-size:18px;font-weight:700;">Total: ${money(order.totalCents, order.currency)}</p>
    `,
  );

  return sendTransactionalEmail({
    to: order.email,
    subject: `Confirmación de pedido ${order.orderNumber}`,
    html,
    text: `Pedido ${order.orderNumber} confirmado. Total: ${money(order.totalCents, order.currency)}.`,
  });
}

export async function sendAdminOrderNotificationEmail(order: OrderWithItems) {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = emailShell(
    `Nuevo pedido pagado: ${order.orderNumber}`,
    `
      <p style="margin:0 0 18px;line-height:1.6;color:#62615d;">Cliente: ${order.customerName ?? "-"} · ${order.email}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f7f5f0;color:#62615d;">
            <th style="padding:12px;text-align:left;">Producto</th>
            <th style="padding:12px;text-align:left;">SKU</th>
            <th style="padding:12px;text-align:center;">Cantidad</th>
            <th style="padding:12px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${orderRows(order)}</tbody>
      </table>
      <p style="margin:22px 0 0;text-align:right;font-size:18px;font-weight:700;">Total: ${money(order.totalCents, order.currency)}</p>
    `,
  );

  return sendTransactionalEmail({
    to: adminEmail,
    subject: `Nuevo pedido pagado ${order.orderNumber}`,
    html,
    text: `Nuevo pedido pagado ${order.orderNumber}. Total: ${money(order.totalCents, order.currency)}.`,
  });
}

export async function sendOrderPaidEmails(order: OrderWithItems) {
  const results = await Promise.allSettled([
    sendOrderConfirmationEmail(order),
    sendAdminOrderNotificationEmail(order),
  ]);

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[email:error]", result.reason);
    }
  });
}

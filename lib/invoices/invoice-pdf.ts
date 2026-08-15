import PDFDocument from "pdfkit";
import type { Order, OrderItem } from "@/generated/prisma/client";
import { formatOrderMoney, orderStatusLabels, paymentStatusLabels } from "@/lib/orders/labels";

type InvoiceOrder = Order & {
  items: OrderItem[];
};

function collectPdfBuffer(document: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
}

function safeText(value: string | null | undefined, fallback = "-") {
  return value?.trim() || fallback;
}

export async function generateInvoicePdf(order: InvoiceOrder) {
  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Factura ${order.orderNumber}` } });
  const bufferPromise = collectPdfBuffer(doc);
  const rightX = 360;

  doc.font("Helvetica-Bold").fontSize(22).fillColor("#101820").text("BogerdPro", 48, 48);
  doc.font("Helvetica").fontSize(10).fillColor("#62615d").text("Vestuario laboral y equipos de protección individual", 48, 76);
  doc.text("Av. Montgó 68 B, 17130 L'Escala, Girona", 48, 92);
  doc.text("info@bogerdpro.com · (+34) 621 22 87 09", 48, 108);

  doc.font("Helvetica-Bold").fontSize(18).fillColor("#101820").text("Factura / comprobante", rightX, 48, { align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#62615d").text(`Pedido: ${order.orderNumber}`, rightX, 76, { align: "right" });
  doc.text(`Fecha: ${order.createdAt.toLocaleDateString("es-ES")}`, rightX, 92, { align: "right" });
  doc.text(`Estado: ${orderStatusLabels[order.status]}`, rightX, 108, { align: "right" });
  doc.text(`Pago: ${paymentStatusLabels[order.paymentStatus]}`, rightX, 124, { align: "right" });

  doc.moveTo(48, 156).lineTo(547, 156).strokeColor("#e7e2d8").stroke();

  doc.font("Helvetica-Bold").fontSize(12).fillColor("#101820").text("Cliente", 48, 180);
  doc.font("Helvetica").fontSize(10).fillColor("#62615d");
  doc.text(safeText(order.customerName, "Cliente BogerdPro"), 48, 202);
  doc.text(safeText(order.customerCompany), 48, 218);
  doc.text(safeText(order.customerTaxId), 48, 234);
  doc.text(safeText(order.email), 48, 250);
  doc.text(safeText(order.customerPhone), 48, 266);

  const tableTop = 310;
  doc.roundedRect(48, tableTop - 12, 499, 30, 6).fill("#f7f5f0");
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#62615d");
  doc.text("Producto", 60, tableTop);
  doc.text("SKU", 280, tableTop);
  doc.text("Cant.", 370, tableTop, { width: 40, align: "right" });
  doc.text("Unitario", 420, tableTop, { width: 55, align: "right" });
  doc.text("Total", 490, tableTop, { width: 45, align: "right" });

  let y = tableTop + 34;
  doc.font("Helvetica").fontSize(9).fillColor("#101820");

  for (const item of order.items) {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }

    doc.text(item.name, 60, y, { width: 205 });
    doc.fillColor("#62615d").text(item.sku ?? "-", 280, y, { width: 80 });
    doc.text(String(item.quantity), 370, y, { width: 40, align: "right" });
    doc.text(formatOrderMoney(item.unitCents, order.currency), 420, y, { width: 55, align: "right" });
    doc.fillColor("#101820").font("Helvetica-Bold").text(formatOrderMoney(item.totalCents, order.currency), 490, y, { width: 45, align: "right" });
    doc.font("Helvetica").strokeColor("#eee9df").moveTo(60, y + 24).lineTo(535, y + 24).stroke();
    y += 38;
  }

  y += 14;
  const totalsX = 360;
  doc.font("Helvetica").fontSize(10).fillColor("#62615d");
  doc.text("Subtotal", totalsX, y, { width: 90 });
  doc.text(formatOrderMoney(order.subtotalCents, order.currency), 455, y, { width: 80, align: "right" });
  y += 18;
  doc.text("Envío", totalsX, y, { width: 90 });
  doc.text(formatOrderMoney(order.shippingCents, order.currency), 455, y, { width: 80, align: "right" });
  y += 18;
  doc.text("IVA", totalsX, y, { width: 90 });
  doc.text(formatOrderMoney(order.taxCents, order.currency), 455, y, { width: 80, align: "right" });
  y += 24;
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#101820");
  doc.text("Total", totalsX, y, { width: 90 });
  doc.text(formatOrderMoney(order.totalCents, order.currency), 455, y, { width: 80, align: "right" });

  doc.font("Helvetica").fontSize(8).fillColor("#62615d").text(
    "Documento generado automáticamente desde el área cliente de BogerdPro.",
    48,
    780,
    { width: 499, align: "center" },
  );

  doc.end();
  return bufferPromise;
}

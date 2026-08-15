import { NextResponse } from "next/server";
import { z } from "zod";
import { contactInfo } from "@/config/site-content";
import { sendTransactionalEmail } from "@/lib/email/resend";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional(),
  email: z.email().max(160),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().min(10).max(4000),
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function row(label: string, value?: string | null) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e7e2d8;color:#62615d;font-weight:700;width:140px;">${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e7e2d8;color:#151515;">${escapeHtml(value)}</td>
    </tr>
  `;
}

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? contactInfo.email;
  const { name, company, email, phone, message } = parsed.data;

  await sendTransactionalEmail({
    to: adminEmail,
    replyTo: email,
    subject: `Nueva solicitud de contacto: ${name}`,
    html: `
      <div style="margin:0;padding:32px;background:#f7f5f0;font-family:Arial,sans-serif;color:#151515;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e7e2d8;border-radius:12px;overflow:hidden;">
          <div style="padding:24px 28px;background:#101820;color:#ffffff;">
            <p style="margin:0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#9fc6f0;">BogerdPro</p>
            <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">Nueva solicitud de contacto</h1>
          </div>
          <div style="padding:28px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tbody>
                ${row("Nombre", name)}
                ${row("Empresa", company)}
                ${row("Email", email)}
                ${row("Teléfono", phone)}
              </tbody>
            </table>
            <div style="margin-top:22px;">
              <p style="margin:0 0 8px;color:#62615d;font-weight:700;">Mensaje</p>
              <p style="margin:0;white-space:pre-wrap;line-height:1.7;color:#151515;">${escapeHtml(message)}</p>
            </div>
          </div>
        </div>
      </div>
    `,
    text: [
      "Nueva solicitud de contacto",
      `Nombre: ${name}`,
      company ? `Empresa: ${company}` : "",
      `Email: ${email}`,
      phone ? `Teléfono: ${phone}` : "",
      "",
      message,
    ].filter(Boolean).join("\n"),
  });

  return NextResponse.json({ ok: true });
}

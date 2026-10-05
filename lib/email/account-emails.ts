import { absoluteUrl } from "@/lib/seo/site";
import { sendTransactionalEmail } from "@/lib/email/resend";

function emailShell(title: string, body: string) {
  return `
    <div style="margin:0;padding:32px;background:#f7f5f0;font-family:Arial,sans-serif;color:#151515;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e7e2d8;border-radius:12px;overflow:hidden;">
        <div style="padding:24px 28px;background:#101820;color:#ffffff;">
          <p style="margin:0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#9fc6f0;">BogerdPro</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">${title}</h1>
        </div>
        <div style="padding:28px;">${body}</div>
      </div>
    </div>
  `;
}

export async function sendAccountApprovedEmail({ to, name }: { to: string; name?: string | null }) {
  const loginUrl = absoluteUrl("/login");
  const greeting = name ? `Hola ${name},` : "Hola,";
  const html = emailShell(
    "Cuenta validada",
    `
      <p style="margin:0 0 18px;line-height:1.6;color:#62615d;">${greeting}</p>
      <p style="margin:0 0 18px;line-height:1.6;color:#62615d;">Tu cuenta de BogerdPro ya ha sido validada. A partir de ahora puedes iniciar sesión para consultar precios profesionales, condiciones asignadas y preparar solicitudes de compra.</p>
      <p style="margin:26px 0 0;">
        <a href="${loginUrl}" style="display:inline-block;background:#151515;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:700;">Iniciar sesión</a>
      </p>
    `,
  );

  return sendTransactionalEmail({
    to,
    subject: "Tu cuenta de BogerdPro ya está validada",
    html,
    text: `${greeting}\n\nTu cuenta de BogerdPro ya ha sido validada. Puedes iniciar sesión en ${loginUrl}.`,
  });
}

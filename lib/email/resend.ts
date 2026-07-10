type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
};

function recipients(value: string | string[]) {
  return Array.isArray(value) ? value : [value];
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "BogerdPro <no-reply@bogerdpro.com>";

  if (!apiKey) {
    console.log("[email:dry-run]", {
      to: recipients(input.to),
      subject: input.subject,
    });
    return { id: "dry-run" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients(input.to),
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  const payload = (await response.json()) as ResendResponse;

  if (!response.ok) {
    throw new Error(payload.message ?? "No se ha podido enviar el email transaccional.");
  }

  return payload;
}

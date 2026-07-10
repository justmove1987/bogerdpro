export const orderStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  FULFILLED: "Enviada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

export const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

export function formatOrderMoney(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

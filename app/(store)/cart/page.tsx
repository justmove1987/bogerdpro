import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CartView } from "@/components/cart/cart-view";

export const metadata = {
  title: "Carrito",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumbs items={[{ href: "/", label: "Inicio" }, { label: "Carrito" }]} />
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">Carrito</h1>
      <CartView />
    </div>
  );
}

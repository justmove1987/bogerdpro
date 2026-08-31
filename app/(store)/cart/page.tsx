import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CartView } from "@/components/cart/cart-view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getCurrentDictionary } from "@/lib/i18n/locale";

export const metadata = {
  title: "Carrito",
};

export default async function CartPage() {
  const dictionary = await getCurrentDictionary();
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumbs items={[{ href: "/", label: dictionary.nav.home }, { label: dictionary.cart.title }]} />
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">{dictionary.cart.title}</h1>
      <CartView
        canCheckout={Boolean(session?.user)}
        labels={{ ...dictionary.cart, standardVariant: dictionary.product.standardVariant }}
      />
    </div>
  );
}

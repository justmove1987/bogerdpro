import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingCart } from "@/components/cart/floating-cart";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#151515]">
      <Header />
      <main>{children}</main>
      <FloatingCart />
      <Footer />
    </div>
  );
}

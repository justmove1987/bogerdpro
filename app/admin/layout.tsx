import Link from "next/link";
import { Building2, FolderTree, Package, ReceiptText, Upload } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";

const adminNav = [
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree },
  { href: "/admin/brands", label: "Marcas", icon: Building2 },
  { href: "/admin/orders", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/imports", label: "Imports CSV", icon: Upload },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#151515]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#e7e2d8] bg-white p-5 lg:block">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          BogerdPro Admin
        </Link>
        <nav className="mt-8 space-y-2">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="premium-focus flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold text-[#62615d] transition hover:bg-[#f7f5f0] hover:text-[#151515]">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </main>
    </div>
  );
}

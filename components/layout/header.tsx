"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { catalogCollections } from "@/config/site-content";
import { locales } from "@/config/i18n";

const menuCollections = catalogCollections;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e2d8] bg-[#f7f5f0]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="premium-focus flex items-center gap-3 rounded-[var(--radius-sm)]">
          <Image
            src="/brand/logo-bogerdpro.png"
            alt="BogerdPro"
            width={181}
            height={98}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          <Link className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[#62615d] transition hover:bg-white hover:text-[#151515]" href="/">
            Inicio
          </Link>
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <button
              type="button"
              className="premium-focus inline-flex h-10 items-center gap-1 rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[#62615d] transition hover:bg-white hover:text-[#151515]"
              onClick={() => setMegaOpen((value) => !value)}
              aria-expanded={megaOpen}
            >
              Catálogos <ChevronDown size={15} />
            </button>
            {megaOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-10 z-50 w-[780px] rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="grid grid-cols-[1fr_260px] gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    {menuCollections.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        className="group flex gap-3 rounded-[var(--radius-sm)] p-3 transition duration-200 hover:bg-[#f7f5f0]"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <category.icon size={20} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#151515]">{category.title}</span>
                          <span className="mt-1 block text-sm leading-5 text-[#62615d]">{category.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="rounded-[var(--radius-sm)] bg-[#151515] p-4 text-white">
                    <p className="text-sm font-semibold">Encuentra antes lo que necesitas</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      Accede por sector, protección, calzado o alta visibilidad y reduce el tiempo de compra.
                    </p>
                    <Link href="/catalog" className="mt-5 inline-flex text-sm font-semibold text-[#9fc6f0]">
                      Ver todos los catálogos
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
          <Link className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[#62615d] transition hover:bg-white hover:text-[#151515]" href="/contacto">
            Contacto
          </Link>
          {isAdmin ? (
            <Link className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[#62615d] transition hover:bg-white hover:text-[#151515]" href="/admin">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/catalog" className="premium-focus inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm font-medium text-[#62615d] transition hover:border-[#151515] hover:text-[#151515]">
            <Search size={17} />
            Buscar producto
          </Link>
          <div className="flex items-center rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white p-1" aria-label="Selector de idioma">
            {locales.map((locale) => (
              <span
                key={locale.code}
                className={`rounded px-2 py-1 text-xs font-semibold ${locale.code === "es" ? "bg-[var(--accent)] text-white" : "text-[#62615d]"}`}
                title={locale.label}
              >
                {locale.shortLabel}
              </span>
            ))}
          </div>
          <Link href="/cart" aria-label="Carrito" className="premium-focus relative rounded-[var(--radius-sm)] p-2 transition hover:bg-white">
            <ShoppingCart size={20} />
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">0</span>
          </Link>
          <Link
            href={isAdmin ? "/admin" : "/admin/login"}
            aria-label={isAdmin ? "Panel de administracion" : "Iniciar sesion"}
            className="premium-focus rounded-[var(--radius-sm)] p-2 transition hover:bg-white"
          >
            <UserRound size={20} />
          </Link>
        </div>

        <button
          className="premium-focus rounded-[var(--radius-sm)] p-2 lg:hidden"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen ? (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="border-t border-[#e7e2d8] bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            <Link href="/" className="rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-[#151515]">
              Inicio
            </Link>
            {menuCollections.map((category) => (
              <Link key={category.href} href={category.href} className="rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-[#151515]">
                {category.title}
              </Link>
            ))}
            <Link href="/contacto" className="rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-[#151515]">
              Contacto
            </Link>
            {isAdmin ? (
              <Link href="/admin" className="rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-[#151515]">
                Admin
              </Link>
            ) : null}
            <Button variant="primary" size="lg" className="mt-2 w-full">
              <Search size={17} />
              Buscar producto
            </Button>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}

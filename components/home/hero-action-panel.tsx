"use client";

import Image from "next/image";
import { ArrowRight, Award, CheckCircle2, Gauge, Layers3, PackageCheck, Search, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { companyStats } from "@/config/site-content";

const steps = [
  { icon: Search, label: "Busca por sector, referencia o producto", value: "01" },
  { icon: Gauge, label: "Filtra por protección, uso y disponibilidad", value: "02" },
  { icon: CheckCircle2, label: "Selecciona variantes y solicita compra", value: "03" },
];

const statIcons = [Award, Layers3, PackageCheck];

export function HeroActionPanel() {
  return (
    <div className="grid content-center">
      <div className="overflow-hidden rounded-[28px] border border-[#dbe3ec] bg-[#101820] shadow-[0_28px_90px_rgb(16_24_32/0.14)]">
        <div className="relative min-h-[650px] overflow-hidden bg-[#101820] p-6 text-white">
          <Image
            src="/images/catalogs/alta-visibilidad-equipo.jpg"
            alt="Equipo profesional con vestuario de alta visibilidad"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-[52%_42%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,32,0.86),rgba(16,24,32,0.34)_52%,rgba(16,24,32,0.12)),linear-gradient(180deg,rgba(16,24,32,0.08),rgba(16,24,32,0.16)_58%,rgba(16,24,32,0.82))]" />

          <div className="relative z-10 flex min-h-[602px] flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Compra profesional</p>
                <p className="mt-1 text-xs text-white/62">Ruta rápida de selección</p>
              </div>
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold shadow-[0_10px_28px_rgb(53_114_184/0.36)]">
                3 clics
              </span>
            </div>

            <div className="mt-16 max-w-md">
              <div className="rounded-[var(--radius-md)] border border-white/14 bg-[#101820]/42 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck size={18} className="text-[#9fc6f0]" />
                  Solución recomendada
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight">Alta visibilidad para obra</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[86%] rounded-full bg-[#9fc6f0]" />
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {steps.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-white/10 bg-[#101820]/62 p-3 backdrop-blur-md"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.08 * index }}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-white text-[var(--accent)]">
                      <item.icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-white/88">{item.label}</span>
                    <span className="text-xs font-semibold text-white/42">{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="grid overflow-hidden rounded-[20px] border border-white/12 bg-[#101820]/48 shadow-[0_18px_50px_rgb(0_0_0/0.18)] backdrop-blur-md sm:grid-cols-3">
                {companyStats.map((stat, index) => {
                  const Icon = statIcons[index] ?? Award;

                  return (
                    <motion.div
                      key={stat.label}
                      className="group relative min-h-24 overflow-hidden border-b border-white/12 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: 0.12 + index * 0.07, ease: "easeOut" }}
                    >
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,var(--accent),#9fc6f0)] opacity-0 transition duration-200 group-hover:opacity-100" />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
                          <p className="mt-2 text-sm leading-5 text-white/74">{stat.label}</p>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/12 text-[#9fc6f0]">
                          <Icon size={17} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-white">
                <span>Ver catálogos por sector</span>
                <ArrowRight size={16} className="text-[#9fc6f0]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

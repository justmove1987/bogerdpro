import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[#d8d1c5] bg-white px-6 py-12 text-center">
      <Icon className="mx-auto text-[var(--accent)]" size={32} />
      <h2 className="mt-4 text-xl font-semibold text-[#151515]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#62615d]">{description}</p>
    </div>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Breadcrumb = {
  href?: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#62615d]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <Link className="transition hover:text-[#151515]" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-medium text-[#151515]">
              {item.label}
            </span>
          )}
          {index < items.length - 1 ? <ChevronRight size={14} aria-hidden="true" /> : null}
        </span>
      ))}
    </nav>
  );
}

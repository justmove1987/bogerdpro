import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pageHref(searchParams: Record<string, string | string[] | undefined>, page: number, basePath: string) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || typeof value === "undefined") continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item) params.append(key, item);
    }
  }

  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  page,
  pageCount,
  searchParams,
  basePath = "/catalog",
}: {
  page: number;
  pageCount: number;
  searchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter((item) => {
    return item === 1 || item === pageCount || Math.abs(item - page) <= 1;
  });

  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={pageHref(searchParams, Math.max(1, page - 1), basePath)}
        rel={page > 1 ? "prev" : undefined}
        aria-disabled={page <= 1}
        className="premium-focus inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm font-semibold text-[#151515] transition hover:border-[#151515] aria-disabled:pointer-events-none aria-disabled:opacity-45"
      >
        <ChevronLeft size={16} />
        Anterior
      </Link>
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        return (
          <span key={item} className="flex items-center gap-2">
            {previous && item - previous > 1 ? <span className="px-1 text-sm text-[#62615d]">...</span> : null}
            <Link
              href={pageHref(searchParams, item, basePath)}
              aria-current={item === page ? "page" : undefined}
              className="premium-focus grid h-10 min-w-10 place-items-center rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm font-semibold text-[#151515] transition hover:border-[#151515] aria-current:border-[#151515] aria-current:bg-[#151515] aria-current:text-white"
            >
              {item}
            </Link>
          </span>
        );
      })}
      <Link
        href={pageHref(searchParams, Math.min(pageCount, page + 1), basePath)}
        rel={page < pageCount ? "next" : undefined}
        aria-disabled={page >= pageCount}
        className="premium-focus inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm font-semibold text-[#151515] transition hover:border-[#151515] aria-disabled:pointer-events-none aria-disabled:opacity-45"
      >
        Siguiente
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}

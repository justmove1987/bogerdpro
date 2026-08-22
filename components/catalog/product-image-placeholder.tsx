import { ImageOff } from "lucide-react";

export function ProductImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#f1eee7] px-4 text-center text-[#6d6860]">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--accent)] shadow-sm">
        <ImageOff size={22} />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

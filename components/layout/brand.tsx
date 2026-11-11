import Link from "next/link";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="flex size-9 items-center justify-center rounded-md bg-accent text-[15px] font-semibold text-inverse">
        H
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Hostelio</span>
    </Link>
  );
}

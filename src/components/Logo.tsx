import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3"
      aria-label="FIFA Tournament Manager home"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-105">
        FT
      </div>

      <div className="hidden sm:block">
        <div className="text-sm font-bold tracking-tight text-slate-950">
          FIFA Tournament
        </div>
        <div className="text-xs font-medium text-slate-500">
          Manager
        </div>
      </div>
    </Link>
  );
}
import Link from "next/link";
import { Logo } from "@/components/Logo";

const navigation = [
  {
    label: "Tournaments",
    href: "/tournaments",
  },
  {
    label: "Players",
    href: "/players",
  },
  {
    label: "Statistics",
    href: "/statistics",
  },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/admin"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
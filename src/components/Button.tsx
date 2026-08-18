import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary:
    "bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition",
    variants[variant],
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}
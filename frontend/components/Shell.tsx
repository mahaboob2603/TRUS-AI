"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";
import type { Route } from "next";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/applications", label: "Loan Decisions" },
  { href: "/consent", label: "Consent Center" },
  { href: "/audit", label: "Audit Trail" }
];

type Props = {
  children: React.ReactNode;
};

export const Shell = ({ children }: Props): JSX.Element => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/applications" className="text-lg font-semibold text-primary">
            TRUS.AI Studio
          </Link>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
          <nav className="hidden gap-4 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {menuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    pathname.startsWith(item.href)
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
};

export default Shell;


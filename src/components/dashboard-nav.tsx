"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  ChartBar,
  ClockCounterClockwise,
  House,
  SquaresFour,
  BookOpen,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/projects", label: "Projects", icon: SquaresFour },
  { href: "/audit-logs", label: "Audit Logs", icon: ClockCounterClockwise },
  { href: "/usage", label: "Usage", icon: ChartBar },
  { href: "/docs", label: "Documentation", icon: BookOpen },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const activeItems = NAV_ITEMS.filter(
    (item) => item.href !== "/audit-logs" || isAdmin,
  );

  return (
    <nav className="space-y-1">
      {activeItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
              active
                ? "text-app-foreground"
                : "text-app-muted hover:text-app-foreground"
            }`}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <Link
        href="/landing"
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-app-muted transition hover:text-app-foreground"
      >
        <ArrowSquareOut size={18} weight="regular" />
        <span>Back to landing</span>
      </Link>
    </nav>
  );
}

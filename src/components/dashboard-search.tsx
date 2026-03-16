"use client";

import { Command, MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const SEARCH_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard overview",
    description: "Workspace summary, health, and recent secret activity",
  },
  {
    href: "/projects",
    label: "Projects",
    description: "Create projects, environments, and encrypted secrets",
  },
  {
    href: "/usage",
    label: "Usage",
    description: "Capacity, empty environments, and upgrade signals",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Starter limits, Pro upgrade path, and security roadmap",
  },
  {
    href: "/landing",
    label: "Landing page",
    description: "Return to the public product overview",
  },
];

export function DashboardSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return SEARCH_ITEMS;
    }

    return SEARCH_ITEMS.filter((item) =>
      `${item.label} ${item.description} ${item.href}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  function openFirstResult() {
    const firstItem = filteredItems[0];

    if (!firstItem) {
      return;
    }

    router.push(firstItem.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center justify-between gap-3 border border-app bg-white/[0.03] px-4 text-left text-sm text-app-muted hover:bg-white/[0.05] hover:text-app-foreground"
      >
        <span className="flex items-center gap-3">
          <MagnifyingGlass size={16} />
          <span>Search</span>
        </span>
        <span className="flex items-center gap-1 text-xs">
          <Command size={12} />
          <span>K</span>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-16 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-panel-strong w-full max-w-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-app px-5 py-4">
              <div className="flex items-center gap-3">
                <MagnifyingGlass size={18} className="text-app-muted" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      openFirstResult();
                    }
                  }}
                  placeholder="Jump to dashboard, projects, usage, settings..."
                  className="h-10 w-full border-0 bg-transparent text-sm text-app-foreground outline-none placeholder:text-app-muted"
                />
              </div>
            </div>

            <div className="scrollbar-hidden max-h-[420px] overflow-y-auto p-3">
              {filteredItems.length === 0 ? (
                <div className="px-3 py-8 text-sm text-app-muted">
                  No results. Try dashboard, usage, projects, or settings.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className="flex w-full items-start justify-between gap-4 rounded-sm border border-transparent px-3 py-3 text-left hover:border-app hover:bg-white/[0.04]"
                  >
                    <span>
                      <span className="block text-sm font-medium text-app-foreground">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-sm text-app-muted">
                        {item.description}
                      </span>
                    </span>
                    <span className="text-xs text-app-muted">{item.href}</span>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-app px-5 py-3 text-xs text-app-muted">
              <span>Enter to open a result</span>
              <Link href="/projects" className="hover:text-app-foreground">
                Need to add data? Open projects
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

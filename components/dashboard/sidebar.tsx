"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { id: "panel", href: "/dashboard", label: "Panel consolidador" },
  { id: "personas", href: "/personas", label: "Mis personas" },
  { id: "seguimientos", href: "/seguimientos", label: "Seguimientos" },
  { id: "vista-general", href: "/dashboard/resumen", label: "Vista general" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-stone-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-stone-200 px-6 py-8">
        <div className="flex items-center gap-4">
          <Image
            src="/brand/logo-completo.png"
            alt="Reino y Gloria"
            width={190}
            height={70}
            style={{ height: "auto" }}
            className="w-[190px] object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={[
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-stone-700 hover:bg-stone-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-stone-200 px-4 py-4">
        <div className="rounded-2xl bg-stone-50 px-4 py-3">
          <p className="text-sm font-semibold text-stone-900">David Cabrera</p>
          <p className="text-xs text-stone-500">Consolidador</p>
        </div>
      </div>
    </aside>
  )
}
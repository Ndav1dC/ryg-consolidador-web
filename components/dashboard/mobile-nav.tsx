"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/personas", label: "Personas" },
  { href: "/seguimientos/nuevo", label: "Seguimientos" },
  { href: "/admin", label: "Más" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-3 text-xs font-medium ${
                active ? "text-amber-700" : "text-stone-500"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
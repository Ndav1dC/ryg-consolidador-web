"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/personas/nuevos", label: "Nuevos" },
  { href: "/personas", label: "Mis personas" },
  { href: "/seguimientos", label: "Seguimientos" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-3">
        {navItems.map((item) => {
          let isActive = false
          if (item.href === "/personas/nuevos") {
            isActive = pathname === "/personas/nuevos"
          } else if (item.href === "/personas") {
            isActive = pathname === "/personas" || (pathname.startsWith("/personas/") && !pathname.includes("/nuevos"))
          } else if (item.href === "/seguimientos") {
            isActive = pathname.startsWith("/seguimientos")
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-4 text-xs font-medium ${
                isActive ? "text-amber-700" : "text-stone-500"
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
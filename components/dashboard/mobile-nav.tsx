"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/(auth)/login/actions"

const navItems = [
  { href: "/personas/nuevos", label: "Nuevos" },
  { href: "/personas", label: "Mis personas" },
  {
    href: "/personas/numeros-invalidos",
    label: "Números inválidos",
  },
  { href: "/seguimientos", label: "Seguimientos" },
]

export function MobileNav() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          let isActive = false

          if (item.href === "/personas/nuevos") {
            isActive = pathname === "/personas/nuevos"
          } else if (item.href === "/personas/numeros-invalidos") {
            isActive = pathname.startsWith("/personas/numeros-invalidos")
          } else if (item.href === "/personas") {
            isActive =
              pathname === "/personas" ||
              (pathname.startsWith("/personas/") &&
                !pathname.includes("/nuevos") &&
                !pathname.includes("/numeros-invalidos"))
          } else if (item.href === "/seguimientos") {
            isActive = pathname.startsWith("/seguimientos")
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-4 text-center text-[10px] font-medium sm:px-3 sm:text-xs ${
                isActive ? "text-amber-700" : "text-stone-500"
              }`}
            >
              <span className="leading-tight">{item.label}</span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-4 text-center text-[10px] font-medium text-stone-500 sm:px-3 sm:text-xs"
        >
          <span>Salir</span>
        </button>
      </div>
    </nav>
  )
}
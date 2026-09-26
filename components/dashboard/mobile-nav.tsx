"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/(auth)/login/actions"

interface MobileNavProps {
  userRol: string
}

type NavItem = {
  href: string
  label: string
}

const baseNavItems: NavItem[] = [
  { href: "/personas/nuevos", label: "Nuevos" },
  { href: "/personas", label: "Mis personas" },
  { href: "/seguimientos", label: "Seguimientos" },
]

const numeroInvalidoItem: NavItem = {
  href: "/personas/numeros-invalidos",
  label: "Números inválidos",
}

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/personas", label: "Personas" },
  { href: "/admin/equipo", label: "Equipo" },
  { href: "/admin/casas", label: "Casas" },
  { href: "/admin/seguimientos", label: "Seguimientos" },
  { href: "/admin/reportes", label: "Reportes" },
]

function esRutaActiva(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin"
  }

  if (href.startsWith("/admin/")) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  if (href === "/personas/nuevos") {
    return pathname === href
  }

  if (href === "/personas/numeros-invalidos") {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  if (href === "/personas") {
    return (
      pathname === href ||
      (pathname.startsWith("/personas/") &&
        !pathname.startsWith("/personas/nuevos") &&
        !pathname.startsWith("/personas/numeros-invalidos"))
    )
  }

  if (href === "/seguimientos") {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return pathname === href
}

export function MobileNav({ userRol }: MobileNavProps) {
  const pathname = usePathname()

  const navItems =
    userRol === "admin"
      ? adminNavItems
      : userRol === "consolidador"
        ? [
            baseNavItems[0],
            baseNavItems[1],
            numeroInvalidoItem,
            baseNavItems[2],
          ]
        : baseNavItems

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden"
    >
      <div className="flex w-full items-stretch overflow-x-auto overscroll-x-contain pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = esRutaActiva(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 min-w-20 flex-1 shrink-0 items-center justify-center px-2 py-3 text-center text-[11px] font-medium leading-tight ${
                isActive
                  ? "border-t-2 border-amber-600 text-amber-700"
                  : "border-t-2 border-transparent text-stone-600"
              }`}
            >
              {item.label}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => void logoutAction()}
          className="flex min-h-14 min-w-20 flex-1 shrink-0 items-center justify-center border-t-2 border-transparent px-2 py-3 text-center text-[11px] font-medium text-stone-600"
        >
          Salir
        </button>
      </div>
    </nav>
  )
}
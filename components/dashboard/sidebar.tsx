"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/(auth)/login/actions"

interface SidebarProps {
  userNombre: string
  userRol: string
  roles?: string[]
}

const baseNavItems = [
  { id: "nuevos", href: "/personas/nuevos", label: "Nuevos" },
  { id: "mis-personas", href: "/personas", label: "Mis personas" },
  { id: "seguimientos", href: "/seguimientos", label: "Seguimientos" },
]

const numeroInvalidoItem = {
  id: "numeros-invalidos",
  href: "/personas/numeros-invalidos",
  label: "Números inválidos",
}

const adminItems = [
  { id: "admin-dashboard", href: "/admin", label: "Panel Admin" },
]

export function Sidebar({ userNombre, userRol, roles = [] }: SidebarProps) {
  const pathname = usePathname()

  const isAdmin = roles.includes("admin")
  const esConsolidador = userRol === "consolidador"

  let items = [...baseNavItems]

  if (esConsolidador) {
    items = [
      baseNavItems[0],
      baseNavItems[1],
      numeroInvalidoItem,
      baseNavItems[2],
    ]
  }

  if (isAdmin) {
    items = [...adminItems, ...items]
  }

  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-stone-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-stone-200 px-6 py-8">
        <div className="flex items-center gap-4">
          <Image
            src="/brand/logo-completo.png"
            alt="Reino y Gloria"
            width={190}
            height={70}
            className="h-auto w-[190px] object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {items.map((item) => {
            let active = false

            if (item.href === "/personas/nuevos") {
              active = pathname === "/personas/nuevos"
            } else if (item.href === "/personas/numeros-invalidos") {
              active = pathname.startsWith("/personas/numeros-invalidos")
            } else if (item.href === "/personas") {
              active =
                pathname === "/personas" ||
                (pathname.startsWith("/personas/") &&
                  !pathname.includes("/nuevos") &&
                  !pathname.includes("/numeros-invalidos"))
            } else if (item.href === "/seguimientos") {
              active = pathname.startsWith("/seguimientos")
            } else if (item.href === "/admin") {
              active = pathname.startsWith("/admin")
            } else {
              active = pathname === item.href
            }

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
          <p className="text-sm font-semibold text-stone-900">
            {userNombre}
          </p>

          <p className="text-xs text-stone-500">
            {userRol === "consolidador" && "Consolidador"}
            {userRol === "lider_casa" && "Líder de Casa"}
            {userRol === "admin" && "Administrador"}
          </p>

          {roles.length > 1 ? (
            <p className="mt-1 text-xs text-amber-600">
              {roles.length} roles disponibles
            </p>
          ) : null}
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
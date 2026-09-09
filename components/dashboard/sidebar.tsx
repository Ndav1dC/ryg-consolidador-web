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

type NavItem = {
  id: string
  href: string
  label: string
  descripcion?: string
}

const consolidadorItems: NavItem[] = [
  {
    id: "nuevos",
    href: "/personas/nuevos",
    label: "Nuevos",
  },
  {
    id: "mis-personas",
    href: "/personas",
    label: "Mis personas",
  },
  {
    id: "numeros-invalidos",
    href: "/personas/numeros-invalidos",
    label: "Números inválidos",
  },
  {
    id: "seguimientos",
    href: "/seguimientos",
    label: "Seguimientos",
  },
]

const liderCasaItems: NavItem[] = [
  {
    id: "nuevos",
    href: "/personas/nuevos",
    label: "Nuevos",
  },
  {
    id: "mis-personas",
    href: "/personas",
    label: "Mis personas",
  },
  {
    id: "seguimientos",
    href: "/seguimientos",
    label: "Seguimientos",
  },
]

const adminItems: NavItem[] = [
  {
    id: "admin-dashboard",
    href: "/admin",
    label: "Resumen general",
    descripcion: "Indicadores del proceso",
  },
  {
    id: "admin-personas",
    href: "/admin/personas",
    label: "Personas",
    descripcion: "Registros y asignaciones",
  },
  {
    id: "admin-equipo",
    href: "/admin/equipo",
    label: "Equipo",
    descripcion: "Consolidadores y líderes",
  },
  {
    id: "admin-casas",
    href: "/admin/casas",
    label: "Casas de Avivamiento",
    descripcion: "Casas y responsables",
  },
  {
    id: "admin-seguimientos",
    href: "/admin/seguimientos",
    label: "Seguimientos",
    descripcion: "Actividad y pendientes",
  },
  {
    id: "admin-reportes",
    href: "/admin/reportes",
    label: "Reportes",
    descripcion: "Análisis del proceso",
  },
]

function esRutaActiva(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin"
  }

  if (href.startsWith("/admin/")) {
    return pathname.startsWith(href)
  }

  if (href === "/personas/nuevos") {
    return pathname === "/personas/nuevos"
  }

  if (href === "/personas/numeros-invalidos") {
    return pathname.startsWith("/personas/numeros-invalidos")
  }

  if (href === "/personas") {
    return (
      pathname === "/personas" ||
      (pathname.startsWith("/personas/") &&
        !pathname.includes("/nuevos") &&
        !pathname.includes("/numeros-invalidos"))
    )
  }

  if (href === "/seguimientos") {
    return pathname.startsWith("/seguimientos")
  }

  return pathname === href
}

export function Sidebar({
  userNombre,
  userRol,
  roles = [],
}: SidebarProps) {
  const pathname = usePathname()

  const esAdminActivo = userRol === "admin"
  const esLiderCasaActivo = userRol === "lider_casa"

  const items = esAdminActivo
    ? adminItems
    : esLiderCasaActivo
      ? liderCasaItems
      : consolidadorItems

  const handleLogout = async () => {
    await logoutAction()
  }

  const tituloSeccion = esAdminActivo
    ? "Módulo administrativo"
    : esLiderCasaActivo
      ? "Proceso de discipulado"
      : "Proceso de consolidación"

  const descripcionSeccion = esAdminActivo
    ? "Supervisa personas, equipo, asignaciones y resultados."
    : esLiderCasaActivo
      ? "Acompaña a las personas en discipulado y consolidación."
      : "Gestiona las personas asignadas a tu proceso."

  const etiquetaRol = esAdminActivo
    ? "Administrador"
    : esLiderCasaActivo
      ? "Líder de Casa"
      : "Consolidador"

  return (
    <aside className="hidden w-[288px] shrink-0 border-r border-stone-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-stone-200 px-6 py-7">
        <Image
          src="/brand/logo-completo.png"
          alt="Reino y Gloria"
          width={190}
          height={70}
          className="h-auto w-[190px] object-contain"
          priority
        />
      </div>

      <div className="border-b border-stone-100 px-6 py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600">
          {tituloSeccion}
        </p>

        <p className="mt-2 text-sm font-semibold text-stone-900">
          {esAdminActivo
            ? "Gestión y supervisión"
            : esLiderCasaActivo
              ? "Acompañamiento espiritual"
              : "Seguimiento personal"}
        </p>

        <p className="mt-1 text-xs leading-5 text-stone-500">
          {descripcionSeccion}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
          Navegación
        </p>

        <ul className="space-y-2">
          {items.map((item) => {
            const active = esRutaActiva(pathname, item.href)

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={[
                    "block rounded-2xl px-4 py-3 transition",
                    active
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-stone-700 hover:bg-stone-100",
                  ].join(" ")}
                >
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>

                  {item.descripcion ? (
                    <span
                      className={[
                        "mt-0.5 block text-[11px]",
                        active ? "text-amber-50" : "text-stone-400",
                      ].join(" ")}
                    >
                      {item.descripcion}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-stone-200 px-4 py-5">
        <div className="rounded-2xl bg-stone-50 px-4 py-3">
          <p className="truncate text-sm font-semibold text-stone-900">
            {userNombre}
          </p>

          <p className="mt-1 text-xs text-stone-500">{etiquetaRol}</p>

          {roles.length > 1 ? (
            <p className="mt-2 text-xs text-amber-600">
              {roles.length} roles disponibles
            </p>    
          ) : null}
        </div>                                                                          

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
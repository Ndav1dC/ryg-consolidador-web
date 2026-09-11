"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

type Props = {
  roles: string[]
  rolActual: string
  onRolChange: (nuevoRol: string) => void | Promise<void>
}

const roleLabels: Record<string, string> = {
  consolidador: "Consolidador",
  lider_casa: "Líder Casa",
  admin: "Administrador",
}

export function RoleSwitcher({
  roles,
  rolActual,
  onRolChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || roles.length <= 1) {
    return null
  }

  const cambiarRol = (nuevoRol: string) => {
    if (nuevoRol === rolActual || isPending) {
      setIsOpen(false)
      return
    }

    setIsOpen(false)

    startTransition(async () => {
      await onRolChange(nuevoRol)

      if (pathname.startsWith("/admin") && nuevoRol !== "admin") {
        router.push("/dashboard")
        router.refresh()
        return
      }

      router.refresh()
    })
  }

  const getRolLabel = (rol: string) => {
    return roleLabels[rol] ?? rol
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={isPending}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
      >
        <span>
          {isPending ? "Cambiando..." : getRolLabel(rolActual)}
        </span>

        <svg
          className="h-4 w-4 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !isPending ? (
        <>
          <button
            type="button"
            aria-label="Cerrar selector de rol"
            className="fixed inset-0 z-40 h-full w-full cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-stone-200 bg-white py-1 shadow-lg"
          >
            <div className="border-b border-stone-100 px-3 py-2 text-xs font-medium text-stone-400">
              Cambiar rol
            </div>

            {roles.map((rol) => (
              <button
                key={rol}
                type="button"
                role="menuitem"
                onClick={() => cambiarRol(rol)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-amber-50 ${
                  rol === rolActual
                    ? "bg-amber-50 font-semibold text-amber-700"
                    : "text-stone-700"
                }`}
              >
                <span>{getRolLabel(rol)}</span>

                {rol === rolActual ? (
                  <span className="text-amber-500" aria-label="Rol activo">
                    ✓
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
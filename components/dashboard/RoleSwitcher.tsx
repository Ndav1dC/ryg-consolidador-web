"use client"

import { useState, useEffect } from "react"

type Props = {
  roles: string[]
  rolActual: string
  onRolChange: (nuevoRol: string) => void
}

export function RoleSwitcher({ roles, rolActual, onRolChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Solo mostrar si tiene más de 1 rol
  if (!mounted || roles.length <= 1) return null

  const cambiarRol = (nuevoRol: string) => {
    onRolChange(nuevoRol)
    setIsOpen(false)
  }

  const getRolLabel = (rol: string) => {
    if (rol === 'consolidador') return 'Consolidador'
    if (rol === 'lider_casa') return 'Líder Casa'
    if (rol === 'admin') return 'Administrador'
    return rol
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium hover:bg-stone-50 transition shadow-sm"
      >
        <span>{getRolLabel(rolActual)}</span>
        <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-lg border border-stone-200 py-1 z-50">
            <div className="px-3 py-2 text-xs font-medium text-stone-400 border-b border-stone-100">
              Cambiar rol
            </div>
            {roles.map((rol) => (
              <button
                key={rol}
                onClick={() => cambiarRol(rol)}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 transition ${
                  rol === rolActual 
                    ? "bg-amber-50 text-amber-700 font-semibold" 
                    : "text-stone-700"
                }`}
              >
                {getRolLabel(rol)}
                {rol === rolActual && (
                  <span className="ml-2 text-amber-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
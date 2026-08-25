"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { eliminarNumeroInvalidoAction } from "./actions"

interface BotonEliminarProps {
  personaId: string
  nombrePersona: string
}

export function BotonEliminar({
  personaId,
  nombrePersona,
}: BotonEliminarProps) {
  const router = useRouter()
  const [eliminando, setEliminando] = useState(false)

  const handleEliminar = async () => {
    const confirmado = window.confirm(
      `¿Estás seguro de eliminar definitivamente a ${nombrePersona}?\n\nEsta acción eliminará sus seguimientos, notas, notificaciones y avance de discipulado. No se puede deshacer.`
    )

    if (!confirmado) return

    setEliminando(true)

    const formData = new FormData()
    formData.append("persona_id", personaId)

    try {
      await eliminarNumeroInvalidoAction(formData)
      router.refresh()
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la persona."

      window.alert(mensaje)
      setEliminando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleEliminar}
      disabled={eliminando}
      className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {eliminando ? "Eliminando..." : "Eliminar definitivamente"}
    </button>
  )
}
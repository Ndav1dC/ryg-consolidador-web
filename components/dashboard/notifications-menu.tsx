"use client"

import Link from "next/link"
import { useTransition } from "react"

import type { Notificacion } from "@/lib/data/notificaciones"
import {
  marcarNotificacionComoLeida,
  marcarTodasComoLeidas,
} from "@/app/actions/notificaciones"

type NotificationsMenuProps = {
  notificaciones: Notificacion[]
  cantidadPendientes: number
}

export function NotificationsMenu({
  notificaciones,
  cantidadPendientes,
}: NotificationsMenuProps) {
  const [isPending, startTransition] = useTransition()

  function marcarTodas() {
    startTransition(async () => {
      await marcarTodasComoLeidas()
    })
  }

  function marcarUna(id: string) {
    startTransition(async () => {
      await marcarNotificacionComoLeida(id)
    })
  }

  return (
    <div className="relative">
      <details className="group">
        <summary className="relative flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-stone-200 bg-white text-sm hover:bg-stone-100">
          <span aria-hidden="true">🔔</span>

          {cantidadPendientes > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
              {cantidadPendientes > 9 ? "9+" : cantidadPendientes}
            </span>
          ) : null}
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <div>
              <p className="font-semibold text-stone-900">
                Notificaciones
              </p>

              <p className="text-xs text-stone-500">
                {cantidadPendientes === 0
                  ? "No tienes pendientes"
                  : `${cantidadPendientes} pendiente${
                      cantidadPendientes === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            {cantidadPendientes > 0 ? (
              <button
                type="button"
                onClick={marcarTodas}
                disabled={isPending}
                className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden="true">✓</span>
                Limpiar
              </button>
            ) : null}
          </div>

          {notificaciones.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-stone-700">
                Todo está al día.
              </p>

              <p className="mt-1 text-xs text-stone-500">
                No tienes notificaciones por ahora.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className="border-b border-stone-100 px-4 py-3 last:border-b-0"
                >
                  <p className="text-sm font-semibold text-stone-800">
                    {notificacion.titulo}
                  </p>

                  <p className="mt-1 text-sm text-stone-600">
                    {notificacion.mensaje}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href={notificacion.href}
                      onClick={() => marcarUna(notificacion.id)}
                      className="text-sm font-medium text-amber-700 hover:underline"
                    >
                      Ver detalle
                    </Link>

                    <button
                      type="button"
                      onClick={() => marcarUna(notificacion.id)}
                      disabled={isPending}
                      className="text-xs text-stone-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Marcar como leída
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  )
}
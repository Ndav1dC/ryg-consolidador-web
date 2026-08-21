"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BrandLogo } from "./brand-logo"
import {
  marcarNotificacionComoLeida,
  marcarTodasComoLeidas,
} from "@/app/actions/notificaciones"

type DashboardNotification = {
  id: string
  titulo: string
  mensaje: string
  href: string
}

type TopbarProps = {
  title: string
  subtitle?: string
  notifications?: DashboardNotification[]
  showSearch?: boolean
}

export function Topbar({
  title,
  subtitle,
  notifications = [],
  showSearch = false,
}: TopbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function handleNotificationClick(notification: DashboardNotification) {
    startTransition(async () => {
      await marcarNotificacionComoLeida(notification.id)
      setIsNotificationsOpen(false)
      router.push(notification.href)
    })
  }

  function handleMarkAsRead(id: string) {
    startTransition(async () => {
      await marcarNotificacionComoLeida(id)
    })
  }

  function handleClearNotifications() {
    startTransition(async () => {
      await marcarTodasComoLeidas()
      setIsNotificationsOpen(false)
    })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="min-w-0">
          <div className="lg:hidden">
            <BrandLogo compact />
          </div>

          <h1 className="mt-3 text-2xl font-bold text-stone-900 lg:mt-0">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
          ) : null}
        </div>

        {showSearch ? (
          <div className="hidden w-full max-w-md lg:block">
            <input
              type="text"
              placeholder="Buscar persona..."
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
            />
          </div>
        ) : null}

        <div
          ref={notificationsRef}
          className="relative flex shrink-0 items-center"
        >
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((current) => !current)}
            aria-label="Abrir notificaciones"
            aria-expanded={isNotificationsOpen}
            className="relative rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-600 transition hover:bg-stone-100"
          >
            <span aria-hidden="true">🔔</span>

            {notifications.length > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            ) : null}
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Notificaciones
                  </p>

                  <p className="mt-0.5 text-xs text-stone-500">
                    {notifications.length === 0
                      ? "No tienes pendientes"
                      : `${notifications.length} pendiente${
                          notifications.length === 1 ? "" : "s"
                        }`}
                  </p>
                </div>

                {notifications.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearNotifications}
                    disabled={isPending}
                    className="text-xs font-medium text-amber-700 transition hover:text-amber-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Limpiar
                  </button>
                ) : null}
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-sm font-medium text-stone-700">
                      Todo está al día
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      No tienes notificaciones por ahora.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="rounded-xl transition hover:bg-stone-100"
                      >
                        <div className="px-3 py-3">
                          <p className="text-sm font-semibold text-stone-800">
                            {notification.titulo}
                          </p>

                          <p className="mt-1 text-sm text-stone-600">
                            {notification.mensaje}
                          </p>

                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                              disabled={isPending}
                              className="text-xs font-medium text-amber-700 transition hover:text-amber-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Ver detalle
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleMarkAsRead(notification.id)
                              }
                              disabled={isPending}
                              className="text-xs text-stone-500 transition hover:text-stone-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Marcar como leída
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
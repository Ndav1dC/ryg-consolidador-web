"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BrandLogo } from "./brand-logo"

type DashboardNotification = {
  id: string
  text: string
  href: string
}

type TopbarProps = {
  title: string
  subtitle?: string
  notifications?: DashboardNotification[]
}

export function Topbar({
  title,
  subtitle,
  notifications = [],
}: TopbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
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

  function handleNotificationClick(href: string) {
    setIsNotificationsOpen(false)
    router.push(href)
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

          {subtitle && (
            <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
          )}
        </div>

        <div className="hidden w-full max-w-md lg:block">
          <input
            type="text"
            placeholder="Buscar persona..."
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
          />
        </div>

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

            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                <p className="text-sm font-semibold text-stone-900">
                  Notificaciones
                </p>

                {notifications.length > 0 && (
                  <span className="text-xs text-stone-500">
                    {notifications.length} pendientes
                  </span>
                )}
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
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() =>
                            handleNotificationClick(notification.href)
                          }
                          className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-stone-100"
                        >
                          <p className="text-sm text-stone-700">
                            {notification.text}
                          </p>
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            Ver detalle
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
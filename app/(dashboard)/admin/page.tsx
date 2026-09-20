import Link from "next/link"

import { getAdminSummary } from "@/lib/data/admin"

const modulos = [
  {
    href: "/admin/personas",
    title: "Personas",
    description: "Consulta registros, estados y asignaciones.",
    icon: "👥",
  },
  {
    href: "/admin/equipo",
    title: "Equipo",
    description: "Revisa consolidadores, líderes y usuarios activos.",
    icon: "🧑‍💼",
  },
  {
    href: "/admin/casas",
    title: "Casas de Avivamiento",
    description: "Consulta casas, responsables y personas asignadas.",
    icon: "🏠",
  },
  {
    href: "/admin/seguimientos",
    title: "Seguimientos",
    description: "Supervisa la actividad y los pendientes.",
    icon: "📋",
  },
  {
    href: "/admin/reportes",
    title: "Reportes",
    description: "Analiza el avance general del proceso.",
    icon: "📊",
  },
]

function StatCard({
  label,
  value,
  description,
  tone = "stone",
}: {
  label: string
  value: number
  description: string
  tone?: "stone" | "amber" | "blue" | "emerald" | "red"
}) {
  const toneClasses = {
    stone: "bg-stone-50 text-stone-900",
    amber: "bg-amber-50 text-amber-900",
    blue: "bg-blue-50 text-blue-900",
    emerald: "bg-emerald-50 text-emerald-900",
    red: "bg-red-50 text-red-900",
  }

  return (
    <article
      className={`rounded-3xl border border-stone-200 p-5 shadow-sm ${toneClasses[tone]}`}
    >
      <p className="text-sm font-medium opacity-70">{label}</p>

      <p className="mt-3 text-3xl font-bold">{value}</p>

      <p className="mt-1 text-xs opacity-70">{description}</p>
    </article>
  )
}

export default async function AdminPage() {
  const summary = await getAdminSummary()

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-stone-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Módulo administrativo
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            Resumen general
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Supervisa personas, equipo, asignaciones y el avance del proceso de
            consolidación.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Personas registradas"
            value={summary.totalPersonas}
            description="Total de personas en el sistema"
          />

          <StatCard
            label="Personas nuevas"
            value={summary.personasNuevas}
            description="Pendientes de gestión"
            tone="amber"
          />

          <StatCard
            label="Personas activas"
            value={summary.personasActivas}
            description="En proceso de consolidación"
            tone="blue"
          />

          <StatCard
            label="Personas consolidadas"
            value={summary.personasConsolidadas}
            description="Proceso completado"
            tone="emerald"
          />

          <StatCard
            label="Sin asignar"
            value={summary.personasSinAsignar}
            description="Requieren responsable"
            tone="red"
          />

          <StatCard
            label="Seguimientos pendientes"
            value={summary.seguimientosPendientes}
            description="Acciones por completar"
            tone="amber"
          />

          <StatCard
            label="Casas de Avivamiento"
            value={summary.casasAvivamiento}
            description="Casas configuradas"
          />

          <StatCard
            label="Usuarios activos"
            value={summary.usuariosActivos}
            description="Miembros habilitados del equipo"
            tone="blue"
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  Personas por etapa
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Distribución actual del proceso.
                </p>
              </div>

              <Link
                href="/admin/personas"
                className="text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Ver personas
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {summary.porEtapa.map((item) => {
                const porcentaje =
                  summary.totalPersonas > 0
                    ? Math.round(
                        (item.cantidad / summary.totalPersonas) * 100
                      )
                    : 0

                return (
                  <div key={item.etapa}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-stone-700">
                        Etapa {item.etapa} · {item.label}
                      </span>

                      <span className="font-semibold text-stone-900">
                        {item.cantidad}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">
              Acciones prioritarias
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Elementos que requieren atención administrativa.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/admin/personas?asignacion=sin-asignar"
                className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3 transition hover:border-red-200"
              >
                <span>
                  <span className="block text-sm font-semibold text-red-900">
                    Personas sin asignar
                  </span>

                  <span className="mt-1 block text-xs text-red-700">
                    Revisa y asigna responsables.
                  </span>
                </span>

                <span className="text-lg font-bold text-red-700">
                  {summary.personasSinAsignar}
                </span>
              </Link>

              <Link
                href="/admin/seguimientos?estado=pendiente"
                className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 transition hover:border-amber-200"
              >
                <span>
                  <span className="block text-sm font-semibold text-amber-950">
                    Seguimientos pendientes
                  </span>

                  <span className="mt-1 block text-xs text-amber-800">
                    Consulta las acciones pendientes.
                  </span>
                </span>

                <span className="text-lg font-bold text-amber-800">
                  {summary.seguimientosPendientes}
                </span>
              </Link>

              <Link
                href="/admin/equipo"
                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 transition hover:border-blue-200"
              >
                <span>
                  <span className="block text-sm font-semibold text-blue-950">
                    Equipo activo
                  </span>

                  <span className="mt-1 block text-xs text-blue-800">
                    Consulta líderes y consolidadores.
                  </span>
                </span>

                <span className="text-lg font-bold text-blue-800">
                  {summary.usuariosActivos}
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-stone-900">
              Accesos administrativos
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Abre un módulo para administrar la información correspondiente.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modulos.map((modulo) => (
              <Link
                key={modulo.href}
                href={modulo.href}
                className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-3xl" aria-hidden="true">
                    {modulo.icon}
                  </span>

                  <span className="text-xl text-stone-300 transition group-hover:text-amber-500">
                    →
                  </span>
                </div>

                <h3 className="mt-5 font-semibold text-stone-900">
                  {modulo.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-stone-500">
                  {modulo.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
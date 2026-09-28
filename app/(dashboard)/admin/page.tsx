import Link from "next/link"

import { getAdminSummary } from "@/lib/data/admin"
import { getReporteAnual } from "@/lib/data/reportes-anuales"
import { ResumenAdminCharts } from "@/components/dashboard/resumen-admin-charts"

const modulos = [
  {
    href: "/admin/personas",
    title: "Personas",
    description: "Consulta registros, estados y asignaciones.",
  },
  {
    href: "/admin/equipo",
    title: "Equipo",
    description: "Revisa consolidadores, líderes y usuarios registrados.",
  },
  {
    href: "/admin/casas",
    title: "Casas de Avivamiento",
    description: "Consulta casas, responsables y personas asignadas.",
  },
  {
    href: "/admin/seguimientos",
    title: "Seguimientos",
    description: "Supervisa la actividad y las tareas pendientes.",
  },
  {
    href: "/admin/reportes",
    title: "Reportes",
    description: "Explora el avance anual y descarga informes.",
  },
]

type StatCardProps = {
  label: string
  value: number
  description: string
  href: string
  tone?: "stone" | "amber" | "blue" | "emerald"
}

function StatCard({
  label,
  value,
  description,
  href,
  tone = "stone",
}: StatCardProps) {
  const tonos = {
    stone: "border-stone-200 bg-white text-stone-900",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-950",
  }

  return (
    <Link
      href={href}
      className={`group flex min-w-0 flex-col rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tonos[tone]}`}
    >
      <span className="text-sm font-medium opacity-75">
        {label}
      </span>

      <span className="mt-3 text-3xl font-bold tabular-nums">
        {value}
      </span>

      <span className="mt-2 text-xs leading-5 opacity-75">
        {description}
      </span>

      <span className="mt-4 text-xs font-semibold underline-offset-4 group-hover:underline">
        Ver detalle
      </span>
    </Link>
  )
}

function anioActualColombia() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      year: "numeric",
    }).format(new Date())
  )
}

export default async function AdminPage() {
  const anio = anioActualColombia()

  const [summary, reporteAnual] = await Promise.all([
    getAdminSummary(),
    getReporteAnual(anio),
  ])

  const porcentajeAsignado =
    summary.totalPersonas > 0
      ? Math.round(
          ((summary.totalPersonas -
            summary.personasSinAsignar) /
            summary.totalPersonas) *
            100
        )
      : 0

  const otrosEstados = Math.max(
    0,
    summary.totalPersonas -
      summary.personasNuevas -
      summary.personasActivas -
      summary.personasConsolidadas
  )

  const estados = [
    {
      nombre: "Nuevas",
      cantidad: summary.personasNuevas,
      color: "#a78bfa",
    },
    {
      nombre: "Activas",
      cantidad: summary.personasActivas,
      color: "#60a5fa",
    },
    {
      nombre: "Consolidadas",
      cantidad: summary.personasConsolidadas,
      color: "#34d399",
    },
    {
      nombre: "Otros estados",
      cantidad: otrosEstados,
      color: "#a8a29e",
    },
  ]

  return (
    <main className="min-h-screen min-w-0 bg-stone-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              Módulo administrativo
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Resumen general
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Indicadores actuales y una vista rápida de la actividad
              del año.
            </p>
          </div>

          <Link
            href={`/admin/reportes?anio=${anio}`}
            className="inline-flex rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100"
          >
            Ver reporte completo
          </Link>
        </header>

        <section aria-labelledby="indicadores-title">
          <h2
            id="indicadores-title"
            className="mb-1 text-lg font-semibold text-stone-900"
          >
            Estado del proceso
          </h2>

          <p className="mb-4 text-sm text-stone-500">
            Totales actuales del sistema.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Personas registradas"
              value={summary.totalPersonas}
              description="Total de personas en el sistema"
              href="/admin/personas"
            />

            <StatCard
              label="Personas nuevas"
              value={summary.personasNuevas}
              description="Pendientes de iniciar su proceso"
              href="/admin/personas?estado=nuevo"
              tone="amber"
            />

            <StatCard
              label="Personas activas"
              value={summary.personasActivas}
              description="En proceso de consolidación"
              href="/admin/personas?estado=activo"
              tone="blue"
            />

            <StatCard
              label="Personas consolidadas"
              value={summary.personasConsolidadas}
              description="Registradas como consolidadas"
              href="/admin/personas?estado=consolidado"
              tone="emerald"
            />
          </div>
        </section>

        <section aria-label="Gráficas del resumen">
          <ResumenAdminCharts
            meses={reporteAnual.meses}
            estados={estados}
            anio={anio}
          />
        </section>

        <section
          aria-labelledby="prioridades-title"
          className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"
        >
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <h2
              id="prioridades-title"
              className="text-lg font-semibold text-stone-900"
            >
              Requieren atención
            </h2>

            <p className="mt-1 text-sm leading-5 text-stone-500">
              Registros que necesitan gestión administrativa.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/admin/personas?asignacion=sin-asignar"
                className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-4 hover:border-red-300"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-red-950">
                    Personas sin asignar
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-red-800">
                    Revisa quién necesita un responsable.
                  </span>
                </span>

                <span className="shrink-0 text-2xl font-bold tabular-nums text-red-800">
                  {summary.personasSinAsignar}
                </span>
              </Link>

              <Link
                href="/admin/seguimientos?estado=pendiente"
                className="flex items-center justify-between gap-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 hover:border-amber-300"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-amber-950">
                    Seguimientos pendientes
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-amber-800">
                    Consulta las acciones por completar.
                  </span>
                </span>

                <span className="shrink-0 text-2xl font-bold tabular-nums text-amber-800">
                  {summary.seguimientosPendientes}
                </span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Organización
            </h2>

            <p className="mt-1 text-sm leading-5 text-stone-500">
              Recursos registrados y cobertura de responsables.
            </p>

            <dl className="mt-5 divide-y divide-stone-100">
              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="text-sm text-stone-600">
                  Casas de Avivamiento
                </dt>
                <dd className="text-lg font-semibold tabular-nums text-stone-900">
                  {summary.casasAvivamiento}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="text-sm text-stone-600">
                  Usuarios registrados
                </dt>
                <dd className="text-lg font-semibold tabular-nums text-stone-900">
                  {summary.usuariosActivos}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="text-sm text-stone-600">
                  Personas con responsable
                </dt>
                <dd className="text-lg font-semibold tabular-nums text-stone-900">
                  {Math.max(
                    0,
                    summary.totalPersonas -
                      summary.personasSinAsignar
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-xl bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-stone-700">
                  Cobertura de asignación
                </span>

                <span className="font-semibold tabular-nums text-stone-900">
                  {porcentajeAsignado}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-amber-600"
                  style={{
                    width: `${porcentajeAsignado}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="etapas-title"
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="etapas-title"
                className="text-lg font-semibold text-stone-900"
              >
                Personas por etapa
              </h2>

              <p className="mt-1 text-sm leading-5 text-stone-500">
                Distribución actual del proceso.
              </p>
            </div>

            <Link
              href="/admin/personas"
              className="text-sm font-semibold text-amber-700 hover:underline"
            >
              Ver personas
            </Link>
          </div>

          <div className="mt-6 space-y-5">
            {summary.porEtapa.map((item) => {
              const porcentaje =
                summary.totalPersonas > 0
                  ? Math.round(
                      (item.cantidad /
                        summary.totalPersonas) *
                        100
                    )
                  : 0

              return (
                <div key={item.etapa}>
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 font-medium text-stone-700">
                      {item.etapa}. {item.label}
                    </span>

                    <span className="shrink-0 font-semibold tabular-nums text-stone-900">
                      {item.cantidad}
                      <span className="ml-2 font-normal text-stone-500">
                        {porcentaje}%
                      </span>
                    </span>
                  </div>

                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-amber-600"
                      style={{
                        width: `${porcentaje}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="modulos-title">
          <div className="mb-4">
            <h2
              id="modulos-title"
              className="text-lg font-semibold text-stone-900"
            >
              Explorar módulos
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Abre un área para consultar su detalle.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {modulos.map((modulo) => (
              <Link
                key={modulo.href}
                href={modulo.href}
                className="group flex min-h-36 flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
              >
                <div>
                  <h3 className="font-semibold text-stone-900">
                    {modulo.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {modulo.description}
                  </p>
                </div>

                <span className="mt-4 text-xs font-semibold text-amber-700 group-hover:underline">
                  Abrir módulo
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
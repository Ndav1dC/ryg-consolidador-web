import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type PersonaReporte = {
  etapa_actual: number | null
  estado_consolidacion: string | null
  asignado_a_id: string | null
  casa_avivamiento_id: string | null
  numero_invalido: boolean | null
}

type SeguimientoReporte = {
  tipo: string | null
  estado: string | null
  paso: number | null
  fecha: string | null
}

function tieneRolAdmin(rol: string | null, roles: string[]) {
  return rol === "admin" || roles.includes("admin")
}

function getEtapaLabel(etapa: number) {
  if (etapa === 1) return "Etapa 1 · Llamada"
  if (etapa === 2) return "Etapa 2 · Asistencia"
  if (etapa === 3) return "Etapa 3 · Casa"
  if (etapa === 4) return "Etapa 4 · Discipulado"
  if (etapa === 5) return "Etapa 5 · Consolidación"

  return `Etapa ${etapa}`
}

export default async function AdminReportesPage() {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const roles = currentUser.profile?.roles ?? []
  const rolPrincipal = currentUser.profile?.rol ?? ""

  if (!tieneRolAdmin(rolPrincipal, roles)) {
    redirect("/dashboard")
  }

  const supabase = await createClient()

  const [
    { data: personas, error: personasError },
    { data: seguimientos, error: seguimientosError },
    { count: casasCount, error: casasError },
  ] = await Promise.all([
    supabase
      .from("personas")
      .select(
        "etapa_actual, estado_consolidacion, asignado_a_id, casa_avivamiento_id, numero_invalido"
      ),

    supabase
      .from("seguimientos")
      .select("tipo, estado, paso, fecha")
      .order("fecha", { ascending: false }),

    supabase
      .from("casas_avivamiento")
      .select("id", { count: "exact", head: true }),
  ])

  if (personasError) {
    console.error("Error cargando reporte de personas:", personasError)
    throw new Error("No se pudo cargar el reporte de personas.")
  }

  if (seguimientosError) {
    console.error(
      "Error cargando reporte de seguimientos:",
      seguimientosError
    )
    throw new Error("No se pudo cargar el reporte de seguimientos.")
  }

  if (casasError) {
    console.error("Error cargando casas:", casasError)
    throw new Error("No se pudo cargar el reporte de casas.")
  }

  const personasNormalizadas = (personas ?? []) as PersonaReporte[]
  const seguimientosNormalizados = (seguimientos ??
    []) as SeguimientoReporte[]

  const personasPorEtapa = [1, 2, 3, 4, 5].map((etapa) => ({
    etapa,
    label: getEtapaLabel(etapa),
    cantidad: personasNormalizadas.filter(
      (persona) => Number(persona.etapa_actual) === etapa
    ).length,
  }))

  const personasConsolidadas = personasNormalizadas.filter(
    (persona) =>
      persona.estado_consolidacion === "consolidado" ||
      Number(persona.etapa_actual) >= 5
  ).length

  const personasSinAsignar = personasNormalizadas.filter(
    (persona) => !persona.asignado_a_id
  ).length

  const personasSinCasa = personasNormalizadas.filter(
    (persona) => !persona.casa_avivamiento_id
  ).length

  const numerosInvalidos = personasNormalizadas.filter(
    (persona) => persona.numero_invalido === true
  ).length

  const seguimientosPendientes = seguimientosNormalizados.filter(
    (seguimiento) => seguimiento.estado === "pendiente"
  ).length

  const seguimientosPorTipo = Array.from(
    new Set(
      seguimientosNormalizados
        .map((seguimiento) => seguimiento.tipo)
        .filter(Boolean)
    )
  ).map((tipo) => ({
    tipo: tipo as string,
    cantidad: seguimientosNormalizados.filter(
      (seguimiento) => seguimiento.tipo === tipo
    ).length,
  }))

  const porcentajeConsolidacion =
    personasNormalizadas.length > 0
      ? Math.round(
          (personasConsolidadas / personasNormalizadas.length) * 100
        )
      : 0

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-stone-200 pb-6">
          <Link
            href="/admin"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800"
          >
            ← Volver al resumen
          </Link>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-amber-700">
            Administración / Reportes
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
            Reportes del proceso
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Analiza el avance de las personas y la actividad general de
            consolidación.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Personas registradas</p>
            <p className="mt-3 text-3xl font-bold text-stone-900">
              {personasNormalizadas.length}
            </p>
          </article>

          <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm text-emerald-700">Consolidadas</p>
            <p className="mt-3 text-3xl font-bold text-emerald-800">
              {personasConsolidadas}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              {porcentajeConsolidacion}% del total
            </p>
          </article>

          <article className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-700">Sin asignar</p>
            <p className="mt-3 text-3xl font-bold text-red-800">
              {personasSinAsignar}
            </p>
          </article>

          <article className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm text-amber-800">Seguimientos</p>
            <p className="mt-3 text-3xl font-bold text-amber-900">
              {seguimientosNormalizados.length}
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">
              Personas por etapa
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Distribución actual del proceso.
            </p>

            <div className="mt-6 space-y-4">
              {personasPorEtapa.map((item) => {
                const porcentaje =
                  personasNormalizadas.length > 0
                    ? Math.round(
                        (item.cantidad / personasNormalizadas.length) * 100
                      )
                    : 0

                return (
                  <div key={item.etapa}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-stone-700">
                        {item.label}
                      </span>

                      <span className="font-bold text-stone-900">
                        {item.cantidad}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-amber-500"
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
              Indicadores de atención
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Registros que necesitan revisión administrativa.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-800">
                  {personasSinAsignar}
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Personas sin responsable
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-2xl font-bold text-amber-900">
                  {seguimientosPendientes}
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Seguimientos pendientes
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-2xl font-bold text-blue-800">
                  {personasSinCasa}
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  Personas sin Casa asignada
                </p>
              </div>

              <div className="rounded-2xl bg-stone-100 p-4">
                <p className="text-2xl font-bold text-stone-800">
                  {numerosInvalidos}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  Números inválidos
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Seguimientos por tipo
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Cantidad de gestiones registradas según su categoría.
          </p>

          {seguimientosPorTipo.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">
              No hay seguimientos registrados.
            </p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {seguimientosPorTipo.map((item) => (
                <div
                  key={item.tipo}
                  className="rounded-2xl bg-stone-50 p-4"
                >
                  <p className="text-sm capitalize text-stone-500">
                    {item.tipo.replaceAll("_", " ")}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-stone-900">
                    {item.cantidad}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/seguimientos"
            className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <h2 className="font-semibold text-stone-900">
              Ver todos los seguimientos
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Consulta la actividad completa del equipo.
            </p>
          </Link>

          <Link
            href="/admin/personas"
            className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <h2 className="font-semibold text-stone-900">
              Ver todas las personas
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Revisa asignaciones, etapas y estados.
            </p>
          </Link>
        </section>
      </div>
    </main>
  )
}
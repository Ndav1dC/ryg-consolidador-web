import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentUserProfile } from "@/lib/auth/get-user"
import { createClient } from "@/lib/supabase/server"
import { getReporteAnual } from "@/lib/data/reportes-anuales"
import { ReportesAnualesCharts } from "@/components/dashboard/reportes-anuales-charts"

type Props = {
  searchParams: Promise<{ anio?: string }>
}

type PersonaEstado = {
  estado_consolidacion: string | null
}

const estados = [
  "Nuevo",
  "Activo",
  "Pendiente",
  "Consolidado",
  "Sin estado",
] as const

function anioActualColombia() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      year: "numeric",
    }).format(new Date())
  )
}

function rangoAnualColombia(anio: number) {
  return {
    inicio: new Date(
      Date.UTC(anio, 0, 1, 5)
    ).toISOString(),
    fin: new Date(
      Date.UTC(anio + 1, 0, 1, 5)
    ).toISOString(),
  }
}

async function contarEstadosDelAnio(anio: number) {
  const supabase = await createClient()
  const { inicio, fin } = rangoAnualColombia(anio)

  const conteos = new Map<string, number>(
    estados.map((estado) => [estado, 0])
  )

  const tamanoPagina = 1000

  for (
    let desde = 0;
    ;
    desde += tamanoPagina
  ) {
    const { data, error } = await supabase
      .from("personas")
      .select("estado_consolidacion")
      .gte("created_at", inicio)
      .lt("created_at", fin)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(desde, desde + tamanoPagina - 1)

    if (error) {
      console.error(
        "Error cargando estados para Reportes:",
        error
      )
      throw new Error(
        "No se pudieron cargar los estados del reporte."
      )
    }

    const registros = (data ?? []) as PersonaEstado[]

    for (const persona of registros) {
      const valor =
        persona.estado_consolidacion?.toLowerCase()

      const etiqueta =
        valor === "nuevo"
          ? "Nuevo"
          : valor === "activo"
            ? "Activo"
            : valor === "pendiente"
              ? "Pendiente"
              : valor === "consolidado"
                ? "Consolidado"
                : "Sin estado"

      conteos.set(
        etiqueta,
        (conteos.get(etiqueta) ?? 0) + 1
      )
    }

    if (registros.length < tamanoPagina) {
      break
    }
  }

  return estados.map((label) => ({
    label,
    cantidad: conteos.get(label) ?? 0,
  }))
}

export default async function AdminReportesPage({
  searchParams,
}: Props) {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const roles = currentUser.profile?.roles ?? []
  const rolPrincipal = currentUser.profile?.rol ?? ""

  if (
    rolPrincipal !== "admin" &&
    !roles.includes("admin")
  ) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const actual = anioActualColombia()
  const solicitado = Number(params.anio)

  const anio =
    params.anio &&
    Number.isInteger(solicitado) &&
    solicitado >= 2026 &&
    solicitado <= actual
      ? solicitado
      : actual

  const [reporte, estadosDelAnio] = await Promise.all([
    getReporteAnual(anio),
    contarEstadosDelAnio(anio),
  ])

  const opcionesAnio = Array.from(
    { length: Math.max(1, actual - 2026 + 1) },
    (_, indice) => actual - indice
  )

  return (
    <main className="min-h-screen min-w-0 bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-amber-700 hover:underline"
            >
              Volver al resumen
            </Link>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Administración / Reportes
            </p>

            <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
              Reporte anual
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Consulta la actividad mes a mes y el estado actual de
              las personas registradas durante el año seleccionado.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <form
              action="/admin/reportes"
              method="get"
              className="flex items-end gap-2"
            >
              <div>
                <label
                  htmlFor="anio"
                  className="mb-1 block text-xs font-semibold text-stone-600"
                >
                  Año
                </label>

                <select
                  id="anio"
                  name="anio"
                  defaultValue={String(anio)}
                  className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900"
                >
                  {opcionesAnio.map((opcion) => (
                    <option
                      key={opcion}
                      value={opcion}
                    >
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
              >
                Ver año
              </button>
            </form>

            <a
              href={`/admin/reportes/pdf?anio=${anio}`}
              className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Descargar PDF de {anio}
            </a>
          </div>
        </header>

        <section
          aria-label="Totales del año"
          className="grid gap-3 sm:grid-cols-2"
        >
          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Personas registradas en {anio}
            </p>

            <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">
              {reporte.totalPersonasRegistradas}
            </p>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Seguimientos registrados en {anio}
            </p>

            <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">
              {reporte.totalSeguimientosRegistrados}
            </p>
          </article>
        </section>

        <ReportesAnualesCharts
          meses={reporte.meses}
          estados={estadosDelAnio}
        />

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Detalle mes a mes
          </h2>

          <p className="mt-1 text-sm leading-5 text-stone-500">
            Cifras según la fecha de registro y la fecha de
            seguimiento, en horario de Colombia.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[540px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 font-semibold"
                  >
                    Mes
                  </th>

                  <th
                    scope="col"
                    className="px-3 py-3 text-right font-semibold"
                  >
                    Personas registradas
                  </th>

                  <th
                    scope="col"
                    className="px-3 py-3 text-right font-semibold"
                  >
                    Seguimientos registrados
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {reporte.meses.map((mes) => (
                  <tr key={mes.numero}>
                    <td className="px-3 py-3 font-medium text-stone-800">
                      {mes.nombre}
                    </td>

                    <td className="px-3 py-3 text-right tabular-nums text-stone-700">
                      {mes.personasRegistradas}
                    </td>

                    <td className="px-3 py-3 text-right tabular-nums text-stone-700">
                      {mes.seguimientosRegistrados}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="border-t border-stone-200 bg-stone-50 font-semibold text-stone-900">
                <tr>
                  <td className="px-3 py-3">
                    Total anual
                  </td>

                  <td className="px-3 py-3 text-right tabular-nums">
                    {reporte.totalPersonasRegistradas}
                  </td>

                  <td className="px-3 py-3 text-right tabular-nums">
                    {reporte.totalSeguimientosRegistrados}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <p className="text-xs leading-5 text-stone-500">
          Los estados muestran la situación actual de las personas
          registradas en {anio}. No indican en qué mes cambió su
          estado ni constituyen un historial de consolidaciones.
        </p>
      </div>
    </main>
  )
}
import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type Props = {
  searchParams: Promise<{
    buscar?: string
    estado?: string
    tipo?: string
  }>
}

type Seguimiento = {
  id: string
  persona_id: string
  fecha: string | null
  tipo: string | null
  resultado: string | null
  observaciones: string | null
  paso: number | null
  casa: string | null
  lider: string | null
  ministerio: string | null
  nivel_discipulado: string | null
  estado: string | null
  fecha_programada: string | null
  persona:
    | {
        id: string
        nombre_completo: string
        celular: string | null
        barrio: string | null
      }
    | {
        id: string
        nombre_completo: string
        celular: string | null
        barrio: string | null
      }[]
    | null
}

function tieneRolAdmin(rol: string | null, roles: string[]) {
  return rol === "admin" || roles.includes("admin")
}

function formatDate(value: string | null) {
  if (!value) return "No registrada"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida"
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getPersona(
  persona: Seguimiento["persona"]
) {
  return Array.isArray(persona) ? persona[0] ?? null : persona
}

function getPasoLabel(paso: number | null) {
  if (paso === 1) return "Etapa 1 · Llamada"
  if (paso === 2) return "Etapa 2 · Asistencia"
  if (paso === 3) return "Etapa 3 · Casa"
  if (paso === 4) return "Etapa 4 · Discipulado"
  if (paso === 5) return "Etapa 5 · Ministerio"

  return "Sin etapa"
}

function getEstadoClasses(estado: string | null) {
  const value = estado?.toLowerCase()

  if (value === "completado" || value === "consolidado") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (value === "pendiente") {
    return "bg-amber-100 text-amber-800"
  }

  if (value === "activo" || value === "en proceso") {
    return "bg-blue-100 text-blue-700"
  }

  return "bg-stone-100 text-stone-600"
}

export default async function AdminSeguimientosPage({
  searchParams,
}: Props) {
  const params = await searchParams

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

  let query = supabase
    .from("seguimientos")
    .select(`
      id,
      persona_id,
      fecha,
      tipo,
      resultado,
      observaciones,
      paso,
      casa,
      lider,
      ministerio,
      nivel_discipulado,
      estado,
      fecha_programada,
      persona:personas (
        id,
        nombre_completo,
        celular,
        barrio
      )
    `)
    .order("fecha", { ascending: false })

  if (params.estado?.trim()) {
    query = query.eq("estado", params.estado.trim())
  }

  if (params.tipo?.trim()) {
    query = query.eq("tipo", params.tipo.trim())
  }

  const { data, error } = await query

  if (error) {
    console.error("Error cargando seguimientos administrativos:", error)
    throw new Error("No se pudieron cargar los seguimientos.")
  }

  let seguimientos = (data ?? []) as Seguimiento[]

  const buscar = params.buscar?.trim().toLowerCase()

  if (buscar) {
    seguimientos = seguimientos.filter((seguimiento) => {
      const persona = getPersona(seguimiento.persona)

      return [
        persona?.nombre_completo,
        persona?.celular,
        persona?.barrio,
        seguimiento.tipo,
        seguimiento.resultado,
        seguimiento.observaciones,
        seguimiento.casa,
        seguimiento.lider,
        seguimiento.ministerio,
        seguimiento.nivel_discipulado,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(buscar)
        )
    })
  }

  const pendientes = seguimientos.filter(
    (seguimiento) => seguimiento.estado === "pendiente"
  ).length

  const completados = seguimientos.filter(
    (seguimiento) =>
      seguimiento.estado === "completado" ||
      seguimiento.estado === "consolidado"
  ).length

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
            Administración / Seguimientos
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
            Actividad de seguimientos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Supervisa las gestiones realizadas por consolidadores y líderes de
            Casa.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Gestiones encontradas</p>
            <p className="mt-3 text-3xl font-bold text-stone-900">
              {seguimientos.length}
            </p>
          </article>

          <article className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm text-amber-800">Pendientes</p>
            <p className="mt-3 text-3xl font-bold text-amber-900">
              {pendientes}
            </p>
          </article>

          <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm text-emerald-700">Completados</p>
            <p className="mt-3 text-3xl font-bold text-emerald-800">
              {completados}
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
            <input
              type="search"
              name="buscar"
              defaultValue={params.buscar ?? ""}
              placeholder="Buscar persona, barrio, casa u observación"
              className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
            />

            <select
              name="estado"
              defaultValue={params.estado ?? ""}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="consolidado">Consolidado</option>
            </select>

            <select
              name="tipo"
              defaultValue={params.tipo ?? ""}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Todos los tipos</option>
              <option value="llamada">Llamada</option>
              <option value="culto">Culto</option>
              <option value="visita">Visita</option>
              <option value="casa_avivamiento">
                Casa de Avivamiento
              </option>
              <option value="discipulado">Discipulado</option>
              <option value="ministerio">Ministerio</option>
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Filtrar
            </button>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-5">
            <h2 className="text-lg font-semibold text-stone-900">
              Historial general
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Todas las gestiones registradas en el sistema.
            </p>
          </div>

          {seguimientos.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-stone-900">
                No hay seguimientos para mostrar
              </p>

              <p className="mt-1 text-sm text-stone-500">
                Prueba quitando filtros o registra una nueva gestión.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Persona</th>
                    <th className="px-5 py-3.5 font-semibold">Etapa</th>
                    <th className="px-5 py-3.5 font-semibold">Tipo</th>
                    <th className="px-5 py-3.5 font-semibold">Fecha</th>
                    <th className="px-5 py-3.5 font-semibold">Resultado</th>
                    <th className="px-5 py-3.5 font-semibold">Estado</th>
                    <th className="px-5 py-3.5 font-semibold">Detalles</th>
                    <th className="px-5 py-3.5 font-semibold">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {seguimientos.map((seguimiento) => {
                    const persona = getPersona(seguimiento.persona)

                    return (
                      <tr
                        key={seguimiento.id}
                        className="transition hover:bg-stone-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-900">
                            {persona?.nombre_completo || "Sin persona"}
                          </p>

                          <p className="mt-1 text-xs text-stone-500">
                            {persona?.barrio || "Sin barrio"}
                            {persona?.celular
                              ? ` · ${persona.celular}`
                              : ""}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-medium text-stone-700">
                          {getPasoLabel(seguimiento.paso)}
                        </td>

                        <td className="px-5 py-4 capitalize text-stone-600">
                          {seguimiento.tipo || "Sin tipo"}
                        </td>

                        <td className="px-5 py-4 text-stone-600">
                          {formatDate(seguimiento.fecha)}
                        </td>

                        <td className="max-w-[220px] px-5 py-4 text-stone-600">
                          {seguimiento.resultado ||
                            seguimiento.observaciones ||
                            "Sin resultado"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                              seguimiento.estado
                            )}`}
                          >
                            {seguimiento.estado || "Sin estado"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-stone-600">
                          {seguimiento.casa ||
                            seguimiento.lider ||
                            seguimiento.ministerio ||
                            seguimiento.nivel_discipulado ||
                            "Sin detalles"}
                        </td>

                        <td className="px-5 py-4">
                          {seguimiento.persona_id ? (
                            <Link
                              href={`/personas/${seguimiento.persona_id}`}
                              className="inline-flex rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
                            >
                              Ver persona
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
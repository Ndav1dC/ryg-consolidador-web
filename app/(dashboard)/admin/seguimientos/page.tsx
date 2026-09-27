import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type Filtros = {
  buscar?: string
  estado?: string
  tipo?: string
}

type Props = {
  searchParams: Promise<Filtros>
}

type PersonaRelacionada = {
  id: string
  nombre_completo: string
  celular: string | null
  barrio: string | null
}

type Seguimiento = {
  id: string
  persona_id: string | null
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
    | PersonaRelacionada
    | PersonaRelacionada[]
    | null
}

const estadosRapidos = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "activo", label: "Activos" },
  { value: "completado", label: "Completados" },
  { value: "consolidado", label: "Consolidados" },
]

function getPersona(persona: Seguimiento["persona"]) {
  return Array.isArray(persona)
    ? persona[0] ?? null
    : persona
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
  const valor = estado?.toLowerCase()

  if (valor === "completado" || valor === "consolidado") {
    return "bg-emerald-50 text-emerald-800"
  }

  if (valor === "pendiente") {
    return "bg-amber-50 text-amber-800"
  }

  if (valor === "activo" || valor === "en proceso") {
    return "bg-blue-50 text-blue-800"
  }

  return "bg-stone-100 text-stone-700"
}

function getEstadoLabel(estado: string | null) {
  if (!estado) return "Sin estado"

  return estado.charAt(0).toUpperCase() + estado.slice(1)
}

function getTipoLabel(tipo: string | null) {
  if (!tipo) return "Sin tipo"

  const nombres: Record<string, string> = {
    llamada: "Llamada",
    culto: "Culto",
    visita: "Visita",
    casa_avivamiento: "Casa de Avivamiento",
    discipulado: "Discipulado",
    ministerio: "Ministerio",
  }

  return nombres[tipo] ?? tipo.replaceAll("_", " ")
}

function formatDate(value: string | null) {
  if (!value) return "No registrada"

  const fecha = value.includes("T")
    ? new Date(value)
    : new Date(`${value.slice(0, 10)}T12:00:00`)

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha inválida"
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha)
}

function getDetalle(seguimiento: Seguimiento) {
  return (
    seguimiento.resultado ||
    seguimiento.observaciones ||
    seguimiento.casa ||
    seguimiento.lider ||
    seguimiento.ministerio ||
    seguimiento.nivel_discipulado ||
    "Sin detalles registrados"
  )
}

function enlaceEstado(filtros: Filtros, estado: string) {
  const query = new URLSearchParams()

  if (filtros.buscar) {
    query.set("buscar", filtros.buscar)
  }

  if (estado) {
    query.set("estado", estado)
  }

  if (filtros.tipo) {
    query.set("tipo", filtros.tipo)
  }

  const cadena = query.toString()

  return cadena
    ? `/admin/seguimientos?${cadena}`
    : "/admin/seguimientos"
}

export default async function AdminSeguimientosPage({
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

  const filtros: Filtros = {
    buscar: params.buscar?.trim() ?? "",
    estado: params.estado?.trim() ?? "",
    tipo: params.tipo?.trim() ?? "",
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

  if (filtros.estado) {
    query = query.eq("estado", filtros.estado)
  }

  if (filtros.tipo) {
    query = query.eq("tipo", filtros.tipo)
  }

  const { data, error } = await query

  if (error) {
    console.error(
      "Error cargando seguimientos administrativos:",
      error
    )
    throw new Error(
      "No se pudieron cargar los seguimientos."
    )
  }

  const registros = (data ?? []) as Seguimiento[]
  const textoBusqueda =
    filtros.buscar?.toLocaleLowerCase("es-CO") ?? ""

  const seguimientos = textoBusqueda
    ? registros.filter((seguimiento) => {
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
          .some((valor) =>
            String(valor)
              .toLocaleLowerCase("es-CO")
              .includes(textoBusqueda)
          )
      })
    : registros

  const pendientes = seguimientos.filter(
    (seguimiento) =>
      seguimiento.estado?.toLowerCase() === "pendiente"
  ).length

  const completados = seguimientos.filter(
    (seguimiento) =>
      seguimiento.estado?.toLowerCase() === "completado" ||
      seguimiento.estado?.toLowerCase() === "consolidado"
  ).length

  const hayFiltros = Boolean(
    filtros.buscar || filtros.estado || filtros.tipo
  )

  return (
    <main className="min-h-screen min-w-0 bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-stone-200 pb-5">
          <Link
            href="/admin"
            className="text-sm font-semibold text-amber-700 hover:underline"
          >
            Volver al resumen
          </Link>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Administración / Seguimientos
          </p>

          <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
            Seguimientos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Consulta las gestiones registradas, identifica las
            pendientes y abre la ficha de cada persona.
          </p>
        </header>

        <section
          aria-label="Indicadores de seguimientos"
          className="grid gap-3 sm:grid-cols-3"
        >
          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Gestiones encontradas
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">
              {seguimientos.length}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm text-amber-800">
              Pendientes
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-amber-900">
              {pendientes}
            </p>
          </article>

          <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm text-emerald-800">
              Completadas o consolidadas
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-900">
              {completados}
            </p>
          </article>
        </section>

        <section
          aria-label="Buscar y filtrar seguimientos"
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <form
            action="/admin/seguimientos"
            method="get"
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="buscar"
                className="mb-2 block text-sm font-semibold text-stone-800"
              >
                Buscar seguimiento
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="buscar"
                  type="search"
                  name="buscar"
                  defaultValue={filtros.buscar}
                  placeholder="Persona, barrio, casa u observación"
                  className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-500"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700"
                >
                  Buscar y aplicar
                </button>
              </div>
            </div>

            <div className="grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="estado"
                  className="mb-1.5 block text-xs font-semibold text-stone-600"
                >
                  Estado
                </label>

                <select
                  id="estado"
                  name="estado"
                  defaultValue={filtros.estado}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="consolidado">Consolidado</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="tipo"
                  className="mb-1.5 block text-xs font-semibold text-stone-600"
                >
                  Tipo
                </label>

                <select
                  id="tipo"
                  name="tipo"
                  defaultValue={filtros.tipo}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700"
                >
                  <option value="">Todos los tipos</option>
                  <option value="llamada">Llamada</option>
                  <option value="culto">Culto</option>
                  <option value="visita">Visita</option>
                  <option value="casa_avivamiento">
                    Casa de Avivamiento
                  </option>
                  <option value="discipulado">
                    Discipulado
                  </option>
                  <option value="ministerio">Ministerio</option>
                </select>
              </div>
            </div>
          </form>

          <div className="mt-5 border-t border-stone-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Vistas rápidas
            </p>

            <div className="flex flex-wrap gap-2">
              {estadosRapidos.map((item) => {
                const seleccionado =
                  (filtros.estado ?? "") === item.value

                return (
                  <Link
                    key={item.label}
                    href={enlaceEstado(
                      filtros,
                      item.value
                    )}
                    aria-current={
                      seleccionado ? "page" : undefined
                    }
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      seleccionado
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:border-amber-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {hayFiltros && (
            <div className="mt-4 flex justify-end">
              <Link
                href="/admin/seguimientos"
                className="text-sm font-semibold text-amber-700 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="historial-title">
          <div className="mb-3">
            <h2
              id="historial-title"
              className="text-lg font-semibold text-stone-900"
            >
              Historial de gestiones
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {seguimientos.length}{" "}
              {seguimientos.length === 1
                ? "registro encontrado"
                : "registros encontrados"}
            </p>
          </div>

          {seguimientos.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-stone-900">
                No hay seguimientos para mostrar
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Prueba otra búsqueda o limpia los filtros.
              </p>

              <Link
                href="/admin/seguimientos"
                className="mt-4 inline-block text-sm font-semibold text-amber-700 hover:underline"
              >
                Ver todos los seguimientos
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {seguimientos.map((seguimiento) => {
                  const persona = getPersona(
                    seguimiento.persona
                  )

                  return (
                    <article
                      key={seguimiento.id}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="min-w-0 break-words font-semibold text-stone-900">
                          {persona?.nombre_completo ||
                            "Sin persona"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                            seguimiento.estado
                          )}`}
                        >
                          {getEstadoLabel(
                            seguimiento.estado
                          )}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-stone-500">
                        {getPasoLabel(seguimiento.paso)}
                      </p>

                      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-sm">
                        <div>
                          <dt className="text-xs text-stone-500">
                            Tipo
                          </dt>
                          <dd className="mt-1 font-medium text-stone-800">
                            {getTipoLabel(
                              seguimiento.tipo
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs text-stone-500">
                            Gestión
                          </dt>
                          <dd className="mt-1 text-stone-800">
                            {formatDate(
                              seguimiento.fecha
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs text-stone-500">
                            Programada
                          </dt>
                          <dd className="mt-1 text-stone-800">
                            {formatDate(
                              seguimiento.fecha_programada
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs text-stone-500">
                            Barrio
                          </dt>
                          <dd className="mt-1 break-words text-stone-800">
                            {persona?.barrio ||
                              "Sin barrio"}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 rounded-xl bg-stone-50 p-3">
                        <p className="text-xs font-semibold text-stone-600">
                          Resultado o detalle
                        </p>
                        <p className="mt-1 break-words text-sm leading-5 text-stone-800">
                          {getDetalle(seguimiento)}
                        </p>
                      </div>

                      {seguimiento.persona_id && (
                        <Link
                          href={`/personas/${seguimiento.persona_id}`}
                          className="mt-4 block rounded-xl bg-stone-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
                        >
                          Ver persona
                        </Link>
                      )}
                    </article>
                  )
                })}
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-600">
                    <tr>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Persona
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Gestión
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Resultado o detalle
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Acción
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {seguimientos.map((seguimiento) => {
                      const persona = getPersona(
                        seguimiento.persona
                      )

                      return (
                        <tr
                          key={seguimiento.id}
                          className="hover:bg-stone-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-stone-900">
                              {persona?.nombre_completo ||
                                "Sin persona"}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {persona?.barrio ||
                                "Sin barrio"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-stone-800">
                              {getTipoLabel(
                                seguimiento.tipo
                              )}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {getPasoLabel(
                                seguimiento.paso
                              )}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {formatDate(
                                seguimiento.fecha
                              )}
                            </p>
                            {seguimiento.fecha_programada && (
                              <p className="mt-1 text-xs text-stone-500">
                                Programada:{" "}
                                {formatDate(
                                  seguimiento.fecha_programada
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                                seguimiento.estado
                              )}`}
                            >
                              {getEstadoLabel(
                                seguimiento.estado
                              )}
                            </span>
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="break-words leading-5 text-stone-700">
                              {getDetalle(seguimiento)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {seguimiento.persona_id && (
                              <Link
                                href={`/personas/${seguimiento.persona_id}`}
                                className="text-xs font-semibold text-amber-700 hover:underline"
                              >
                                Ver persona
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
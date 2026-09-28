import Link from "next/link"
import { redirect } from "next/navigation"
import { getTodasLasPersonasAdmin } from "@/lib/data/personas"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type Filtros = {
  buscar?: string
  estado?: string
  etapa?: string
  asignacion?: string
}

type AdminPersonasPageProps = {
  searchParams: Promise<Filtros>
}

const filtrosRapidos = [
  { label: "Todas", estado: "", asignacion: "" },
  { label: "Nuevas", estado: "nuevo", asignacion: "" },
  { label: "Activas", estado: "activo", asignacion: "" },
  { label: "Pendientes", estado: "pendiente", asignacion: "" },
  { label: "Consolidadas", estado: "consolidado", asignacion: "" },
  { label: "Sin asignar", estado: "", asignacion: "sin-asignar" },
]

function crearEnlaceFiltro(
  filtros: Filtros,
  cambios: Partial<Filtros>
) {
  const siguientes = { ...filtros, ...cambios }
  const query = new URLSearchParams()

  if (siguientes.buscar) query.set("buscar", siguientes.buscar)
  if (siguientes.estado) query.set("estado", siguientes.estado)
  if (siguientes.etapa) query.set("etapa", siguientes.etapa)
  if (siguientes.asignacion) {
    query.set("asignacion", siguientes.asignacion)
  }

  const cadena = query.toString()
  return cadena ? `/admin/personas?${cadena}` : "/admin/personas"
}

function getEstadoClasses(estado: string | null) {
  if (estado === "consolidado") {
    return "bg-emerald-50 text-emerald-800"
  }
  if (estado === "activo") {
    return "bg-sky-50 text-sky-800"
  }
  if (estado === "pendiente") {
    return "bg-amber-50 text-amber-800"
  }
  if (estado === "nuevo") {
    return "bg-violet-50 text-violet-800"
  }
  return "bg-stone-100 text-stone-700"
}

function getEstadoLabel(estado: string | null) {
  if (estado === "consolidado") return "Consolidado"
  if (estado === "activo") return "Activo"
  if (estado === "pendiente") return "Pendiente"
  if (estado === "nuevo") return "Nuevo"
  return "Sin estado"
}

function getEtapaLabel(etapa: number | null) {
  if (etapa == null) return "Sin etapa"
  if (etapa <= 1) return "Etapa 1 · Primera llamada"
  if (etapa === 2) return "Etapa 2 · Asistencia"
  if (etapa === 3) return "Etapa 3 · Casa"
  if (etapa === 4) return "Etapa 4 · Discipulado"
  return "Etapa 5 · Consolidación"
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin gestión"

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${fecha.slice(0, 10)}T12:00:00`))
}

export default async function AdminPersonasPage({
  searchParams,
}: AdminPersonasPageProps) {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const roles = currentUser.profile?.roles ?? []
  const rol = currentUser.profile?.rol ?? ""

  if (rol !== "admin" && !roles.includes("admin")) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const filtros: Filtros = {
    buscar: params.buscar?.trim() || "",
    estado: params.estado || "",
    etapa: params.etapa || "",
    asignacion: params.asignacion || "",
  }

  const { buscar, estado, etapa, asignacion } = filtros
  const todasLasPersonas = await getTodasLasPersonasAdmin()
  const textoBusqueda = buscar?.toLocaleLowerCase("es-CO") || ""

  const personas = todasLasPersonas.filter((persona) => {
    const coincideBusqueda =
      !textoBusqueda ||
      persona.nombre_completo
        .toLocaleLowerCase("es-CO")
        .includes(textoBusqueda) ||
      persona.celular?.includes(buscar || "") ||
      persona.barrio
        ?.toLocaleLowerCase("es-CO")
        .includes(textoBusqueda)

    const coincideEstado =
      !estado || persona.estado_consolidacion === estado

    const coincideEtapa =
      !etapa || Number(persona.etapa_actual) === Number(etapa)

    const coincideAsignacion =
      !asignacion ||
      (asignacion === "asignadas" &&
        Boolean(persona.asignado_a_id)) ||
      (asignacion === "sin-asignar" &&
        !persona.asignado_a_id) ||
      (asignacion === "numeros-invalidos" &&
        persona.numero_invalido === true)

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincideEtapa &&
      coincideAsignacion
    )
  })

  const hayFiltros = Boolean(
    buscar || estado || etapa || asignacion
  )

  return (
    <main className="min-h-screen min-w-0 bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-stone-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Administración / Personas
          </p>

          <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
            Personas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Encuentra registros, revisa su estado y abre la ficha de
            quien necesite atención.
          </p>
        </header>

        <section
          aria-label="Buscar y filtrar personas"
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <form
            action="/admin/personas"
            method="get"
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="buscar"
                className="mb-2 block text-sm font-semibold text-stone-800"
              >
                Buscar persona
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="buscar"
                  type="search"
                  name="buscar"
                  defaultValue={buscar}
                  placeholder="Nombre, celular o barrio"
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

            <div className="grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-3">
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
                  defaultValue={estado}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700"
                >
                  <option value="">Todos</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="consolidado">Consolidado</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="etapa"
                  className="mb-1.5 block text-xs font-semibold text-stone-600"
                >
                  Etapa
                </label>
                <select
                  id="etapa"
                  name="etapa"
                  defaultValue={etapa}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700"
                >
                  <option value="">Todas</option>
                  <option value="1">Etapa 1</option>
                  <option value="2">Etapa 2</option>
                  <option value="3">Etapa 3</option>
                  <option value="4">Etapa 4</option>
                  <option value="5">Etapa 5</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="asignacion"
                  className="mb-1.5 block text-xs font-semibold text-stone-600"
                >
                  Asignación
                </label>
                <select
                  id="asignacion"
                  name="asignacion"
                  defaultValue={asignacion}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700"
                >
                  <option value="">Todas</option>
                  <option value="asignadas">Con responsable</option>
                  <option value="sin-asignar">Sin responsable</option>
                  <option value="numeros-invalidos">
                    Números inválidos
                  </option>
                </select>
              </div>
            </div>
          </form>

          <div className="mt-5 border-t border-stone-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Vistas rápidas
            </p>

            <div className="flex flex-wrap gap-2">
              {filtrosRapidos.map((filtro) => {
                const seleccionado =
                  (estado || "") === filtro.estado &&
                  (asignacion || "") === filtro.asignacion

                return (
                  <Link
                    key={filtro.label}
                    href={crearEnlaceFiltro(filtros, {
                      estado: filtro.estado,
                      asignacion: filtro.asignacion,
                    })}
                    aria-current={
                      seleccionado ? "page" : undefined
                    }
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      seleccionado
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:border-amber-400"
                    }`}
                  >
                    {filtro.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {hayFiltros && (
            <div className="mt-4 flex justify-end">
              <Link
                href="/admin/personas"
                className="text-sm font-semibold text-amber-700 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="resultados-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="resultados-title"
                className="text-lg font-semibold text-stone-900"
              >
                Resultados
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                {personas.length} de {todasLasPersonas.length}{" "}
                personas
              </p>
            </div>
          </div>

          {personas.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-stone-900">
                No se encontraron personas
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Prueba con otra búsqueda o limpia los filtros.
              </p>
              <Link
                href="/admin/personas"
                className="mt-4 inline-block text-sm font-semibold text-amber-700 hover:underline"
              >
                Ver todas las personas
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {personas.map((persona) => (
                  <article
                    key={persona.id}
                    className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-stone-900">
                          {persona.nombre_completo}
                        </h3>
                        <p className="mt-1 text-xs text-stone-500">
                          {getEtapaLabel(persona.etapa_actual)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                          persona.estado_consolidacion
                        )}`}
                      >
                        {getEstadoLabel(
                          persona.estado_consolidacion
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-stone-500">Celular</p>
                        <p className="mt-1 break-words font-medium text-stone-800">
                          {persona.celular || "Sin celular"}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-500">
                          Responsable
                        </p>
                        <p className="mt-1 font-medium text-stone-800">
                          {persona.asignado_a_id
                            ? "Asignado"
                            : "Sin asignar"}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-500">Barrio</p>
                        <p className="mt-1 break-words font-medium text-stone-800">
                          {persona.barrio || "Sin barrio"}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-500">
                          Última gestión
                        </p>
                        <p className="mt-1 font-medium text-stone-800">
                          {formatearFecha(
                            persona.ultima_gestion_fecha
                          )}
                        </p>
                      </div>
                    </div>

                    {persona.numero_invalido && (
                      <p className="mt-4 text-xs font-medium text-red-700">
                        Celular marcado como inválido
                      </p>
                    )}

                    <Link
                      href={`/personas/${persona.id}`}
                      className="mt-4 block rounded-xl bg-stone-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Abrir ficha
                    </Link>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-600">
                    <tr>
                      <th scope="col" className="px-5 py-4 font-semibold">
                        Persona
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold">
                        Estado y etapa
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold">
                        Contacto
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold">
                        Responsable
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold">
                        Última gestión
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold">
                        Acción
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {personas.map((persona) => (
                      <tr
                        key={persona.id}
                        className="hover:bg-stone-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-900">
                            {persona.nombre_completo}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {persona.barrio || "Sin barrio"}
                          </p>
                          {persona.numero_invalido && (
                            <p className="mt-1 text-xs text-red-700">
                              Celular inválido
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                              persona.estado_consolidacion
                            )}`}
                          >
                            {getEstadoLabel(
                              persona.estado_consolidacion
                            )}
                          </span>
                          <p className="mt-1.5 text-xs text-stone-600">
                            {getEtapaLabel(
                              persona.etapa_actual
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-stone-700">
                          {persona.celular || "Sin celular"}
                        </td>

                        <td className="px-5 py-4 text-stone-700">
                          {persona.asignado_a_id
                            ? "Asignado"
                            : "Sin asignar"}
                        </td>

                        <td className="px-5 py-4 text-stone-600">
                          {formatearFecha(
                            persona.ultima_gestion_fecha
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/personas/${persona.id}`}
                            className="inline-flex rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-700"
                          >
                            Abrir ficha
                          </Link>
                        </td>
                      </tr>
                    ))}
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
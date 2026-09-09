import Link from "next/link"
import { redirect } from "next/navigation"
import { getTodasLasPersonasAdmin } from "@/lib/data/personas"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type AdminPersonasPageProps = {
  searchParams: Promise<{
    buscar?: string
    estado?: string
    etapa?: string
    asignacion?: string
  }>
}

function getEstadoClasses(estado: string | null) {
  if (estado === "consolidado") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (estado === "activo") {
    return "bg-sky-100 text-sky-700"
  }

  if (estado === "pendiente") {
    return "bg-amber-100 text-amber-700"
  }

  if (estado === "nuevo") {
    return "bg-violet-100 text-violet-700"
  }

  return "bg-stone-100 text-stone-600"
}

function getEstadoLabel(estado: string | null) {
  if (estado === "consolidado") return "Consolidado"
  if (estado === "activo") return "Activo"
  if (estado === "pendiente") return "Pendiente"
  if (estado === "nuevo") return "Nuevo"

  return "Sin estado"
}

function getEtapaLabel(etapa: number | null) {
  if (!etapa || etapa <= 1) return "Etapa 1 · Primera llamada"
  if (etapa === 2) return "Etapa 2 · Asistencia"
  if (etapa === 3) return "Etapa 3 · Casa"
  if (etapa === 4) return "Etapa 4 · Discipulado"
  if (etapa >= 5) return "Etapa 5 · Consolidación"

  return "Sin etapa"
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

  const params = await searchParams
  const buscar = params.buscar?.trim() || ""
  const estado = params.estado || ""
  const etapa = params.etapa || ""
  const asignacion = params.asignacion || ""

  const todasLasPersonas = await getTodasLasPersonasAdmin()

  const personas = todasLasPersonas.filter((persona) => {
    const textoBusqueda = buscar.toLocaleLowerCase()

    const coincideBusqueda =
      !textoBusqueda ||
      persona.nombre_completo.toLocaleLowerCase().includes(textoBusqueda) ||
      persona.celular?.includes(buscar) ||
      persona.barrio?.toLocaleLowerCase().includes(textoBusqueda)

    const coincideEstado =
      !estado || persona.estado_consolidacion === estado

    const coincideEtapa =
      !etapa || Number(persona.etapa_actual) === Number(etapa)

    const coincideAsignacion =
      !asignacion ||
      (asignacion === "asignadas" && Boolean(persona.asignado_a_id)) ||
      (asignacion === "sin-asignar" && !persona.asignado_a_id) ||
      (asignacion === "numeros-invalidos" &&
        persona.numero_invalido === true)

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincideEtapa &&
      coincideAsignacion
    )
  })

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-stone-200 pb-6">
          <p className="text-sm font-medium text-amber-700">
            Administración / Personas
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
            Gestión de personas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Consulta todos los registros, identifica personas sin responsable
            y revisa el avance de cada proceso de consolidación.
          </p>
        </header>

        <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_200px_auto]">
            <input
              type="search"
              name="buscar"
              defaultValue={buscar}
              placeholder="Buscar por nombre, celular o barrio"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500"
            />

            <select
              name="estado"
              defaultValue={estado}
              className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700 outline-none focus:border-amber-500"
            >
              <option value="">Todos los estados</option>
              <option value="nuevo">Nuevas</option>
              <option value="activo">Activas</option>
              <option value="pendiente">Pendientes</option>
              <option value="consolidado">Consolidadas</option>
            </select>

            <select
              name="etapa"
              defaultValue={etapa}
              className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700 outline-none focus:border-amber-500"
            >
              <option value="">Todas las etapas</option>
              <option value="1">Etapa 1</option>
              <option value="2">Etapa 2</option>
              <option value="3">Etapa 3</option>
              <option value="4">Etapa 4</option>
              <option value="5">Etapa 5</option>
            </select>

            <select
              name="asignacion"
              defaultValue={asignacion}
              className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700 outline-none focus:border-amber-500"
            >
              <option value="">Todas las asignaciones</option>
              <option value="asignadas">Con responsable</option>
              <option value="sin-asignar">Sin responsable</option>
              <option value="numeros-invalidos">Números inválidos</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Aplicar
            </button>
          </form>

          {(buscar || estado || etapa || asignacion) && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-stone-600">
                Se encontraron{" "}
                <span className="font-semibold text-stone-900">
                  {personas.length}
                </span>{" "}
                resultados.
              </p>

              <Link
                href="/admin/personas"
                className="text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Directorio de personas
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                {personas.length}{" "}
                {personas.length === 1
                  ? "registro encontrado"
                  : "registros encontrados"}
              </p>
            </div>

            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600">
              Total general: {todasLasPersonas.length}
            </span>
          </div>

          {personas.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-stone-900">
                No se encontraron personas
              </p>

              <p className="mt-1 text-sm text-stone-500">
                Ajusta o limpia los filtros para consultar otros registros.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1040px] w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Persona</th>
                    <th className="px-5 py-3.5 font-semibold">Contacto</th>
                    <th className="px-5 py-3.5 font-semibold">Ubicación</th>
                    <th className="px-5 py-3.5 font-semibold">Estado</th>
                    <th className="px-5 py-3.5 font-semibold">Etapa</th>
                    <th className="px-5 py-3.5 font-semibold">
                      Última gestión
                    </th>
                    <th className="px-5 py-3.5 font-semibold">
                      Asignación
                    </th>
                    <th className="px-5 py-3.5 font-semibold">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {personas.map((persona) => (
                    <tr
                      key={persona.id}
                      className="transition hover:bg-stone-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">
                            {persona.nombre_completo
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-stone-900">
                              {persona.nombre_completo}
                            </p>

                            <p className="mt-0.5 text-xs text-stone-500">
                              {persona.numero_invalido
                                ? "Celular marcado como inválido"
                                : persona.proximo_paso ||
                                  "Sin próxima acción definida"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {persona.celular || "Sin celular"}
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {persona.barrio || "Sin barrio"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                            persona.estado_consolidacion
                          )}`}
                        >
                          {getEstadoLabel(persona.estado_consolidacion)}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-medium text-stone-700">
                        {getEtapaLabel(persona.etapa_actual)}
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {formatearFecha(persona.ultima_gestion_fecha)}
                      </td>

                      <td className="px-5 py-4">
                        {persona.asignado_a_id ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Con responsable
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Sin responsable
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/personas/${persona.id}`}
                          className="inline-flex rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-700"
                        >
                          Abrir ficha
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
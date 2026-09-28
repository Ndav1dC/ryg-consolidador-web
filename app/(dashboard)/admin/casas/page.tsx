import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type Casa = {
  id: string
  nombre: string
  lider_responsable_id: string | null
}

type Usuario = {
  id: string
  nombre: string | null
}

type PersonaCasa = {
  casa_avivamiento_id: string | null
  estado_consolidacion: string | null
}

type CasasPageProps = {
  searchParams: Promise<{
    buscar?: string
    responsable?: string
  }>
}

type ResumenCasa = {
  total: number
  nuevas: number
  activas: number
  pendientes: number
  consolidadas: number
}

function resumenVacio(): ResumenCasa {
  return {
    total: 0,
    nuevas: 0,
    activas: 0,
    pendientes: 0,
    consolidadas: 0,
  }
}

function enlaceFiltro(buscar: string, responsable: string) {
  const query = new URLSearchParams()

  if (buscar) query.set("buscar", buscar)
  if (responsable) query.set("responsable", responsable)

  const cadena = query.toString()

  return cadena
    ? `/admin/casas?${cadena}`
    : "/admin/casas"
}

export default async function AdminCasasPage({
  searchParams,
}: CasasPageProps) {
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
  const buscar = params.buscar?.trim() ?? ""

  const responsableSeleccionado =
    params.responsable === "con-responsable" ||
    params.responsable === "sin-responsable"
      ? params.responsable
      : ""

  const supabase = await createClient()

  const [
    { data: casas, error: casasError },
    { data: usuarios, error: usuariosError },
    { data: personas, error: personasError },
  ] = await Promise.all([
    supabase
      .from("casas_avivamiento")
      .select("id, nombre, lider_responsable_id")
      .order("nombre", { ascending: true }),

    supabase
      .from("usuarios")
      .select("id, nombre"),

    supabase
      .from("personas")
      .select("casa_avivamiento_id, estado_consolidacion"),
  ])

  if (casasError) {
    console.error(
      "Error cargando Casas de Avivamiento:",
      casasError
    )
    throw new Error(
      "No se pudieron cargar las Casas de Avivamiento."
    )
  }

  if (usuariosError) {
    console.error(
      "Error cargando responsables:",
      usuariosError
    )
    throw new Error(
      "No se pudieron cargar los responsables."
    )
  }

  if (personasError) {
    console.error(
      "Error cargando personas por casa:",
      personasError
    )
    throw new Error(
      "No se pudieron cargar las personas por casa."
    )
  }

  const casasNormalizadas = (casas ?? []) as Casa[]
  const usuariosNormalizados = (usuarios ?? []) as Usuario[]
  const personasNormalizadas = (personas ?? []) as PersonaCasa[]

  const nombresUsuarios = new Map(
    usuariosNormalizados.map((usuario) => [
      usuario.id,
      usuario.nombre || "Sin nombre",
    ])
  )

  const resumenPorCasa = new Map<string, ResumenCasa>()

  for (const persona of personasNormalizadas) {
    if (!persona.casa_avivamiento_id) continue

    const resumen =
      resumenPorCasa.get(persona.casa_avivamiento_id) ??
      resumenVacio()

    resumen.total += 1

    if (persona.estado_consolidacion === "nuevo") {
      resumen.nuevas += 1
    } else if (persona.estado_consolidacion === "activo") {
      resumen.activas += 1
    } else if (persona.estado_consolidacion === "pendiente") {
      resumen.pendientes += 1
    } else if (
      persona.estado_consolidacion === "consolidado"
    ) {
      resumen.consolidadas += 1
    }

    resumenPorCasa.set(
      persona.casa_avivamiento_id,
      resumen
    )
  }

  const casasSinResponsable = casasNormalizadas.filter(
    (casa) => !casa.lider_responsable_id
  ).length

  const totalVinculadas = casasNormalizadas.reduce(
    (total, casa) =>
      total + (resumenPorCasa.get(casa.id)?.total ?? 0),
    0
  )

  const textoBusqueda = buscar.toLocaleLowerCase("es-CO")

  const casasFiltradas = casasNormalizadas.filter((casa) => {
    const nombreResponsable = casa.lider_responsable_id
      ? nombresUsuarios.get(casa.lider_responsable_id) ?? ""
      : ""

    const coincideBusqueda =
      !textoBusqueda ||
      casa.nombre
        .toLocaleLowerCase("es-CO")
        .includes(textoBusqueda) ||
      nombreResponsable
        .toLocaleLowerCase("es-CO")
        .includes(textoBusqueda)

    const coincideResponsable =
      !responsableSeleccionado ||
      (responsableSeleccionado === "con-responsable" &&
        Boolean(casa.lider_responsable_id)) ||
      (responsableSeleccionado === "sin-responsable" &&
        !casa.lider_responsable_id)

    return coincideBusqueda && coincideResponsable
  })

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
            Administración / Casas
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Casas de Avivamiento
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Encuentra una casa, identifica a su responsable y
            consulta cómo se distribuyen las personas vinculadas.
          </p>
        </header>

        <section
          aria-label="Indicadores de Casas de Avivamiento"
          className="grid gap-3 sm:grid-cols-3"
        >
          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Casas registradas
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">
              {casasNormalizadas.length}
            </p>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Personas vinculadas
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-blue-800">
              {totalVinculadas}
            </p>
          </article>

          <article className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-800">
              Casas sin responsable
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-red-900">
              {casasSinResponsable}
            </p>
          </article>
        </section>

        <section
          aria-label="Buscar y filtrar casas"
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <form
            action="/admin/casas"
            method="get"
            className="flex flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="buscar" className="sr-only">
              Buscar por casa o responsable
            </label>

            <input
              id="buscar"
              name="buscar"
              type="search"
              defaultValue={buscar}
              placeholder="Buscar casa o responsable"
              className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-500"
            />

            {responsableSeleccionado && (
              <input
                type="hidden"
                name="responsable"
                value={responsableSeleccionado}
              />
            )}

            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700"
            >
              Buscar
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
            {[
              { value: "", label: "Todas" },
              {
                value: "con-responsable",
                label: "Con responsable",
              },
              {
                value: "sin-responsable",
                label: "Sin responsable",
              },
            ].map((filtro) => {
              const seleccionado =
                responsableSeleccionado === filtro.value

              return (
                <Link
                  key={filtro.label}
                  href={enlaceFiltro(buscar, filtro.value)}
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

          {(buscar || responsableSeleccionado) && (
            <div className="mt-4 flex justify-end">
              <Link
                href="/admin/casas"
                className="text-sm font-semibold text-amber-700 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="casas-title">
          <div className="mb-4">
            <h2
              id="casas-title"
              className="text-lg font-semibold text-stone-900"
            >
              Directorio de casas
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {casasFiltradas.length} de{" "}
              {casasNormalizadas.length} casas
            </p>
          </div>

          {casasFiltradas.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-stone-900">
                No se encontraron casas
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Prueba otra búsqueda o limpia los filtros.
              </p>

              <Link
                href="/admin/casas"
                className="mt-4 inline-block text-sm font-semibold text-amber-700 hover:underline"
              >
                Ver todas las casas
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {casasFiltradas.map((casa) => {
                const resumen =
                  resumenPorCasa.get(casa.id) ?? resumenVacio()

                const responsable = casa.lider_responsable_id
                  ? nombresUsuarios.get(
                      casa.lider_responsable_id
                    ) ?? "Usuario no encontrado"
                  : "Sin responsable asignado"

                return (
                  <article
                    key={casa.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 break-words text-lg font-semibold text-stone-900">
                        {casa.nombre}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          casa.lider_responsable_id
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        {casa.lider_responsable_id
                          ? "Con responsable"
                          : "Sin responsable"}
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm text-stone-600">
                      Responsable:{" "}
                      <span className="font-medium text-stone-800">
                        {responsable}
                      </span>
                    </p>

                    <div className="mt-5 rounded-xl bg-stone-50 px-4 py-3">
                      <p className="text-xs text-stone-500">
                        Personas vinculadas
                      </p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900">
                        {resumen.total}
                      </p>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-sm">
                      <div>
                        <dt className="text-xs text-stone-500">
                          Nuevas
                        </dt>
                        <dd className="mt-1 font-semibold tabular-nums text-stone-900">
                          {resumen.nuevas}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-500">
                          Activas
                        </dt>
                        <dd className="mt-1 font-semibold tabular-nums text-stone-900">
                          {resumen.activas}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-500">
                          Pendientes
                        </dt>
                        <dd className="mt-1 font-semibold tabular-nums text-stone-900">
                          {resumen.pendientes}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-500">
                          Consolidadas
                        </dt>
                        <dd className="mt-1 font-semibold tabular-nums text-stone-900">
                          {resumen.consolidadas}
                        </dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
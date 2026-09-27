import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type Usuario = {
  id: string
  nombre: string | null
  rol: string | null
  roles: string[] | null
  created_at: string | null
}

type PersonaAsignada = {
  asignado_a_id: string | null
}

type EquipoPageProps = {
  searchParams: Promise<{
    buscar?: string
    rol?: string
  }>
}

const filtrosRol = [
  { value: "", label: "Todos" },
  { value: "consolidador", label: "Consolidadores" },
  { value: "lider_casa", label: "Líderes de Casa" },
  { value: "admin", label: "Administradores" },
]

const nombresRol: Record<string, string> = {
  admin: "Administrador",
  lider_casa: "Líder de Casa",
  consolidador: "Consolidador",
}

function obtenerRoles(usuario: Usuario) {
  const valores = [
    ...(usuario.roles ?? []),
    ...(usuario.rol ? [usuario.rol] : []),
  ]

  return Array.from(
    new Set(
      valores
        .filter(
          (rol): rol is string =>
            typeof rol === "string" &&
            rol.trim().length > 0
        )
        .map((rol) => rol.trim())
    )
  )
}

function nombreRol(rol: string) {
  return nombresRol[rol] ?? rol
}

function clasesRol(rol: string) {
  if (rol === "admin") {
    return "border-violet-100 bg-violet-50 text-violet-800"
  }

  if (rol === "lider_casa") {
    return "border-blue-100 bg-blue-50 text-blue-800"
  }

  if (rol === "consolidador") {
    return "border-amber-100 bg-amber-50 text-amber-800"
  }

  return "border-stone-200 bg-stone-50 text-stone-700"
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "No registrada"

  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) {
    return "No registrada"
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(valor)
}

function enlaceRol(buscar: string, rol: string) {
  const query = new URLSearchParams()

  if (buscar) query.set("buscar", buscar)
  if (rol) query.set("rol", rol)

  const cadena = query.toString()

  return cadena
    ? `/admin/equipo?${cadena}`
    : "/admin/equipo"
}

export default async function AdminEquipoPage({
  searchParams,
}: EquipoPageProps) {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const rolesAdmin = currentUser.profile?.roles ?? []
  const rolPrincipal = currentUser.profile?.rol ?? ""

  if (
    rolPrincipal !== "admin" &&
    !rolesAdmin.includes("admin")
  ) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const buscar = params.buscar?.trim() ?? ""

  const rolSeleccionado = filtrosRol.some(
    (filtro) => filtro.value === params.rol
  )
    ? params.rol ?? ""
    : ""

  const supabase = await createClient()

  const [
    { data: usuarios, error: usuariosError },
    { data: personas, error: personasError },
  ] = await Promise.all([
    supabase
      .from("usuarios")
      .select("id, nombre, rol, roles, created_at")
      .order("nombre", { ascending: true }),

    supabase
      .from("personas")
      .select("asignado_a_id"),
  ])

  if (usuariosError) {
    console.error(
      "Error cargando usuarios administrativos:",
      usuariosError
    )
    throw new Error("No se pudo cargar el equipo.")
  }

  if (personasError) {
    console.error(
      "Error contando personas asignadas:",
      personasError
    )
    throw new Error("No se pudieron cargar las asignaciones.")
  }

  const usuariosNormalizados = (usuarios ?? []) as Usuario[]
  const personasNormalizadas = (personas ??
    []) as PersonaAsignada[]

  const cantidadAsignada = new Map<string, number>()

  for (const persona of personasNormalizadas) {
    if (!persona.asignado_a_id) continue

    cantidadAsignada.set(
      persona.asignado_a_id,
      (cantidadAsignada.get(persona.asignado_a_id) ?? 0) + 1
    )
  }

  const consolidadorCount = usuariosNormalizados.filter(
    (usuario) =>
      obtenerRoles(usuario).includes("consolidador")
  ).length

  const liderCount = usuariosNormalizados.filter(
    (usuario) =>
      obtenerRoles(usuario).includes("lider_casa")
  ).length

  const textoBusqueda = buscar.toLocaleLowerCase("es-CO")

  const usuariosFiltrados = usuariosNormalizados.filter(
    (usuario) => {
      const coincideNombre =
        !textoBusqueda ||
        (usuario.nombre ?? "")
          .toLocaleLowerCase("es-CO")
          .includes(textoBusqueda)

      const coincideRol =
        !rolSeleccionado ||
        obtenerRoles(usuario).includes(rolSeleccionado)

      return coincideNombre && coincideRol
    }
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
            Administración / Equipo
          </p>

          <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
            Equipo
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Encuentra integrantes, consulta sus roles y revisa
            cuántas personas tienen asignadas.
          </p>
        </header>

        <section
          aria-label="Indicadores del equipo"
          className="grid gap-3 sm:grid-cols-3"
        >
          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Usuarios registrados
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">
              {usuariosNormalizados.length}
            </p>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Consolidadores
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-amber-800">
              {consolidadorCount}
            </p>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-600">
              Líderes de Casa
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-blue-800">
              {liderCount}
            </p>
          </article>
        </section>

        <section
          aria-label="Buscar y filtrar equipo"
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <form
            action="/admin/equipo"
            method="get"
            className="flex flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="buscar" className="sr-only">
              Buscar integrante por nombre
            </label>

            <input
              id="buscar"
              name="buscar"
              type="search"
              defaultValue={buscar}
              placeholder="Buscar integrante por nombre"
              className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-500"
            />

            {rolSeleccionado && (
              <input
                type="hidden"
                name="rol"
                value={rolSeleccionado}
              />
            )}

            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700"
            >
              Buscar
            </button>
          </form>

          <div className="mt-4 border-t border-stone-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Filtrar por rol
            </p>

            <div className="flex flex-wrap gap-2">
              {filtrosRol.map((filtro) => {
                const seleccionado =
                  filtro.value === rolSeleccionado

                return (
                  <Link
                    key={filtro.label}
                    href={enlaceRol(buscar, filtro.value)}
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

          {(buscar || rolSeleccionado) && (
            <div className="mt-4 flex justify-end">
              <Link
                href="/admin/equipo"
                className="text-sm font-semibold text-amber-700 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="integrantes-title">
          <div className="mb-3">
            <h2
              id="integrantes-title"
              className="text-lg font-semibold text-stone-900"
            >
              Integrantes
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {usuariosFiltrados.length} de{" "}
              {usuariosNormalizados.length} usuarios
            </p>
          </div>

          {usuariosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-stone-900">
                No se encontraron integrantes
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Prueba otra búsqueda o limpia el filtro de rol.
              </p>

              <Link
                href="/admin/equipo"
                className="mt-4 inline-block text-sm font-semibold text-amber-700 hover:underline"
              >
                Ver todo el equipo
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {usuariosFiltrados.map((usuario) => {
                  const rolesUsuario = obtenerRoles(usuario)

                  return (
                    <article
                      key={usuario.id}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <h3 className="break-words font-semibold text-stone-900">
                        {usuario.nombre || "Sin nombre"}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {rolesUsuario.length ? (
                          rolesUsuario.map((rol) => (
                            <span
                              key={rol}
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${clasesRol(
                                rol
                              )}`}
                            >
                              {nombreRol(rol)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-stone-500">
                            Sin rol
                          </span>
                        )}
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-sm">
                        <div>
                          <dt className="text-xs text-stone-500">
                            Personas asignadas
                          </dt>
                          <dd className="mt-1 font-semibold tabular-nums text-stone-900">
                            {cantidadAsignada.get(usuario.id) ??
                              0}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs text-stone-500">
                            Registrado
                          </dt>
                          <dd className="mt-1 text-stone-700">
                            {formatearFecha(
                              usuario.created_at
                            )}
                          </dd>
                        </div>
                      </dl>
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
                        Integrante
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Roles
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Personas asignadas
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        Registrado
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {usuariosFiltrados.map((usuario) => {
                      const rolesUsuario = obtenerRoles(usuario)

                      return (
                        <tr
                          key={usuario.id}
                          className="hover:bg-stone-50"
                        >
                          <td className="px-5 py-4 font-semibold text-stone-900">
                            {usuario.nombre || "Sin nombre"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {rolesUsuario.length ? (
                                rolesUsuario.map((rol) => (
                                  <span
                                    key={rol}
                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${clasesRol(
                                      rol
                                    )}`}
                                  >
                                    {nombreRol(rol)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-stone-500">
                                  Sin rol
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 font-semibold tabular-nums text-stone-800">
                            {cantidadAsignada.get(usuario.id) ??
                              0}
                          </td>

                          <td className="px-5 py-4 text-stone-600">
                            {formatearFecha(
                              usuario.created_at
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
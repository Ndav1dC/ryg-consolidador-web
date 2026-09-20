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

function getRolLabel(rol: string | null, roles: string[] | null) {
  if (roles?.includes("admin") || rol === "admin") {
    return "Administrador"
  }

  if (roles?.includes("lider_casa") || rol === "lider_casa") {
    return "Líder de Casa"
  }

  if (roles?.includes("consolidador") || rol === "consolidador") {
    return "Consolidador"
  }

  return rol || "Sin rol"
}

function getRolClasses(rol: string | null, roles: string[] | null) {
  const label = getRolLabel(rol, roles)

  if (label === "Administrador") {
    return "bg-violet-100 text-violet-700"
  }

  if (label === "Líder de Casa") {
    return "bg-blue-100 text-blue-700"
  }

  if (label === "Consolidador") {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-stone-100 text-stone-600"
}

export default async function AdminEquipoPage() {
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

  const supabase = await createClient()

  const [{ data: usuarios, error: usuariosError }, { data: personas, error: personasError }] =
    await Promise.all([
      supabase
        .from("usuarios")
        .select("id, nombre, rol, roles, created_at")
        .order("nombre", { ascending: true }),

      supabase
        .from("personas")
        .select("asignado_a_id"),
    ])

  if (usuariosError) {
    console.error("Error cargando usuarios administrativos:", usuariosError)
    throw new Error("No se pudo cargar el equipo.")
  }

  if (personasError) {
    console.error("Error contando personas asignadas:", personasError)
    throw new Error("No se pudieron cargar las asignaciones.")
  }

  const usuariosNormalizados = (usuarios ?? []) as Usuario[]
  const personasNormalizadas = (personas ?? []) as PersonaAsignada[]

  const cantidadAsignada = new Map<string, number>()

  for (const persona of personasNormalizadas) {
    if (!persona.asignado_a_id) continue

    cantidadAsignada.set(
      persona.asignado_a_id,
      (cantidadAsignada.get(persona.asignado_a_id) ?? 0) + 1
    )
  }

  const consolidadors = usuariosNormalizados.filter(
    (usuario) =>
      usuario.rol === "consolidador" ||
      usuario.roles?.includes("consolidador")
  )

  const lideres = usuariosNormalizados.filter(
    (usuario) =>
      usuario.rol === "lider_casa" ||
      usuario.roles?.includes("lider_casa")
  )

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
            Administración / Equipo
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
            Equipo de trabajo
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Consulta consolidadores, líderes de Casa y administradores
            registrados en la plataforma.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Usuarios registrados</p>
            <p className="mt-3 text-3xl font-bold text-stone-900">
              {usuariosNormalizados.length}
            </p>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Consolidadores</p>
            <p className="mt-3 text-3xl font-bold text-amber-700">
              {consolidadors.length}
            </p>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Líderes de Casa</p>
            <p className="mt-3 text-3xl font-bold text-blue-700">
              {lideres.length}
            </p>
          </article>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-5">
            <h2 className="text-lg font-semibold text-stone-900">
              Usuarios del equipo
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Personas con acceso a la plataforma y sus asignaciones actuales.
            </p>
          </div>

          {usuariosNormalizados.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-stone-500">
              No hay usuarios registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[780px] w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Usuario</th>
                    <th className="px-5 py-3.5 font-semibold">Rol</th>
                    <th className="px-5 py-3.5 font-semibold">
                      Personas asignadas
                    </th>
                    <th className="px-5 py-3.5 font-semibold">
                      Registrado
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {usuariosNormalizados.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="transition hover:bg-stone-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 font-bold text-amber-700">
                            {(usuario.nombre || "U")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <p className="font-semibold text-stone-900">
                            {usuario.nombre || "Sin nombre"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRolClasses(
                            usuario.rol,
                            usuario.roles
                          )}`}
                        >
                          {getRolLabel(usuario.rol, usuario.roles)}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold text-stone-700">
                        {cantidadAsignada.get(usuario.id) ?? 0}
                      </td>

                      <td className="px-5 py-4 text-stone-500">
                        {usuario.created_at
                          ? new Intl.DateTimeFormat("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(usuario.created_at))
                          : "No registrada"}
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
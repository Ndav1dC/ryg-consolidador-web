import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type Props = {
  params: Promise<{ id: string }>
}

type Integrante = {
  id: string
  nombre: string | null
  rol: string | null
  roles: string[] | null
}

type Persona = {
  id: string
  nombre_completo: string
  celular: string | null
  estado_consolidacion: string | null
  etapa_actual: number | null
  ultima_gestion_fecha: string | null
  numero_invalido: boolean | null
}

const nombresRol: Record<string, string> = {
  admin: "Administrador",
  consolidador: "Consolidador",
  lider_casa: "Líder de Casa",
}

function rolesDe(integrante: Integrante) {
  return Array.from(
    new Set([
      ...(integrante.roles ?? []),
      ...(integrante.rol ? [integrante.rol] : []),
    ])
  )
}

function estadoDe(estado: string | null) {
  if (estado === "nuevo") return "Nuevo"
  if (estado === "activo") return "Activo"
  if (estado === "pendiente") return "Pendiente"
  if (estado === "consolidado") return "Consolidado"
  return "Sin estado"
}

function etapaDe(etapa: number | null) {
  return etapa == null ? "Sin etapa" : `Etapa ${etapa}`
}

function fechaDe(fecha: string | null) {
  if (!fecha) return "Sin gestión"

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${fecha.slice(0, 10)}T12:00:00`))
}

export default async function IntegrantePage({ params }: Props) {
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

  const { id } = await params

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    )
  ) {
    notFound()
  }

  const supabase = await createClient()

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, nombre, rol, roles")
    .eq("id", id)
    .maybeSingle()

  if (usuarioError) {
    console.error("Error cargando integrante:", usuarioError)
    throw new Error("No se pudo cargar el integrante.")
  }

  if (!usuario) {
    notFound()
  }

  const integrante = usuario as Integrante

  const { data, error: personasError } = await supabase
    .from("personas")
    .select(
      "id, nombre_completo, celular, estado_consolidacion, etapa_actual, ultima_gestion_fecha, numero_invalido"
    )
    .eq("asignado_a_id", integrante.id)
    .order("nombre_completo", { ascending: true })

  if (personasError) {
    console.error(
      "Error cargando personas del integrante:",
      personasError
    )
    throw new Error("No se pudieron cargar las personas asignadas.")
  }

  const personas = (data ?? []) as Persona[]
  const roles = rolesDe(integrante)

  return (
    <main className="min-h-screen min-w-0 bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-stone-200 pb-5">
          <Link
            href="/admin/equipo"
            className="text-sm font-semibold text-amber-700 hover:underline"
          >
            Volver a Equipo
          </Link>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Administración / Equipo / Integrante
          </p>

          <h1 className="mt-2 break-words text-2xl font-bold text-stone-900 sm:text-3xl">
            {integrante.nombre || "Sin nombre"}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((rol) => (
              <span
                key={rol}
                className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700"
              >
                {nombresRol[rol] ?? rol}
              </span>
            ))}
          </div>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Personas asignadas
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">
            {personas.length}
          </p>
          <p className="mt-2 text-xs leading-5 text-stone-500">
            Son los registros cuyo responsable asignado es este
            integrante; no es un conteo de seguimientos realizados.
          </p>
        </section>

        <section aria-labelledby="personas-title">
          <h2
            id="personas-title"
            className="mb-4 text-lg font-semibold text-stone-900"
          >
            Personas a su cargo
          </h2>

          {personas.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-stone-900">
                No tiene personas asignadas
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Los registros aparecerán aquí cuando se asignen a
                este integrante.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {personas.map((persona) => (
                <article
                  key={persona.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="break-words font-semibold text-stone-900">
                      {persona.nombre_completo}
                    </h3>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                      {estadoDe(persona.estado_consolidacion)}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-stone-500">
                        Etapa
                      </dt>
                      <dd className="mt-1 text-stone-800">
                        {etapaDe(persona.etapa_actual)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500">
                        Última gestión
                      </dt>
                      <dd className="mt-1 text-stone-800">
                        {fechaDe(persona.ultima_gestion_fecha)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-stone-500">
                        Celular
                      </dt>
                      <dd className="mt-1 break-words text-stone-800">
                        {persona.celular || "Sin celular"}
                        {persona.numero_invalido
                          ? " · Número marcado como inválido"
                          : ""}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/personas/${persona.id}`}
                    className="mt-5 inline-flex rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
                  >
                    Abrir ficha
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
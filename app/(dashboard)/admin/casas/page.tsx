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

export default async function AdminCasasPage() {
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
    console.error("Error cargando Casas de Avivamiento:", casasError)
    throw new Error("No se pudieron cargar las Casas de Avivamiento.")
  }

  if (usuariosError) {
    console.error("Error cargando responsables:", usuariosError)
    throw new Error("No se pudieron cargar los responsables.")
  }

  if (personasError) {
    console.error("Error cargando personas por casa:", personasError)
    throw new Error("No se pudieron cargar las personas por casa.")
  }

  const casasNormalizadas = (casas ?? []) as Casa[]
  const usuariosNormalizados = (usuarios ?? []) as Usuario[]
  const personasNormalizadas = (personas ?? []) as PersonaCasa[]

  const usuariosMap = new Map(
    usuariosNormalizados.map((usuario) => [
      usuario.id,
      usuario.nombre || "Sin nombre",
    ])
  )

  const personasPorCasa = new Map<
    string,
    {
      total: number
      activas: number
      consolidadas: number
    }
  >()

  for (const persona of personasNormalizadas) {
    if (!persona.casa_avivamiento_id) continue

    const actual = personasPorCasa.get(persona.casa_avivamiento_id) ?? {
      total: 0,
      activas: 0,
      consolidadas: 0,
    }

    actual.total += 1

    if (persona.estado_consolidacion === "consolidado") {
      actual.consolidadas += 1
    } else {
      actual.activas += 1
    }

    personasPorCasa.set(persona.casa_avivamiento_id, actual)
  }

  const sinResponsable = casasNormalizadas.filter(
    (casa) => !casa.lider_responsable_id
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
            Administración / Casas
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
            Casas de Avivamiento
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Consulta las casas, sus responsables y las personas que están
            vinculadas a cada proceso.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Casas registradas</p>
            <p className="mt-3 text-3xl font-bold text-stone-900">
              {casasNormalizadas.length}
            </p>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Personas vinculadas</p>
            <p className="mt-3 text-3xl font-bold text-blue-700">
              {personasNormalizadas.filter(
                (persona) => persona.casa_avivamiento_id
              ).length}
            </p>
          </article>

          <article className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-700">Sin responsable</p>
            <p className="mt-3 text-3xl font-bold text-red-800">
              {sinResponsable}
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {casasNormalizadas.map((casa) => {
            const resumen = personasPorCasa.get(casa.id) ?? {
              total: 0,
              activas: 0,
              consolidadas: 0,
            }

            const responsable = casa.lider_responsable_id
              ? usuariosMap.get(casa.lider_responsable_id) || "Usuario no encontrado"
              : "Sin responsable asignado"

            return (
              <article
                key={casa.id}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                    🏠
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      casa.lider_responsable_id
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {casa.lider_responsable_id
                      ? "Activa"
                      : "Sin responsable"}
                  </span>
                </div>

                <h2 className="mt-5 text-lg font-semibold text-stone-900">
                  {casa.nombre}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Responsable: {responsable}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-stone-50 p-3 text-center">
                    <p className="text-xl font-bold text-stone-900">
                      {resumen.total}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">Personas</p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-3 text-center">
                    <p className="text-xl font-bold text-blue-800">
                      {resumen.activas}
                    </p>
                    <p className="mt-1 text-xs text-blue-700">En proceso</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                    <p className="text-xl font-bold text-emerald-800">
                      {resumen.consolidadas}
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Consolidadas
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        {casasNormalizadas.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-stone-900">
              No hay Casas de Avivamiento registradas
            </p>

            <p className="mt-1 text-sm text-stone-500">
              Cuando se creen casas, aparecerán en este módulo.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  )
}
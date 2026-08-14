import Link from "next/link"
import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { PersonCard } from "@/components/personas/person-card"
import { PersonsSearch } from "@/components/personas/persons-search"
import { getCurrentUserProfile } from "@/lib/auth/get-user"
import { getDashboardNotifications } from "@/lib/data/dashboard"
import { getPersonas } from "@/lib/data/personas"

export default async function PersonasPage() {
  const userData = await getCurrentUserProfile()
  const roles = userData?.profile?.roles || []

  const cookieStore = await cookies()
  const rolActivo =
    cookieStore.get("rol_activo")?.value || roles[0] || "consolidador"

  const [personas, notifications] = await Promise.all([
    getPersonas(),
    getDashboardNotifications(),
  ])

  const titulo =
    rolActivo === "lider_casa" ? "Mis personas (Casa)" : "Mis personas"

  const subtitulo =
    rolActivo === "lider_casa"
      ? "Personas asignadas a tu casa de avivamiento."
      : "Personas que estás acompañando en el proceso de consolidación."

  return (
    <main>
      <Topbar
        title={titulo}
        subtitle={subtitulo}
        notifications={notifications}
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {rolActivo === "lider_casa"
                  ? "Personas asignadas"
                  : "Personas en proceso"}
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                {rolActivo === "lider_casa"
                  ? "Revisa el estado y avance de las personas en tu casa."
                  : "Revisa el estado, el avance y entra al detalle de cada persona."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {personas.length} persona{personas.length === 1 ? "" : "s"}
              </span>

              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Volver al panel
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <PersonsSearch />
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {personas.length > 0 ? (
              personas.map((persona) => (
                <PersonCard key={persona.id} persona={persona} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-sm text-stone-500 md:col-span-2 xl:col-span-3">
                {rolActivo === "lider_casa"
                  ? "No tienes personas asignadas a tu casa de avivamiento."
                  : "No hay personas registradas para mostrar."}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
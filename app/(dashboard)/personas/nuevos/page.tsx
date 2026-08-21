import { cookies } from "next/headers"

import { Topbar } from "@/components/dashboard/topbar"
import { PersonCard } from "@/components/personas/person-card"
import { PersonsSearch } from "@/components/personas/persons-search"
import { getCurrentUserProfile } from "@/lib/auth/get-user"
import { getPersonasNuevas } from "@/lib/data/personas"

export default async function NuevosPage() {
  const userData = await getCurrentUserProfile()
  const roles = userData?.profile?.roles || []

  const cookieStore = await cookies()

  const rolActivo =
    cookieStore.get("rol_activo")?.value ||
    roles[0] ||
    "consolidador"

  const personas = await getPersonasNuevas()

  const esLiderCasa = rolActivo === "lider_casa"

  return (
    <main>
      <Topbar
        title={esLiderCasa ? "Mis nuevos" : "Nuevos"}
        subtitle={
          esLiderCasa
            ? "Personas pendientes de iniciar el discipulado Nivel 1."
            : "Personas recién llegadas que necesitan ser contactadas."
        }
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {esLiderCasa
                  ? "Personas pendientes de Nivel 1"
                  : "Personas nuevas"}
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                {esLiderCasa
                  ? "Después de iniciar el Nivel 1, la persona pasará a Mis personas."
                  : "Toma una persona para iniciar el proceso de consolidación."}
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              {personas.length}{" "}
              {personas.length === 1 ? "persona" : "personas"}
            </span>
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
                {esLiderCasa
                  ? "No tienes personas pendientes de iniciar el Nivel 1."
                  : "No hay personas nuevas para asignar."}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
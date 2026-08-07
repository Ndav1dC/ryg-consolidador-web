import Link from "next/link"
import { Topbar } from "@/components/dashboard/topbar"
import { PersonCard } from "@/components/personas/person-card"
import { PersonsSearch } from "@/components/personas/persons-search"
import { getPersonas } from "@/lib/data/personas"
import { getCurrentUserProfile } from "@/lib/auth/get-user"
import { cookies } from "next/headers"

export default async function NuevosPage() {
  const userData = await getCurrentUserProfile()
  const roles = userData?.profile?.roles || []
  const userId = userData?.profile?.id
  
  // Obtener el rol activo de la cookie
  const cookieStore = await cookies()
  const rolActivo = cookieStore.get('rol_activo')?.value || roles[0] || 'consolidador'
  
  // Obtener personas según el rol
  let personas = []
  
  if (rolActivo === "consolidador") {
    // Consolidador: ve personas nuevas sin asignar
    const { getPersonasNuevas } = await import('@/lib/data/personas')
    personas = await getPersonasNuevas()
  } else if (rolActivo === "lider_casa") {
    // Líder casa: ve personas asignadas a él (sus nuevos)
    const allPersonas = await getPersonas()
    personas = allPersonas.filter(p => p.asignado_a_id === userId)
  } else {
    // Admin: ve todos los nuevos
    const { getPersonasNuevas } = await import('@/lib/data/personas')
    personas = await getPersonasNuevas()
  }

  const titulo = rolActivo === "lider_casa" ? "Mis nuevos" : "Nuevos"
  const subtitulo = rolActivo === "lider_casa" 
    ? "Personas recién asignadas a tu casa de avivamiento." 
    : "Personas recién llegadas que necesitan ser contactadas."

  return (
    <main>
      <Topbar
        title={titulo}
        subtitle={subtitulo}
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {rolActivo === "lider_casa" ? "Personas asignadas recientemente" : "Personas nuevas"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {rolActivo === "lider_casa" 
                  ? "Estas personas han sido asignadas a tu casa para seguimiento." 
                  : "Toma una persona para iniciar el proceso de consolidación."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                {personas.length} {personas.length === 1 ? "persona" : "personas"}
              </span>
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
              <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-sm text-stone-500">
                {rolActivo === "lider_casa" 
                  ? "No tienes personas asignadas recientemente." 
                  : "No hay personas nuevas para asignar."}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
import { Topbar } from "@/components/dashboard/topbar"
import { CreateSeguimientoForm } from "@/components/seguimientos/create-seguimiento-form"
import { getPersonas } from "@/lib/data/personas"
import { getCurrentUserProfile } from "@/lib/auth/get-user"
import { cookies } from "next/headers"

type Props = {
  searchParams: Promise<{
    personaId?: string
  }>
}

function normalizePersonaId(value?: string) {
  if (!value || value === "undefined" || value === "null") return undefined
  return value
}

export default async function SeguimientosPage({ searchParams }: Props) {
  const params = await searchParams
  const selectedPersonaId = normalizePersonaId(params.personaId)
  
  // Obtener el usuario actual
  const userData = await getCurrentUserProfile()
  const roles = userData?.profile?.roles || []
  
  // Obtener el rol activo desde cookies
  const cookieStore = await cookies()
  const rolActivo = cookieStore.get('rol_activo')?.value || roles[0] || 'consolidador'
  
  const userId = userData?.profile?.id

  // Obtener personas según el rol
  let personas = await getPersonas()
  
  // Si hay una persona seleccionada, filtrar solo esa
  if (selectedPersonaId) {
    const { getPersonaById } = await import('@/lib/data/personas')
    const personaSeleccionada = await getPersonaById(selectedPersonaId)
    if (personaSeleccionada) {
      personas = [personaSeleccionada]
    }
  } else {
    // Si no hay seleccionada, mostrar solo las personas asignadas al usuario
    if (userId) {
      personas = personas.filter((p) => p.asignado_a_id === userId)
    }
  }

  return (
    <main>
      <Topbar
        title="Nuevo seguimiento"
        subtitle="Registra el siguiente paso del proceso de acompañamiento."
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Completa la información principal del seguimiento y guárdala en el historial de la persona.
          </div>

          <CreateSeguimientoForm
            personas={personas}
            selectedPersonaId={selectedPersonaId}
            userRol={rolActivo}
            readonly={!!selectedPersonaId}
          />
        </div>
      </section>
    </main>
  )
}
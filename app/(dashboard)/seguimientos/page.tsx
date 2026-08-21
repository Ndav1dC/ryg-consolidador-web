import { cookies } from "next/headers"

import { Topbar } from "@/components/dashboard/topbar"
import { CreateSeguimientoForm } from "@/components/seguimientos/create-seguimiento-form"
import { getCurrentUserProfile } from "@/lib/auth/get-user"
import { getNotificacionesPendientes } from "@/lib/data/notificaciones"
import { getPersonaById, getPersonas } from "@/lib/data/personas"

type Props = {
  searchParams: Promise<{
    personaId?: string
  }>
}

function normalizePersonaId(value?: string) {
  if (!value || value === "undefined" || value === "null") {
    return undefined
  }

  return value
}

export default async function SeguimientosPage({ searchParams }: Props) {
  const params = await searchParams

  const selectedPersonaId = normalizePersonaId(params.personaId)

  const userData = await getCurrentUserProfile()
  const roles = userData?.profile?.roles || []

  const cookieStore = await cookies()

  const rolActivo =
    cookieStore.get("rol_activo")?.value ||
    roles[0] ||
    "consolidador"

  const userId = userData?.profile?.id

  const [personasIniciales, notifications] = await Promise.all([
    getPersonas(),
    getNotificacionesPendientes(),
  ])

  let personas = personasIniciales

  if (selectedPersonaId) {
    const personaSeleccionada = await getPersonaById(selectedPersonaId)

    if (personaSeleccionada) {
      personas = [personaSeleccionada]
    }
  } else if (userId) {
    personas = personas.filter(
      (persona) => persona.asignado_a_id === userId
    )
  }

  return (
    <main>
      <Topbar
        title="Nuevo seguimiento"
        subtitle="Registra el siguiente paso del proceso de acompañamiento."
        notifications={notifications}
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Completa la información principal del seguimiento y guárdala en el
            historial de la persona.
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
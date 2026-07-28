import { Topbar } from "@/components/dashboard/topbar"
import { CreateSeguimientoForm } from "@/components/seguimientos/create-seguimiento-form"
import { getPersonas } from "@/lib/data/personas"

type Props = {
  searchParams: Promise<{
    personaId?: string
  }>
}

function normalizePersonaId(value?: string) {
  if (!value || value === "undefined" || value === "null") return undefined
  return value
}

export default async function NuevoSeguimientoPage({ searchParams }: Props) {
  const params = await searchParams
  const personas = await getPersonas()
  const selectedPersonaId = normalizePersonaId(params.personaId)

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
          />
        </div>
      </section>
    </main>
  )
}
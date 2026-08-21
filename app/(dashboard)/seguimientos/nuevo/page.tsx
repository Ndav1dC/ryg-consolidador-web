import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { CreateSeguimientoForm } from "@/components/seguimientos/create-seguimiento-form"
import { getCurrentUserProfile } from "@/lib/auth/get-user"
import { getPersonaById, getPersonas } from "@/lib/data/personas"
import { createClient } from "@/lib/supabase/server"

type Props = {
  searchParams: Promise<{
    personaId?: string
    paso?: string
  }>
}

type NivelDiscipulado = "Nivel 1" | "Nivel 2" | "Nivel 3"

function normalizePersonaId(value?: string) {
  if (!value || value === "undefined" || value === "null") {
    return undefined
  }

  return value
}

function normalizePaso(value?: string) {
  const paso = Number(value)

  if (!Number.isInteger(paso) || paso < 1 || paso > 5) {
    return undefined
  }

  return paso
}

function getNivelesCompletados(nivelActual: number): NivelDiscipulado[] {
  const niveles: NivelDiscipulado[] = []

  if (nivelActual >= 1) {
    niveles.push("Nivel 1")
  }

  if (nivelActual >= 2) {
    niveles.push("Nivel 2")
  }

  if (nivelActual >= 3) {
    niveles.push("Nivel 3")
  }

  return niveles
}

function getRolActivo(
  roles: string[],
  rolDesdeCookie?: string
): "consolidador" | "lider_casa" | "admin" {
  if (
    rolDesdeCookie === "lider_casa" &&
    roles.includes("lider_casa")
  ) {
    return "lider_casa"
  }

  if (
    rolDesdeCookie === "consolidador" &&
    roles.includes("consolidador")
  ) {
    return "consolidador"
  }

  if (rolDesdeCookie === "admin" && roles.includes("admin")) {
    return "admin"
  }

  if (roles.includes("lider_casa")) {
    return "lider_casa"
  }

  if (roles.includes("admin")) {
    return "admin"
  }

  return "consolidador"
}

export default async function NuevoSeguimientoPage({ searchParams }: Props) {
  const params = await searchParams
  const selectedPersonaId = normalizePersonaId(params.personaId)
  const pasoUrl = normalizePaso(params.paso)

  const userData = await getCurrentUserProfile()
  const roles = userData?.profile?.roles || []

  const cookieStore = await cookies()
  const rolDesdeCookie = cookieStore.get("rol_activo")?.value

  const rolActivo = getRolActivo(roles, rolDesdeCookie)
  const userId = userData?.profile?.id

  let personas = await getPersonas()

  let visitaPendiente: {
    id: string
    fecha_programada: string | null
  } | null = null

  let nivelesDiscipulado: NivelDiscipulado[] = []

  let etapaActual = rolActivo === "lider_casa" ? 4 : 1

  if (selectedPersonaId) {
    const personaSeleccionada = await getPersonaById(selectedPersonaId)

    if (!personaSeleccionada) {
      personas = []
    } else {
      personas = [personaSeleccionada]

      const etapaPersona = Number(personaSeleccionada.etapa_actual) || 1

      const supabase = await createClient()

      const [
        { data: visitaData, error: visitaError },
        { data: discipuladoData, error: discipuladoError },
      ] = await Promise.all([
        supabase
          .from("seguimientos")
          .select("id, fecha_programada")
          .eq("persona_id", selectedPersonaId)
          .eq("tipo", "visita")
          .eq("estado", "pendiente")
          .order("fecha_programada", { ascending: true })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("discipulado")
          .select("nivel_actual, fecha_inicio, fecha_completado")
          .eq("persona_id", selectedPersonaId)
          .maybeSingle(),
      ])

      if (visitaError) {
        console.error("Error consultando visita pendiente:", visitaError)
      }

      if (discipuladoError) {
        console.error(
          "Error consultando avance de discipulado:",
          discipuladoError
        )
      }

      visitaPendiente = visitaData

      const nivelActualDiscipulado = Math.min(
        Math.max(Number(discipuladoData?.nivel_actual) || 0, 0),
        3
      )

      nivelesDiscipulado = getNivelesCompletados(nivelActualDiscipulado)

      const discipuladoCompleto = nivelActualDiscipulado === 3

      if (rolActivo === "lider_casa") {
        /*
         * La Etapa 4 continúa hasta terminar los tres niveles.
         * Solo Nivel 3 completo habilita la Etapa 5.
         */
        etapaActual = discipuladoCompleto ? 5 : 4
      } else {
        /*
         * Para consolidador o admin se respeta la etapa guardada
         * en la persona. El parámetro URL es solo respaldo.
         */
        etapaActual = etapaPersona || pasoUrl || etapaActual
      }
    }
  } else if (userId) {
    personas = personas.filter((persona) => persona.asignado_a_id === userId)
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
            Completa la información principal del seguimiento y guárdala en el
            historial de la persona.
          </div>

          <CreateSeguimientoForm
            personas={personas}
            selectedPersonaId={selectedPersonaId}
            userRol={rolActivo}
            readonly={!!selectedPersonaId}
            visitaPendiente={visitaPendiente}
            etapaActual={etapaActual}
            nivelesDiscipulado={nivelesDiscipulado}
          />
        </div>
      </section>
    </main>
  )
}
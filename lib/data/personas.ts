import "server-only"

import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

export type PersonaListItem = {
  id: string
  nombre_completo: string
  celular: string | null
  edad: number | null
  barrio: string | null
  fecha_nacimiento: string | null
  como_conocio: string | null
  invitado_por: string | null
  acepto_jesus: boolean | null
  peticion_oracion: string | null
  autorizacion_datos: boolean | null
  estado_consolidacion: string | null
  etapa_actual: number | null
  ultima_gestion_fecha: string | null
  proximo_paso: string | null
  created_at: string
  asignado_a_id: string | null
  casa_avivamiento_id: string | null
  numero_invalido: boolean | null
}

export type PersonaDetail = PersonaListItem

export type SeguimientoItem = {
  id: string
  persona_id: string
  consolidador_id: string | null
  fecha: string | null
  tipo: string | null
  resultado: string | null
  observaciones: string | null
  paso: number | null
  casa: string | null
  lider: string | null
  ministerio: string | null
  nivel_discipulado: string | null
  estado: string | null
  fecha_programada: string | null
}

export type PersonaNotaItem = {
  id: string
  persona_id: string
  nota: string
  created_at: string
}

const PROXIMO_PASO_NIVEL_1 =
  "Etapa 4 - Iniciar discipulado (Nivel 1)"

function isValidUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

async function getRolActivoFromCookie(): Promise<string> {
  const cookieStore = await cookies()

  return cookieStore.get("rol_activo")?.value || "consolidador"
}

const PERSONA_SELECT = `
  id,
  nombre_completo,
  celular,
  edad,
  barrio,
  fecha_nacimiento,
  como_conocio,
  invitado_por,
  acepto_jesus,
  peticion_oracion,
  autorizacion_datos,
  estado_consolidacion,
  etapa_actual,
  ultima_gestion_fecha,
  proximo_paso,
  created_at,
  asignado_a_id,
  casa_avivamiento_id,
  numero_invalido
`

function esConsolidada(persona: PersonaListItem) {
  return (
    persona.estado_consolidacion === "consolidado" ||
    Number(persona.etapa_actual) >= 5
  )
}

function debeIniciarNivelUno(persona: PersonaListItem) {
  return (
    persona.proximo_paso?.trim() === PROXIMO_PASO_NIVEL_1 &&
    !esConsolidada(persona)
  )
}

function ordenarConsolidadasAlFinal(
  personas: PersonaListItem[]
): PersonaListItem[] {
  return [...personas].sort((a, b) => {
    const aEsConsolidada = esConsolidada(a)
    const bEsConsolidada = esConsolidada(b)

    if (aEsConsolidada && !bEsConsolidada) return 1
    if (!aEsConsolidada && bEsConsolidada) return -1

    return (
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
    )
  })
}

export async function getPersonas(
  search?: string
): Promise<PersonaListItem[]> {
  const supabase = await createClient()
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const userData = currentUser.profile
  const rolActivo = await getRolActivoFromCookie()

  let query = supabase
    .from("personas")
    .select(PERSONA_SELECT)
    .order("created_at", { ascending: false })

  if (rolActivo === "lider_casa") {
    query = query.eq("asignado_a_id", userData.id)
  } else if (rolActivo === "consolidador") {
    query = query
      .eq("asignado_a_id", userData.id)
      .neq("estado_consolidacion", "nuevo")
  }

  if (search?.trim()) {
    const value = search.trim()

    query = query.or(
      `nombre_completo.ilike.%${value}%,barrio.ilike.%${value}%,celular.ilike.%${value}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error(error)
    throw new Error("No se pudieron cargar las personas.")
  }

  const personas = (data ?? []) as PersonaListItem[]

  if (rolActivo !== "lider_casa") {
    return personas
  }

  const misPersonas = personas.filter(
    (persona) => !debeIniciarNivelUno(persona)
  )

  return ordenarConsolidadasAlFinal(misPersonas)
}

export async function getPersonasNuevas(): Promise<PersonaListItem[]> {
  const supabase = await createClient()
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const userData = currentUser.profile
  const rolActivo = await getRolActivoFromCookie()

  if (rolActivo === "consolidador") {
    const { data, error } = await supabase
      .from("personas")
      .select(PERSONA_SELECT)
      .is("asignado_a_id", null)
      .eq("estado_consolidacion", "nuevo")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      throw new Error("No se pudieron cargar las personas nuevas.")
    }

    return (data ?? []) as PersonaListItem[]
  }

  if (rolActivo === "lider_casa") {
    const { data, error } = await supabase
      .from("personas")
      .select(PERSONA_SELECT)
      .eq("asignado_a_id", userData.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      throw new Error("No se pudieron cargar las personas nuevas.")
    }

    return ((data ?? []) as PersonaListItem[]).filter(
      debeIniciarNivelUno
    )
  }

  const { data, error } = await supabase
    .from("personas")
    .select(PERSONA_SELECT)
    .is("asignado_a_id", null)
    .eq("estado_consolidacion", "nuevo")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    throw new Error("No se pudieron cargar las personas nuevas.")
  }

  return (data ?? []) as PersonaListItem[]
}

export async function getPersonaById(
  id: string
): Promise<PersonaDetail> {
  if (!id || id === "undefined" || !isValidUUID(id)) {
    notFound()
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("personas")
    .select(PERSONA_SELECT)
    .eq("id", id)
    .single()

  if (error || !data) {
    notFound()
  }

  return data as PersonaDetail
}

export async function getSeguimientosByPersonaId(
  personaId: string
): Promise<SeguimientoItem[]> {
  if (!personaId || personaId === "undefined" || !isValidUUID(personaId)) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("seguimientos")
    .select(`
      id,
      persona_id,
      consolidador_id,
      fecha,
      tipo,
      resultado,
      observaciones,
      paso,
      casa,
      lider,
      ministerio,
      nivel_discipulado,
      estado,
      fecha_programada
    `)
    .eq("persona_id", personaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error(error)
    throw new Error("No se pudieron cargar los seguimientos.")
  }

  return (data ?? []) as SeguimientoItem[]
}

export async function getNotasByPersonaId(
  personaId: string
): Promise<PersonaNotaItem[]> {
  if (!personaId || personaId === "undefined" || !isValidUUID(personaId)) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("persona_notas")
    .select(`
      id,
      persona_id,
      nota,
      created_at
    `)
    .eq("persona_id", personaId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    throw new Error("No se pudieron cargar las notas.")
  }

  return (data ?? []) as PersonaNotaItem[]
}

export async function getTodasLasPersonasAdmin(): Promise<
  PersonaListItem[]
> {
  const supabase = await createClient()
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const rolActivo = await getRolActivoFromCookie()

  if (rolActivo !== "admin") {
    redirect("/personas")
  }

  const { data, error } = await supabase
    .from("personas")
    .select(PERSONA_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error cargando personas para administrador:", error)
    throw new Error("No se pudieron cargar las personas del administrador.")
  }

  return (data ?? []) as PersonaListItem[]
}
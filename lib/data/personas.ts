import "server-only"

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

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

function isValidUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function getPersonas(search?: string): Promise<PersonaListItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from("personas")
    .select(`
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
      created_at
    `)
    .order("created_at", { ascending: false })

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

  return data ?? []
}

export async function getPersonaById(id: string): Promise<PersonaDetail> {
  if (!id || id === "undefined" || !isValidUUID(id)) {
    notFound()
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("personas")
    .select(`
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
      created_at
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    notFound()
  }

  return data
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

  return data ?? []
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

  return data ?? []
}
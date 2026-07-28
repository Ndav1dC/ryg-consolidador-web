import "server-only"

import { createClient } from "@/lib/supabase/server"

export type SeguimientoListItem = {
  id: string
  persona_id: string
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
  persona: {
    id: string
    nombre_completo: string
    celular: string | null
    barrio: string | null
    estado_consolidacion: string | null
    etapa_actual: number | null
  } | null
}

export async function getSeguimientos(params?: {
  q?: string
  tipo?: string
  estadoPersona?: string
}): Promise<SeguimientoListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("seguimientos")
    .select(`
      id,
      persona_id,
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
      fecha_programada,
      persona:personas (
        id,
        nombre_completo,
        celular,
        barrio,
        estado_consolidacion,
        etapa_actual
      )
    `)
    .order("fecha", { ascending: false })
    .order("fecha_programada", { ascending: false })

  if (error) {
    console.error(error)
    throw new Error("No se pudieron cargar los seguimientos.")
  }

  let items = (data ?? []) as SeguimientoListItem[]

  if (params?.q?.trim()) {
    const value = params.q.trim().toLowerCase()

    items = items.filter((item) => {
      const persona = item.persona

      return [
        persona?.nombre_completo,
        persona?.celular,
        persona?.barrio,
        item.tipo,
        item.resultado,
        item.estado,
        item.casa,
        item.lider,
        item.ministerio,
        item.nivel_discipulado,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    })
  }

  if (params?.tipo?.trim()) {
    const value = params.tipo.trim().toLowerCase()
    items = items.filter((item) => String(item.tipo ?? "").toLowerCase() === value)
  }

  if (params?.estadoPersona?.trim()) {
    const value = params.estadoPersona.trim().toLowerCase()
    items = items.filter(
      (item) =>
        String(item.persona?.estado_consolidacion ?? "").toLowerCase() === value
    )
  }

  return items
}
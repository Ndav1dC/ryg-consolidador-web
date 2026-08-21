import "server-only"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

export type Notificacion = {
  id: string
  tipo:
    | "persona_asignada"
    | "seguimiento_hoy"
    | "seguimiento_vencido"
    | "sin_gestion"
    | "persona_sin_asignar"
    | "actividad_casa"
  titulo: string
  mensaje: string
  href: string
  leida_at: string | null
  creada_at: string
  vence_at: string | null
  persona_id: string | null
  seguimiento_id: string | null
}

export async function getNotificacionesPendientes(): Promise<Notificacion[]> {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("notificaciones")
    .select(`
      id,
      tipo,
      titulo,
      mensaje,
      href,
      leida_at,
      creada_at,
      vence_at,
      persona_id,
      seguimiento_id
    `)
    .is("leida_at", null)
    .or(`vence_at.is.null,vence_at.gt.${new Date().toISOString()}`)
    .order("creada_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error cargando notificaciones:", error.message)
    return []
  }

  return data ?? []
}

export async function getCantidadNotificacionesPendientes() {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    return 0
  }

  const supabase = await createClient()

  const { count, error } = await supabase
    .from("notificaciones")
    .select("id", { count: "exact", head: true })
    .is("leida_at", null)
    .or(`vence_at.is.null,vence_at.gt.${new Date().toISOString()}`)

  if (error) {
    console.error("Error contando notificaciones:", error.message)
    return 0
  }

  return count ?? 0
}
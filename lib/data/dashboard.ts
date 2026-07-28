import "server-only"

import { createClient } from "@/lib/supabase/server"

export type DashboardStats = {
  totalPersonas: number
  nuevos: number
  activos: number
  pendientes: number
  consolidados: number
  seguimientosHoy: number
  programados: number
}

function todayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    dateOnly: start.toISOString().slice(0, 10),
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const { start, end, dateOnly } = todayRange()

  const [
    totalRes,
    nuevosRes,
    activosRes,
    pendientesRes,
    consolidadosRes,
    seguimientosHoyRes,
    programadosRes,
  ] = await Promise.all([
    supabase.from("personas").select("*", { count: "exact", head: true }),
    supabase
      .from("personas")
      .select("*", { count: "exact", head: true })
      .eq("estado_consolidacion", "nuevo"),
    supabase
      .from("personas")
      .select("*", { count: "exact", head: true })
      .eq("estado_consolidacion", "activo"),
    supabase
      .from("personas")
      .select("*", { count: "exact", head: true })
      .eq("estado_consolidacion", "pendiente"),
    supabase
      .from("personas")
      .select("*", { count: "exact", head: true })
      .eq("estado_consolidacion", "consolidado"),
    supabase
      .from("seguimientos")
      .select("*", { count: "exact", head: true })
      .gte("fecha", start)
      .lt("fecha", end),
    supabase
      .from("seguimientos")
      .select("*", { count: "exact", head: true })
      .eq("fecha_programada", dateOnly),
  ])

  const errors = [
    totalRes.error,
    nuevosRes.error,
    activosRes.error,
    pendientesRes.error,
    consolidadosRes.error,
    seguimientosHoyRes.error,
    programadosRes.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    console.error(errors)
    throw new Error("No se pudieron cargar las estadísticas del dashboard.")
  }

  return {
    totalPersonas: totalRes.count ?? 0,
    nuevos: nuevosRes.count ?? 0,
    activos: activosRes.count ?? 0,
    pendientes: pendientesRes.count ?? 0,
    consolidados: consolidadosRes.count ?? 0,
    seguimientosHoy: seguimientosHoyRes.count ?? 0,
    programados: programadosRes.count ?? 0,
  }
}
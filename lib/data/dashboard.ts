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

export type DashboardNotification = {
  id: string
  text: string
  href: string
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

export async function getDashboardNotifications(): Promise<
  DashboardNotification[]
> {
  const stats = await getDashboardStats()

  const notifications: DashboardNotification[] = []

  if (stats.nuevos > 0) {
    notifications.push({
      id: "personas-nuevas",
      text: `Tienes ${stats.nuevos} ${
        stats.nuevos === 1 ? "persona nueva" : "personas nuevas"
      } por asignar.`,
      href: "/personas/nuevos",
    })
  }

  if (stats.seguimientosHoy > 0) {
    notifications.push({
      id: "seguimientos-hoy",
      text: `Se registraron ${stats.seguimientosHoy} ${
        stats.seguimientosHoy === 1 ? "seguimiento" : "seguimientos"
      } hoy.`,
      href: "/seguimientos",
    })
  }

  if (stats.programados > 0) {
    notifications.push({
      id: "seguimientos-programados",
      text: `Tienes ${stats.programados} ${
        stats.programados === 1
          ? "seguimiento programado para hoy"
          : "seguimientos programados para hoy"
      }.`,
      href: "/seguimientos",
    })
  }

  return notifications
}
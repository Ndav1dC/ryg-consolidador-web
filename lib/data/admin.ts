import "server-only"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

export type AdminSummary = {
  totalPersonas: number
  personasNuevas: number
  personasActivas: number
  personasConsolidadas: number
  personasSinAsignar: number
  seguimientosPendientes: number
  casasAvivamiento: number
  usuariosActivos: number
  porEtapa: {
    etapa: number
    label: string
    cantidad: number
  }[]
}

function esAdministrador(rolActivo: string, roles: string[]) {
  return rolActivo === "admin" || roles.includes("admin")
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const supabase = await createClient()
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const roles = currentUser.profile?.roles ?? []
  const rolActivo = currentUser.profile?.rol ?? ""

  if (!esAdministrador(rolActivo, roles)) {
    redirect("/dashboard")
  }

  const [
    personasResult,
    nuevasResult,
    activasResult,
    consolidadasResult,
    sinAsignarResult,
    seguimientosResult,
    casasResult,
    usuariosResult,
  ] = await Promise.all([
    supabase
      .from("personas")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("personas")
      .select("id", { count: "exact", head: true })
      .eq("estado_consolidacion", "nuevo"),

    supabase
      .from("personas")
      .select("id", { count: "exact", head: true })
      .eq("estado_consolidacion", "activo"),

    supabase
      .from("personas")
      .select("id", { count: "exact", head: true })
      .eq("estado_consolidacion", "consolidado"),

    supabase
      .from("personas")
      .select("id", { count: "exact", head: true })
      .is("asignado_a_id", null),

    supabase
      .from("seguimientos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "pendiente"),

    supabase
      .from("casas_avivamiento")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("usuarios")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
  ])

  const errors = [
    personasResult.error,
    nuevasResult.error,
    activasResult.error,
    consolidadasResult.error,
    sinAsignarResult.error,
    seguimientosResult.error,
    casasResult.error,
    usuariosResult.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    console.error("Error cargando resumen administrativo:", errors)
    throw new Error("No se pudo cargar el resumen administrativo.")
  }

  const { data: etapasData, error: etapasError } = await supabase
    .from("personas")
    .select("etapa_actual")

  if (etapasError) {
    console.error("Error cargando etapas:", etapasError)
    throw new Error("No se pudieron cargar las etapas.")
  }

  const etapas = [
    {
      etapa: 1,
      label: "Primera llamada",
    },
    {
      etapa: 2,
      label: "Asistencia al culto",
    },
    {
      etapa: 3,
      label: "Casa de Avivamiento",
    },
    {
      etapa: 4,
      label: "Discipulado",
    },
    {
      etapa: 5,
      label: "Consolidación",
    },
  ].map((item) => ({
    ...item,
    cantidad: (etapasData ?? []).filter(
      (persona) => Number(persona.etapa_actual) === item.etapa
    ).length,
  }))

  return {
    totalPersonas: personasResult.count ?? 0,
    personasNuevas: nuevasResult.count ?? 0,
    personasActivas: activasResult.count ?? 0,
    personasConsolidadas: consolidadasResult.count ?? 0,
    personasSinAsignar: sinAsignarResult.count ?? 0,
    seguimientosPendientes: seguimientosResult.count ?? 0,
    casasAvivamiento: casasResult.count ?? 0,
    usuariosActivos: usuariosResult.count ?? 0,
    porEtapa: etapas,
  }
}
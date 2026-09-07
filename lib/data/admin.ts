import "server-only"

import { getTodasLasPersonasAdmin, type PersonaListItem } from "./personas"

export type AdminStats = {
  total: number
  nuevas: number
  activas: number
  pendientes: number
  consolidadas: number
  invalidas: number
  sinAsignar: number
  sinGestion: number
}

export type AdminFunnelItem = {
  etapa: number
  label: string
  cantidad: number
  porcentaje: number
}

export type AdminAlert = {
  id: string
  tipo: "critica" | "atencion" | "info"
  titulo: string
  descripcion: string
  cantidad: number
  href: string
}

export type AdminHealthItem = {
  label: string
  valor: number
  color: "green" | "yellow" | "red" | "gray"
}

function diasDesde(fecha: string | null) {
  if (!fecha) return null

  const fechaBase = new Date(`${fecha.slice(0, 10)}T12:00:00`)
  const hoy = new Date()

  hoy.setHours(12, 0, 0, 0)

  const diferencia = hoy.getTime() - fechaBase.getTime()

  return Math.floor(diferencia / (1000 * 60 * 60 * 24))
}

function porcentaje(parte: number, total: number) {
  if (total === 0) return 0

  return Math.round((parte / total) * 100)
}

export async function getAdminDashboardData() {
  const personas = await getTodasLasPersonasAdmin()

  const total = personas.length

  const nuevas = personas.filter(
    (persona) => persona.estado_consolidacion === "nuevo"
  ).length

  const activas = personas.filter(
    (persona) => persona.estado_consolidacion === "activo"
  ).length

  const pendientes = personas.filter(
    (persona) => persona.estado_consolidacion === "pendiente"
  ).length

  const consolidadas = personas.filter(
    (persona) =>
      persona.estado_consolidacion === "consolidado" ||
      Number(persona.etapa_actual) >= 5
  ).length

  const invalidas = personas.filter(
    (persona) => persona.numero_invalido === true
  ).length

  const sinAsignar = personas.filter(
    (persona) => !persona.asignado_a_id
  ).length

  const sinGestion = personas.filter((persona) => {
    const dias = diasDesde(persona.ultima_gestion_fecha)

    return dias === null || dias >= 7
  }).length

  const etapa1 = personas.filter(
    (persona) => Number(persona.etapa_actual) <= 1
  ).length

  const etapa2 = personas.filter(
    (persona) => Number(persona.etapa_actual) === 2
  ).length

  const etapa3 = personas.filter(
    (persona) => Number(persona.etapa_actual) === 3
  ).length

  const etapa4 = personas.filter(
    (persona) => Number(persona.etapa_actual) === 4
  ).length

  const etapa5 = personas.filter(
    (persona) => Number(persona.etapa_actual) >= 5
  ).length

  const funnel: AdminFunnelItem[] = [
    {
      etapa: 1,
      label: "Etapa 1 - Primera llamada",
      cantidad: etapa1,
      porcentaje: porcentaje(etapa1, total),
    },
    {
      etapa: 2,
      label: "Etapa 2 - Asistencia al culto",
      cantidad: etapa2,
      porcentaje: porcentaje(etapa2, total),
    },
    {
      etapa: 3,
      label: "Etapa 3 - Casa de Avivamiento",
      cantidad: etapa3,
      porcentaje: porcentaje(etapa3, total),
    },
    {
      etapa: 4,
      label: "Etapa 4 - Discipulado",
      cantidad: etapa4,
      porcentaje: porcentaje(etapa4, total),
    },
    {
      etapa: 5,
      label: "Etapa 5 - Consolidación",
      cantidad: etapa5,
      porcentaje: porcentaje(etapa5, total),
    },
  ]

  const alertas: AdminAlert[] = [
    {
      id: "sin-asignar",
      tipo: sinAsignar > 0 ? "critica" : "info",
      titulo: "Personas sin asignar",
      descripcion:
        sinAsignar > 0
          ? "Aún no tienen un consolidador responsable."
          : "Todas las personas tienen responsable asignado.",
      cantidad: sinAsignar,
      href: "/admin",
    },
    {
      id: "sin-gestion",
      tipo: sinGestion > 0 ? "atencion" : "info",
      titulo: "Personas sin gestión reciente",
      descripcion:
        sinGestion > 0
          ? "No tienen gestión registrada en los últimos 7 días."
          : "No hay personas sin gestión reciente.",
      cantidad: sinGestion,
      href: "/admin",
    },
    {
      id: "numeros-invalidos",
      tipo: invalidas > 0 ? "atencion" : "info",
      titulo: "Números inválidos",
      descripcion:
        invalidas > 0
          ? "Requieren corrección de celular o revisión."
          : "No hay números inválidos pendientes.",
      cantidad: invalidas,
      href: "/admin",
    },
    {
      id: "pendientes",
      tipo: pendientes > 0 ? "atencion" : "info",
      titulo: "Personas pendientes",
      descripcion:
        pendientes > 0
          ? "Requieren seguimiento para avanzar en su proceso."
          : "No hay personas pendientes.",
      cantidad: pendientes,
      href: "/admin",
    },
  ]

  const salud: AdminHealthItem[] = [
    {
      label: "Consolidadas",
      valor: porcentaje(consolidadas, total),
      color: "green",
    },
    {
      label: "Con responsable asignado",
      valor: porcentaje(total - sinAsignar, total),
      color: "green",
    },
    {
      label: "Con gestión reciente",
      valor: porcentaje(total - sinGestion, total),
      color: sinGestion > 0 ? "yellow" : "green",
    },
    {
      label: "Números inválidos",
      valor: porcentaje(invalidas, total),
      color: invalidas > 0 ? "red" : "gray",
    },
  ]

  const stats: AdminStats = {
    total,
    nuevas,
    activas,
    pendientes,
    consolidadas,
    invalidas,
    sinAsignar,
    sinGestion,
  }

  return {
    personas,
    stats,
    funnel,
    alertas,
    salud,
  }
}   
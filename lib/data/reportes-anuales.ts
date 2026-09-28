import "server-only"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

type RegistroPersona = {
  id: string
  created_at: string | null
}

type RegistroSeguimiento = {
  id: string
  fecha: string | null
}

export type MesReporte = {
  numero: number
  nombre: string
  personasRegistradas: number
  seguimientosRegistrados: number
}

export type ReporteAnual = {
  anio: number
  zonaHoraria: string
  meses: MesReporte[]
  totalPersonasRegistradas: number
  totalSeguimientosRegistrados: number
}

const TAMANO_PAGINA = 1000

const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

function rangoAnualColombia(anio: number) {
  return {
    inicio: new Date(
      Date.UTC(anio, 0, 1, 5, 0, 0)
    ).toISOString(),
    fin: new Date(
      Date.UTC(anio + 1, 0, 1, 5, 0, 0)
    ).toISOString(),
  }
}

function obtenerMesColombia(fecha: string) {
  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) {
    return null
  }

  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    month: "numeric",
  }).formatToParts(valor)

  const mes = partes.find(
    (parte) => parte.type === "month"
  )

  const numero = Number(mes?.value)

  return numero >= 1 && numero <= 12
    ? numero
    : null
}

export async function getReporteAnual(
  anio: number
): Promise<ReporteAnual> {
  if (
    !Number.isInteger(anio) ||
    anio < 2000 ||
    anio > 2100
  ) {
    throw new Error("El año solicitado no es válido.")
  }

  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  const roles = currentUser.profile?.roles ?? []
  const rolPrincipal = currentUser.profile?.rol ?? ""

  if (
    rolPrincipal !== "admin" &&
    !roles.includes("admin")
  ) {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  const { inicio, fin } = rangoAnualColombia(anio)

  const meses: MesReporte[] = NOMBRES_MESES.map(
    (nombre, indice) => ({
      numero: indice + 1,
      nombre,
      personasRegistradas: 0,
      seguimientosRegistrados: 0,
    })
  )

  for (
    let desde = 0;
    ;
    desde += TAMANO_PAGINA
  ) {
    const { data, error } = await supabase
      .from("personas")
      .select("id, created_at")
      .gte("created_at", inicio)
      .lt("created_at", fin)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(desde, desde + TAMANO_PAGINA - 1)

    if (error) {
      console.error(
        "Error cargando personas del reporte anual:",
        error
      )
      throw new Error(
        "No se pudieron cargar los registros del año."
      )
    }

    const registros = (data ?? []) as RegistroPersona[]

    for (const persona of registros) {
      if (!persona.created_at) continue

      const mes = obtenerMesColombia(
        persona.created_at
      )

      if (mes) {
        meses[mes - 1].personasRegistradas += 1
      }
    }

    if (registros.length < TAMANO_PAGINA) {
      break
    }
  }

  for (
    let desde = 0;
    ;
    desde += TAMANO_PAGINA
  ) {
    const { data, error } = await supabase
      .from("seguimientos")
      .select("id, fecha")
      .gte("fecha", inicio)
      .lt("fecha", fin)
      .order("fecha", { ascending: true })
      .order("id", { ascending: true })
      .range(desde, desde + TAMANO_PAGINA - 1)

    if (error) {
      console.error(
        "Error cargando seguimientos del reporte anual:",
        error
      )
      throw new Error(
        "No se pudieron cargar los seguimientos del año."
      )
    }

    const registros = (data ??
      []) as RegistroSeguimiento[]

    for (const seguimiento of registros) {
      if (!seguimiento.fecha) continue

      const mes = obtenerMesColombia(
        seguimiento.fecha
      )

      if (mes) {
        meses[mes - 1].seguimientosRegistrados += 1
      }
    }

    if (registros.length < TAMANO_PAGINA) {
      break
    }
  }

  return {
    anio,
    zonaHoraria: "America/Bogota",
    meses,
    totalPersonasRegistradas: meses.reduce(
      (total, mes) =>
        total + mes.personasRegistradas,
      0
    ),
    totalSeguimientosRegistrados: meses.reduce(
      (total, mes) =>
        total + mes.seguimientosRegistrados,
      0
    ),
  }
}
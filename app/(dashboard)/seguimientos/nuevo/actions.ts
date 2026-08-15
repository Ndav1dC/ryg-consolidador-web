"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function nullable(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim()
  return parsed ? parsed : null
}

function nullableNumber(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim()

  if (!parsed) return null

  const number = Number(parsed)
  return Number.isNaN(number) ? null : number
}

function calculateEstado(paso: number) {
  if (paso >= 5) return "consolidado"
  if (paso >= 2) return "activo"
  return "pendiente"
}

function calculateProximoPaso(paso: number) {
  if (paso >= 5) return "Proceso completado - Consolidado"
  if (paso === 4) return "Iniciar ministerio"
  if (paso === 3) return "Iniciar discipulado"
  if (paso === 2) return "Asignar a Casa de Avivamiento"
  return "Seguimiento 1 - Primera llamada"
}

async function getUsuarioActual() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No se pudo identificar el usuario autenticado.")
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, nombre, roles")
    .eq("auth_id", user.id)
    .single()

  if (usuarioError || !usuario) {
    console.error("Error consultando usuario interno:", usuarioError)
    throw new Error("No se pudo consultar el usuario interno.")
  }

  return { supabase, usuario }
}

function revalidateSeguimientos(personaId: string) {
  revalidatePath("/personas")
  revalidatePath(`/personas/${personaId}`)
  revalidatePath("/seguimientos")
  revalidatePath("/seguimientos/nuevo")
  revalidatePath("/personas/nuevos")
  revalidatePath("/dashboard")
}

async function confirmarVisita(formData: FormData) {
  const { supabase } = await getUsuarioActual()

  const personaId = String(formData.get("persona_id") ?? "").trim()
  const visitaId = String(formData.get("visita_id") ?? "").trim()
  const resultadoVisita = nullable(formData.get("resultado_visita"))
  const observaciones = nullable(formData.get("observaciones"))

  if (!personaId || !visitaId) {
    throw new Error("No se pudo identificar la visita pendiente.")
  }

  if (resultadoVisita !== "sí" && resultadoVisita !== "no") {
    throw new Error("Debes indicar si se visitó a la persona.")
  }

  const { data: visita, error: visitaError } = await supabase
    .from("seguimientos")
    .select("id, persona_id, estado")
    .eq("id", visitaId)
    .eq("persona_id", personaId)
    .eq("tipo", "visita")
    .eq("estado", "pendiente")
    .single()

  if (visitaError || !visita) {
    console.error("Error buscando visita pendiente:", visitaError)
    throw new Error("La visita pendiente no existe o ya fue resuelta.")
  }

  const fechaActual = new Date().toISOString().slice(0, 10)
  const visitaRealizada = resultadoVisita === "sí"

  const { error: updateVisitaError } = await supabase
    .from("seguimientos")
    .update({
      resultado: visitaRealizada ? "sí" : "no",
      estado: visitaRealizada ? "realizada" : "no_realizada",
      fecha: fechaActual,
      observaciones,
    })
    .eq("id", visitaId)

  if (updateVisitaError) {
    console.error("Error actualizando visita:", updateVisitaError)
    throw new Error("No se pudo actualizar el resultado de la visita.")
  }

  const siguienteEtapa = visitaRealizada ? 2 : 1

  const { error: updatePersonaError } = await supabase
    .from("personas")
    .update({
      etapa_actual: siguienteEtapa,
      ultima_gestion_fecha: fechaActual,
      proximo_paso: visitaRealizada
        ? "Etapa 2 - Confirmar asistencia al culto"
        : "Etapa 1 - Realizar nueva llamada",
      estado_consolidacion: visitaRealizada ? "activo" : "pendiente",
    })
    .eq("id", personaId)

  if (updatePersonaError) {
    console.error("Error actualizando persona tras visita:", updatePersonaError)
    throw new Error("No se pudo actualizar el avance de la persona.")
  }

  revalidateSeguimientos(personaId)
  redirect(`/personas/${personaId}`)
}

export async function createSeguimientoAction(formData: FormData) {
  const accion = String(formData.get("accion") ?? "crear_seguimiento")

  if (accion === "confirmar_visita") {
    await confirmarVisita(formData)
    return
  }

  const { supabase, usuario } = await getUsuarioActual()

  const personaId = String(formData.get("persona_id") ?? "").trim()
  const paso = nullableNumber(formData.get("paso"))
  const tipo = nullable(formData.get("tipo"))
  const resultado = nullable(formData.get("resultado"))
  const observaciones = nullable(formData.get("observaciones"))
  const fecha = nullable(formData.get("fecha"))
  const fechaProgramada = nullable(formData.get("fecha_programada"))

  const casa =
    nullable(formData.get("casa")) || nullable(formData.get("casa_hidden"))
  const lider = nullable(formData.get("lider"))
  const ministerio = nullable(formData.get("ministerio"))
  const nivelDiscipulado = nullable(formData.get("nivel_discipulado"))
  const estado = nullable(formData.get("estado"))

  if (!personaId || personaId === "undefined") {
    throw new Error("La persona es obligatoria.")
  }

  if (!paso || paso < 1 || paso > 5) {
    throw new Error("La etapa es obligatoria.")
  }

  if (!tipo || !fecha) {
    throw new Error("Faltan datos obligatorios del seguimiento.")
  }

  const { data: persona, error: personaConsultaError } = await supabase
    .from("personas")
    .select("id, etapa_actual, asignado_a_id")
    .eq("id", personaId)
    .single()

  if (personaConsultaError || !persona) {
    console.error("Error consultando persona:", personaConsultaError)
    throw new Error("No se encontró la persona seleccionada.")
  }

  const { data: visitaPendiente, error: visitaPendienteError } = await supabase
    .from("seguimientos")
    .select("id")
    .eq("persona_id", personaId)
    .eq("tipo", "visita")
    .eq("estado", "pendiente")
    .limit(1)
    .maybeSingle()

  if (visitaPendienteError) {
    console.error("Error consultando visita pendiente:", visitaPendienteError)
    throw new Error("No se pudo verificar si hay una visita pendiente.")
  }

  if (visitaPendiente) {
    throw new Error(
      "Esta persona tiene una visita pendiente. Primero indica si se visitó."
    )
  }

  const etapaEsperada = persona.etapa_actual || 1

  if (paso !== etapaEsperada) {
    throw new Error(
      `No puedes registrar la Etapa ${paso}. La siguiente etapa disponible es la Etapa ${etapaEsperada}.`
    )
  }

  if (paso === 1) {
    if (
      resultado !== "contestó" &&
      resultado !== "no_contestó" &&
      resultado !== "se_agendó_visita"
    ) {
      throw new Error("Debes indicar el resultado de la llamada.")
    }

    if (resultado === "se_agendó_visita" && !fechaProgramada) {
      throw new Error("Debes indicar la fecha de la visita.")
    }
  }

  if (paso === 2 && resultado !== "sí" && resultado !== "no") {
    throw new Error("Debes indicar si asistió nuevamente al culto.")
  }

  if (paso === 3) {
    if (!resultado) {
      throw new Error("Debes confirmar la asignación a Casa de Avivamiento.")
    }

    if (!casa || !lider) {
      throw new Error("Debes indicar la casa y el líder responsable.")
    }
  }

  if (paso === 4 && !nivelDiscipulado) {
    throw new Error("Debes indicar el nivel de discipulado.")
  }

  if (paso === 5 && (!resultado || !ministerio)) {
    throw new Error("Debes indicar el ministerio y el resultado.")
  }

  if (paso === 1 && !persona.asignado_a_id) {
    const { error: asignarError } = await supabase
      .from("personas")
      .update({
        asignado_a_id: usuario.id,
        estado_consolidacion: "pendiente",
        etapa_actual: 1,
      })
      .eq("id", personaId)

    if (asignarError) {
      console.error("Error asignando persona al consolidador:", asignarError)
      throw new Error("No se pudo asignar la persona al consolidador.")
    }
  }

  if (paso === 3 && lider && casa) {
    const { data: liderData, error: liderError } = await supabase
      .from("usuarios")
      .select("id")
      .ilike("nombre", `%${lider.trim()}%`)
      .limit(1)
      .maybeSingle()

    if (liderError || !liderData) {
      console.error("Error buscando líder:", liderError)
      throw new Error(`No se encontró el líder: "${lider}".`)
    }

    const { data: casaData, error: casaError } = await supabase
      .from("casas_avivamiento")
      .select("id")
      .ilike("nombre", `%${casa.trim()}%`)
      .limit(1)
      .maybeSingle()

    if (casaError) {
      console.error("Error buscando casa:", casaError)
    }

    const { error: asignarCasaError } = await supabase
      .from("personas")
      .update({
        asignado_a_id: liderData.id,
        casa_avivamiento_id: casaData?.id ?? null,
      })
      .eq("id", personaId)

    if (asignarCasaError) {
      console.error("Error asignando líder y casa:", asignarCasaError)
      throw new Error("No se pudo asignar el líder y la casa.")
    }
  }

  const { error: seguimientoError } = await supabase.from("seguimientos").insert({
    persona_id: personaId,
    consolidador_id: usuario.id,
    fecha,
    tipo,
    resultado,
    observaciones,
    paso,
    casa,
    lider,
    ministerio,
    nivel_discipulado: nivelDiscipulado,
    estado: estado || calculateEstado(paso),
  })

  if (seguimientoError) {
    console.error("Error guardando seguimiento:", seguimientoError)
    throw new Error(
      `No se pudo guardar el seguimiento: ${seguimientoError.message}`
    )
  }

  let siguienteEtapa = paso
  let proximoPaso = calculateProximoPaso(paso)
  let estadoPersona = estado || calculateEstado(paso)

  if (paso === 1) {
    if (resultado === "contestó") {
      siguienteEtapa = 2
      proximoPaso = "Etapa 2 - Confirmar asistencia al culto"
      estadoPersona = "activo"
    }

    if (resultado === "no_contestó") {
      siguienteEtapa = 1
      proximoPaso = "Etapa 1 - Realizar nueva llamada"
      estadoPersona = "pendiente"
    }

    if (resultado === "se_agendó_visita") {
      const { error: visitaError } = await supabase
        .from("seguimientos")
        .insert({
          persona_id: personaId,
          consolidador_id: usuario.id,
          fecha: fechaProgramada,
          fecha_programada: fechaProgramada,
          tipo: "visita",
          resultado: "pendiente",
          observaciones: "Visita agendada desde la Etapa 1.",
          paso: 1,
          estado: "pendiente",
        })

      if (visitaError) {
        console.error("Error al crear visita pendiente:", visitaError)

        throw new Error(
          `No se pudo agendar la visita: ${visitaError.message}`
        )
      }

      siguienteEtapa = 1
      proximoPaso = "Confirmar si se visitó a la persona"
      estadoPersona = "pendiente"
    }
  }

  if (paso === 2) {
    if (resultado === "sí") {
      siguienteEtapa = 3
      proximoPaso = "Etapa 3 - Asignar a Casa de Avivamiento"
      estadoPersona = "activo"
    } else {
      siguienteEtapa = 2
      proximoPaso = "Etapa 2 - Realizar nueva invitación al culto"
      estadoPersona = "activo"
    }
  }

  if (paso === 3) {
    siguienteEtapa = 4
    proximoPaso = "Etapa 4 - Iniciar discipulado"
    estadoPersona = "activo"
  }

  if (paso === 4) {
    siguienteEtapa = 5
    proximoPaso = "Etapa 5 - Ministerio y consolidación"
    estadoPersona = "activo"
  }

  if (paso === 5) {
    siguienteEtapa = 5
    proximoPaso = "Proceso completado - Consolidado"
    estadoPersona = "consolidado"
  }

  const { error: personaError } = await supabase
    .from("personas")
    .update({
      etapa_actual: siguienteEtapa,
      ultima_gestion_fecha: fecha,
      proximo_paso: proximoPaso,
      estado_consolidacion: estadoPersona,
    })
    .eq("id", personaId)

  if (personaError) {
    console.error("Error actualizando persona:", personaError)
    throw new Error(
      "Se guardó el seguimiento, pero no se pudo actualizar la persona."
    )
  }

  revalidateSeguimientos(personaId)
  redirect(`/personas/${personaId}`)
}
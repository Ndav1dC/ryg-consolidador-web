"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const ULTIMA_ETAPA_CONSOLIDADOR = 3
const PRIMERA_ETAPA_LIDER_CASA = 4
const ULTIMA_ETAPA_PROCESO = 5

type NivelDiscipulado = "Nivel 1" | "Nivel 2" | "Nivel 3"

type DiscipuladoResumen = {
  nivel_actual: number | null
  fecha_inicio: string | null
  fecha_completado: string | null
}

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

function normalizarNivel(
  value?: string | null
): NivelDiscipulado | null {
  const nivel = value?.trim()

  if (nivel === "Nivel 1") return "Nivel 1"
  if (nivel === "Nivel 2") return "Nivel 2"
  if (nivel === "Nivel 3") return "Nivel 3"

  return null
}

function nivelANumero(nivel: NivelDiscipulado) {
  if (nivel === "Nivel 1") return 1
  if (nivel === "Nivel 2") return 2
  return 3
}

function numeroANivel(nivel: number): NivelDiscipulado | null {
  if (nivel === 1) return "Nivel 1"
  if (nivel === 2) return "Nivel 2"
  if (nivel === 3) return "Nivel 3"
  return null
}

function calculateEstado(paso: number) {
  if (paso >= ULTIMA_ETAPA_PROCESO) {
    return "consolidado"
  }

  if (paso >= 2) {
    return "activo"
  }

  return "pendiente"
}

function calculateProximoPaso(paso: number) {
  if (paso >= ULTIMA_ETAPA_PROCESO) {
    return "Proceso completado - Consolidado"
  }

  if (paso === 4) {
    return "Continuar con el siguiente nivel de discipulado"
  }

  if (paso === 3) {
    return "Etapa 4 - Iniciar discipulado"
  }

  if (paso === 2) {
    return "Etapa 3 - Asignar a Casa de Avivamiento"
  }

  return "Etapa 1 - Primera llamada"
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

  const cookieStore = await cookies()
  const rolDesdeCookie = cookieStore.get("rol_activo")?.value
  const rolesUsuario = usuario.roles || []

  const rolActivo =
    rolDesdeCookie === "lider_casa" && rolesUsuario.includes("lider_casa")
      ? "lider_casa"
      : rolDesdeCookie === "consolidador" &&
          rolesUsuario.includes("consolidador")
        ? "consolidador"
        : rolDesdeCookie === "admin" && rolesUsuario.includes("admin")
          ? "admin"
          : rolesUsuario.includes("lider_casa")
            ? "lider_casa"
            : rolesUsuario.includes("admin")
              ? "admin"
              : "consolidador"

  return {
    supabase,
    usuario,
    rolActivo,
  }
}

function revalidateSeguimientos(personaId: string) {
  revalidatePath("/personas")
  revalidatePath(`/personas/${personaId}`)
  revalidatePath("/seguimientos")
  revalidatePath("/seguimientos/nuevo")
  revalidatePath("/personas/nuevos")
  revalidatePath("/personas/numeros-invalidos")
  revalidatePath("/dashboard")
}

function validarEtapaPorRol(rolActivo: string, paso: number) {
  if (paso < 1 || paso > ULTIMA_ETAPA_PROCESO) {
    throw new Error("La etapa es obligatoria.")
  }

  if (rolActivo === "consolidador" && paso > ULTIMA_ETAPA_CONSOLIDADOR) {
    throw new Error(
      "El consolidador solo puede registrar las etapas 1, 2 y 3."
    )
  }

  if (rolActivo === "lider_casa" && paso < PRIMERA_ETAPA_LIDER_CASA) {
    throw new Error(
      "El Líder de Casa solo puede registrar las etapas 4 y 5."
    )
  }
}

async function getDiscipuladoResumen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  personaId: string
): Promise<DiscipuladoResumen | null> {
  const { data, error } = await supabase
    .from("discipulado")
    .select("nivel_actual, fecha_inicio, fecha_completado")
    .eq("persona_id", personaId)
    .maybeSingle()

  if (error) {
    console.error("Error consultando discipulado:", error)
    throw new Error("No se pudo consultar el avance de discipulado.")
  }

  return data
}

function getNivelEsperadoDesdeNumero(
  nivelActual: number
): NivelDiscipulado | null {
  if (nivelActual <= 0) return "Nivel 1"
  if (nivelActual === 1) return "Nivel 2"
  if (nivelActual === 2) return "Nivel 3"

  return null
}

async function confirmarVisita(formData: FormData) {
  const { supabase, rolActivo } = await getUsuarioActual()

  if (rolActivo === "lider_casa") {
    throw new Error(
      "La confirmación de visitas corresponde al proceso del consolidador."
    )
  }

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
    .select("id, persona_id, estado, observaciones")
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

  const observacionAnterior = visita.observaciones?.trim()
  const observacionResultado = visitaRealizada
    ? "Visita confirmada: la persona fue visitada."
    : "Visita confirmada: la persona no fue visitada."

  const observacionesFinales = [
    observacionAnterior,
    observacionResultado,
    observaciones,
  ]
    .filter(Boolean)
    .join("\n")

  const { error: updateVisitaError } = await supabase
    .from("seguimientos")
    .update({
      resultado: visitaRealizada ? "sí" : "no",
      estado: "completado",
      fecha: fechaActual,
      observaciones: observacionesFinales || null,
    })
    .eq("id", visitaId)
    .eq("persona_id", personaId)

  if (updateVisitaError) {
    console.error("Error actualizando visita:", updateVisitaError)
    throw new Error(
      `No se pudo actualizar el resultado de la visita: ${updateVisitaError.message}`
    )
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

  const { supabase, usuario, rolActivo } = await getUsuarioActual()

  const personaId = String(formData.get("persona_id") ?? "").trim()
  const paso = nullableNumber(formData.get("paso"))
  const tipo = nullable(formData.get("tipo"))
  const resultadoFormulario = nullable(formData.get("resultado"))
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

  if (!paso) {
    throw new Error("La etapa es obligatoria.")
  }

  const resultado =
    paso === 3
      ? "asignado"
      : resultadoFormulario

  validarEtapaPorRol(rolActivo, paso)

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

  const etapaActualPersona = Number(persona.etapa_actual) || 1

  if (
    rolActivo === "consolidador" &&
    etapaActualPersona > ULTIMA_ETAPA_CONSOLIDADOR
  ) {
    throw new Error(
      "Esta persona ya pasó las etapas correspondientes al consolidador."
    )
  }

  if (
    rolActivo === "lider_casa" &&
    etapaActualPersona < PRIMERA_ETAPA_LIDER_CASA
  ) {
    throw new Error(
      "Esta persona todavía no ha sido entregada al Líder de Casa."
    )
  }

  const discipuladoResumen =
    paso === 4 || paso === 5
      ? await getDiscipuladoResumen(supabase, personaId)
      : null

  const nivelActualDiscipulado = Math.min(
    Math.max(Number(discipuladoResumen?.nivel_actual) || 0, 0),
    3
  )

  const discipuladoCompletoAntes = nivelActualDiscipulado === 3

  const puedeRegistrarDiscipuladoPendiente =
    rolActivo === "lider_casa" &&
    paso === 4 &&
    etapaActualPersona === 5 &&
    !discipuladoCompletoAntes

  if (
    paso !== etapaActualPersona &&
    !puedeRegistrarDiscipuladoPendiente
  ) {
    throw new Error(
      `No puedes registrar la Etapa ${paso}. La siguiente etapa disponible es la Etapa ${etapaActualPersona}.`
    )
  }

  if (paso === 1) {
    if (
      resultado !== "contestó" &&
      resultado !== "no_contestó" &&
      resultado !== "numero_invalido" &&
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
    if (!casa || !lider) {
      throw new Error("Debes indicar la casa y el líder responsable.")
    }
  }

  const nivelValidado = normalizarNivel(nivelDiscipulado)

  if (paso === 4) {
    if (!nivelValidado) {
      throw new Error(
        "Debes indicar un nivel válido de discipulado."
      )
    }

    const nivelEsperado = getNivelEsperadoDesdeNumero(
      nivelActualDiscipulado
    )

    if (!nivelEsperado) {
      throw new Error(
        "Los tres niveles de discipulado ya fueron completados. Continúa con la Etapa 5."
      )
    }

    if (nivelValidado !== nivelEsperado) {
      throw new Error(
        `Debes registrar primero el ${nivelEsperado}.`
      )
    }
  }

  if (paso === 5) {
    if (!discipuladoCompletoAntes) {
      throw new Error(
        "Debes completar los niveles 1, 2 y 3 de discipulado antes de registrar Ministerio."
      )
    }

    if (!resultado || !ministerio) {
      throw new Error("Debes indicar el ministerio y el resultado.")
    }
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

  if (visitaPendiente && rolActivo !== "lider_casa") {
    throw new Error(
      "Esta persona tiene una visita pendiente. Primero indica si se visitó."
    )
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

  const { error: seguimientoError } = await supabase
    .from("seguimientos")
    .insert({
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
      nivel_discipulado: nivelValidado,
      estado: estado || calculateEstado(paso),
    })

  if (seguimientoError) {
    console.error("Error guardando seguimiento:", seguimientoError)
    throw new Error(
      `No se pudo guardar el seguimiento: ${seguimientoError.message}`
    )
  }

  if (paso === 4 && nivelValidado) {
    const nivelNumero = nivelANumero(nivelValidado)
    const fechaInicio =
      nivelActualDiscipulado === 0
        ? fecha
        : discipuladoResumen?.fecha_inicio || fecha

    const { error: discipuladoError } = await supabase
      .from("discipulado")
      .upsert(
        {
          persona_id: personaId,
          nivel_actual: nivelNumero,
          fecha_inicio: fechaInicio,
          fecha_completado: nivelNumero === 3 ? fecha : null,
        },
        {
          onConflict: "persona_id",
        }
      )

    if (discipuladoError) {
      console.error("Error actualizando discipulado:", discipuladoError)
      throw new Error(
        `Se registró el seguimiento, pero no se pudo actualizar discipulado: ${discipuladoError.message}`
      )
    }
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

    if (resultado === "numero_invalido") {
      siguienteEtapa = 1
      proximoPaso = "Número inválido - Pendiente de actualizar celular"
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
      proximoPaso = "Etapa 2 - Invitar nuevamente al culto"
      estadoPersona = "activo"
    }
  }

  if (paso === 3) {
    siguienteEtapa = 4
    proximoPaso = "Etapa 4 - Iniciar discipulado (Nivel 1)"
    estadoPersona = "activo"
  }

  if (paso === 4) {
    const nuevoNivel = nivelANumero(nivelValidado!)

    if (nuevoNivel === 3) {
      siguienteEtapa = 5
      proximoPaso = "Etapa 5 - Ministerio y consolidación"
      estadoPersona = "activo"
    } else {
      const siguienteNivel = numeroANivel(nuevoNivel + 1)

      siguienteEtapa = 4
      proximoPaso = siguienteNivel
        ? `Etapa 4 - Continuar discipulado (${siguienteNivel})`
        : "Etapa 4 - Continuar discipulado"

      estadoPersona = "activo"
    }
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
      numero_invalido: resultado === "numero_invalido",
    })
    .eq("id", personaId)

  if (personaError) {
    console.error("Error actualizando persona:", personaError)
    throw new Error(
      "Se guardó el seguimiento, pero no se pudo actualizar la persona."
    )
  }

  revalidateSeguimientos(personaId)

  if (resultado === "numero_invalido") {
    redirect("/personas/numeros-invalidos")
  }

  redirect(`/personas/${personaId}`)
}
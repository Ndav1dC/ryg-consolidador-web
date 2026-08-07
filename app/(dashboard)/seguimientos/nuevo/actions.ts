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

  const num = Number(parsed)
  return Number.isNaN(num) ? null : num
}

function calculateEstado(paso: number | null) {
  if (!paso) return "nuevo"
  if (paso >= 5) return "consolidado"
  if (paso >= 2) return "activo"
  return "pendiente"
}

function calculateProximoPaso(paso: number | null) {
  if (!paso) return null
  if (paso >= 5) return "Proceso completado - Consolidado"
  if (paso === 4) return "Iniciar ministerio"
  if (paso === 3) return "Iniciar discipulado"
  if (paso === 2) return "Asignar a Casa de Avivamiento"
  if (paso === 1) return "Seguimiento 2 - Invitar a culto"
  return `Seguimiento ${paso + 1}`
}

export async function createSeguimientoAction(formData: FormData) {
  const supabase = await createClient()

  const personaId = String(formData.get("persona_id") ?? "").trim()
  const paso = nullableNumber(formData.get("paso"))
  const tipo = nullable(formData.get("tipo"))
  const resultado = nullable(formData.get("resultado"))
  const observaciones = nullable(formData.get("observaciones"))
  const fecha = nullable(formData.get("fecha"))

  const casa = nullable(formData.get("casa")) || nullable(formData.get("casa_hidden"))
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

  if (!tipo) {
    throw new Error("El tipo es obligatorio.")
  }

  if (!fecha) {
    throw new Error("La fecha es obligatoria.")
  }

  // Validaciones por etapa
  if (paso === 1 && !resultado) {
    throw new Error("Debes indicar el resultado de la llamada.")
  }

  if (paso === 2 && !resultado) {
    throw new Error("Debes indicar si asistió nuevamente al culto.")
  }

  if (paso === 3) {
    if (!resultado) throw new Error("Debes indicar si fue asignada a Casa de Avivamiento.")
    if (!casa) throw new Error("Debes indicar la Casa de Avivamiento.")
    if (!lider) throw new Error("Debes seleccionar el líder responsable.")
  }

  if (paso === 4 && !nivelDiscipulado) {
    throw new Error("Debes indicar el nivel de discipulado.")
  }

  if (paso === 5) {
    if (!resultado) throw new Error("Debes indicar si está sirviendo en ministerio.")
    if (!ministerio) throw new Error("Debes indicar el ministerio.")
  }

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

  if (usuarioError) {
    console.error(usuarioError)
    throw new Error("No se pudo consultar el usuario interno.")
  }

  if (!usuario) {
    throw new Error("No existe un usuario interno asociado a esta cuenta.")
  }

  // ============================================
  // ETAPA 1: Asignar la persona al consolidador
  // ============================================
  if (paso === 1) {
    const { error: asignarError } = await supabase
      .from("personas")
      .update({
        asignado_a_id: usuario.id,
        estado_consolidacion: "activo",
        etapa_actual: 1,
      })
      .eq("id", personaId)

    if (asignarError) {
      console.error("Error asignando persona:", asignarError)
      throw new Error("No se pudo asignar la persona al consolidador.")
    }
  }

  // ============================================
  // ETAPA 3: Asignar a líder de casa
  // ============================================
  if (paso === 3 && lider && casa) {
    console.log("=== ETAPA 3 ===")
    console.log("Líder buscado:", lider)
    console.log("Casa buscada:", casa)

    // ==========================================
    // BUSCAR LÍDER - Case insensitive y tolerante a espacios
    // ==========================================
    let liderId = null
    let liderEncontrado = null

    // Buscar por nombre con ilike (case insensitive) y trim
    const { data: liderData, error: liderError } = await supabase
      .from("usuarios")
      .select("id, nombre, roles")
      .ilike("nombre", `%${lider.trim()}%`)

    console.log("Resultado búsqueda líder:", liderData)

    if (liderError) {
      console.error("Error buscando líder:", liderError)
    }

    if (liderData && liderData.length > 0) {
      liderId = liderData[0].id
      liderEncontrado = liderData[0].nombre
      console.log("✅ Líder encontrado:", liderEncontrado)
    } else {
      // Si no encuentra, mostrar todos para debug
      const { data: todosUsuarios } = await supabase
        .from("usuarios")
        .select("id, nombre, roles")

      console.log("Todos los usuarios en BD:", todosUsuarios)

      throw new Error(
        `No se encontró el líder: "${lider}". Usuarios disponibles: ${todosUsuarios?.map(u => u.nombre).join(", ")}`
      )
    }

    // ==========================================
    // BUSCAR CASA
    // ==========================================
    let casaId = null
    let casaEncontrada = null

    const { data: casaData, error: casaError } = await supabase
      .from("casas_avivamiento")
      .select("id, nombre")
      .eq("nombre", casa)

    console.log("Resultado búsqueda casa:", casaData)

    if (casaError) {
      console.error("Error buscando casa:", casaError)
    }

    if (casaData && casaData.length > 0) {
      casaId = casaData[0].id
      casaEncontrada = casaData[0].nombre
      console.log("✅ Casa encontrada:", casaEncontrada)
    } else {
      const { data: casaDataILike } = await supabase
        .from("casas_avivamiento")
        .select("id, nombre")
        .ilike("nombre", `%${casa.trim()}%`)

      if (casaDataILike && casaDataILike.length > 0) {
        casaId = casaDataILike[0].id
        casaEncontrada = casaDataILike[0].nombre
        console.log("✅ Casa encontrada (ilike):", casaEncontrada)
      }
    }

    console.log("Líder ID encontrado:", liderId)
    console.log("Casa ID encontrado:", casaId)

    // ==========================================
    // ACTUALIZAR PERSONA
    // ==========================================
    if (liderId) {
      const { error: updateError } = await supabase
        .from("personas")
        .update({
          asignado_a_id: liderId,
          casa_avivamiento_id: casaId,
        })
        .eq("id", personaId)

      if (updateError) {
        console.error("Error actualizando persona:", updateError)
        throw new Error("No se pudo asignar el líder y la casa.")
      } else {
        console.log("✅ Persona actualizada con líder y casa")
      }
    } else {
      // Mostrar todos los usuarios para debug
      const { data: todosUsuarios } = await supabase
        .from("usuarios")
        .select("id, nombre, roles")

      console.log("Todos los usuarios en BD:", todosUsuarios)

      throw new Error(
        `No se encontró el líder: "${lider}". Usuarios disponibles: ${todosUsuarios?.map(u => u.nombre).join(", ")}`
      )
    }
  }

  // ============================================
  // ETAPA 5: Consolidar persona
  // ============================================
  if (paso === 5) {
    await supabase
      .from("personas")
      .update({
        estado_consolidacion: "consolidado",
      })
      .eq("id", personaId)
  }

  // ============================================
  // Guardar el seguimiento
  // ============================================
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
    console.error(seguimientoError)
    throw new Error("No se pudo guardar el seguimiento.")
  }

  // ============================================
  // Actualizar la persona
  // ============================================
  const { error: personaError } = await supabase
    .from("personas")
    .update({
      etapa_actual: paso,
      ultima_gestion_fecha: fecha,
      proximo_paso: calculateProximoPaso(paso),
      estado_consolidacion: estado || calculateEstado(paso),
    })
    .eq("id", personaId)

  if (personaError) {
    console.error(personaError)
    throw new Error("Se guardó el seguimiento, pero no se pudo actualizar la persona.")
  }

  // ============================================
  // Revalidar rutas
  // ============================================
  revalidatePath("/personas")
  revalidatePath(`/personas/${personaId}`)
  revalidatePath("/seguimientos")
  revalidatePath("/seguimientos/nuevo")
  revalidatePath("/personas/nuevos")
  revalidatePath("/dashboard")

  redirect(`/personas/${personaId}`)
}
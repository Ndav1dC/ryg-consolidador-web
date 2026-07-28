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
  if (paso >= 5) return "Proceso completado"
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
  const casa = nullable(formData.get("casa"))
  const lider = nullable(formData.get("lider"))
  const ministerio = nullable(formData.get("ministerio"))
  const nivelDiscipulado = nullable(formData.get("nivel_discipulado"))

  if (!personaId || personaId === "undefined") {
    throw new Error("La persona es obligatoria.")
  }

  if (!paso) {
    throw new Error("El paso es obligatorio.")
  }

  if (!tipo) {
    throw new Error("El tipo es obligatorio.")
  }

  if (!fecha) {
    throw new Error("La fecha es obligatoria.")
  }

  if (paso === 1 && !resultado) {
    throw new Error("Debes indicar el resultado de la llamada.")
  }

  if (paso === 2 && !resultado) {
    throw new Error("Debes indicar si asistió nuevamente al culto.")
  }

  if (paso === 3) {
    if (!resultado) throw new Error("Debes indicar si ya fue ubicada en una Casa de Avivamiento.")
    if (!casa) throw new Error("Debes indicar la casa de avivamiento.")
    if (!lider) throw new Error("Debes indicar el líder responsable.")
  }

  if (paso === 4 && !nivelDiscipulado) {
    throw new Error("Debes indicar el nivel de discipulado.")
  }

  if (paso === 5) {
    if (!resultado) throw new Error("Debes indicar si está sirviendo.")
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
    .select("id, nombre, rol, auth_id")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (usuarioError) {
    console.error(usuarioError)
    throw new Error("No se pudo consultar el usuario interno.")
  }

  if (!usuario) {
    throw new Error("No existe un usuario interno asociado a esta cuenta.")
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
    estado: calculateEstado(paso),
  })

  if (seguimientoError) {
    console.error(seguimientoError)
    throw new Error("No se pudo guardar el seguimiento.")
  }

  const { error: personaError } = await supabase
    .from("personas")
    .update({
      etapa_actual: paso,
      ultima_gestion_fecha: fecha,
      proximo_paso: calculateProximoPaso(paso),
      estado_consolidacion: calculateEstado(paso),
    })
    .eq("id", personaId)

  if (personaError) {
    console.error(personaError)
    throw new Error("Se guardó el seguimiento, pero no se pudo actualizar la persona.")
  }

  revalidatePath("/personas")
  revalidatePath(`/personas/${personaId}`)
  revalidatePath("/seguimientos")
  revalidatePath("/seguimientos/nuevo")

  redirect(`/personas/${personaId}`)
}
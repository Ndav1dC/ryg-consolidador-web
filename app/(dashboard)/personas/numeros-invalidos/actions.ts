"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function verificarConsolidador() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No se pudo identificar al usuario autenticado.")
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, roles")
    .eq("auth_id", user.id)
    .single()

  if (usuarioError || !usuario) {
    console.error("Error consultando usuario:", usuarioError)
    throw new Error("No se pudo consultar el usuario interno.")
  }

  const cookieStore = await cookies()
  const rolActivo = cookieStore.get("rol_activo")?.value

  const esConsolidadorActivo =
    rolActivo === "consolidador" &&
    usuario.roles?.includes("consolidador")

  if (!esConsolidadorActivo) {
    throw new Error(
      "Solo un consolidador con el rol activo puede gestionar números inválidos."
    )
  }

  return supabase
}

function revalidarPaginas(personaId?: string) {
  revalidatePath("/personas")
  revalidatePath("/personas/nuevos")
  revalidatePath("/personas/numeros-invalidos")
  revalidatePath("/seguimientos")
  revalidatePath("/seguimientos/nuevo")
  revalidatePath("/dashboard")

  if (personaId) {
    revalidatePath(`/personas/${personaId}`)
  }
}

export async function corregirYReactivarNumeroAction(formData: FormData) {
  const supabase = await verificarConsolidador()

  const personaId = String(formData.get("persona_id") ?? "").trim()
  const celularIngresado = String(formData.get("celular") ?? "").trim()

  if (!personaId) {
    throw new Error("No se pudo identificar a la persona.")
  }

  if (!celularIngresado) {
    throw new Error("Debes escribir un número de celular.")
  }

  const celular = celularIngresado.replace(/\D/g, "")

  if (celular.length !== 10) {
    throw new Error("El celular debe tener exactamente 10 dígitos.")
  }

  const { data: persona, error: personaError } = await supabase
    .from("personas")
    .select("id, nombre_completo")
    .eq("id", personaId)
    .single()

  if (personaError || !persona) {
    console.error("Error consultando persona para reactivar:", personaError)
    throw new Error("No se encontró la persona que deseas reactivar.")
  }

  const { error: actualizarError } = await supabase
    .from("personas")
    .update({
      celular,
      numero_invalido: false,
      etapa_actual: 1,
      estado_consolidacion: "pendiente",
      proximo_paso: "Etapa 1 - Primera llamada",
      ultima_gestion_fecha: null,
    })
    .eq("id", personaId)

  if (actualizarError) {
    console.error("Error reactivando número:", actualizarError)
    throw new Error(
      `No se pudo corregir el número: ${actualizarError.message}`
    )
  }

  revalidarPaginas(personaId)
  redirect(`/personas/${personaId}`)
}

export async function eliminarNumeroInvalidoAction(formData: FormData) {
  const supabase = await verificarConsolidador()

  const personaId = String(formData.get("persona_id") ?? "").trim()

  if (!personaId) {
    throw new Error("No se pudo identificar a la persona.")
  }

  const { data: persona, error: personaError } = await supabase
    .from("personas")
    .select("id, nombre_completo")
    .eq("id", personaId)
    .maybeSingle()

  if (personaError) {
    console.error("Error consultando persona para eliminar:", personaError)
    throw new Error(
      `No se pudo consultar la persona: ${personaError.message}`
    )
  }

  if (!persona) {
    revalidarPaginas()
    redirect("/personas/numeros-invalidos")
  }

  const { error: notificacionesError } = await supabase
    .from("notificaciones")
    .delete()
    .eq("persona_id", personaId)

  if (notificacionesError) {
    console.error("Error eliminando notificaciones:", notificacionesError)
    throw new Error(
      `No se pudieron eliminar las notificaciones: ${notificacionesError.message}`
    )
  }

  const { error: notasError } = await supabase
    .from("persona_notas")
    .delete()
    .eq("persona_id", personaId)

  if (notasError) {
    console.error("Error eliminando notas:", notasError)
    throw new Error(
      `No se pudieron eliminar las notas: ${notasError.message}`
    )
  }

  const { error: seguimientosError } = await supabase
    .from("seguimientos")
    .delete()
    .eq("persona_id", personaId)

  if (seguimientosError) {
    console.error("Error eliminando seguimientos:", seguimientosError)
    throw new Error(
      `No se pudieron eliminar los seguimientos: ${seguimientosError.message}`
    )
  }

  const { error: discipuladoError } = await supabase
    .from("discipulado")
    .delete()
    .eq("persona_id", personaId)

  if (discipuladoError) {
    console.error("Error eliminando discipulado:", discipuladoError)
    throw new Error(
      `No se pudo eliminar el avance de discipulado: ${discipuladoError.message}`
    )
  }

  const { data: personaEliminada, error: eliminarPersonaError } = await supabase
    .from("personas")
    .delete()
    .eq("id", personaId)
    .select("id")
    .maybeSingle()

  if (eliminarPersonaError) {
    console.error("Error eliminando persona:", eliminarPersonaError)
    throw new Error(
      `No se pudo eliminar a ${persona.nombre_completo}: ${eliminarPersonaError.message}`
    )
  }

  if (!personaEliminada) {
    throw new Error(
      "No se eliminó la persona. Revisa las políticas RLS de DELETE en la tabla personas."
    )
  }

  revalidarPaginas()
  redirect("/personas/numeros-invalidos")
}
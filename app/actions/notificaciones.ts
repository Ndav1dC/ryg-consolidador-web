"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function marcarNotificacionComoLeida(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notificaciones")
    .update({
      leida_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo marcar la notificación como leída.")
  }

  revalidatePath("/", "layout")
}

export async function marcarTodasComoLeidas() {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notificaciones")
    .update({
      leida_at: new Date().toISOString(),
    })
    .is("leida_at", null)

  if (error) {
    throw new Error("No se pudieron limpiar las notificaciones.")
  }

  revalidatePath("/", "layout")
}
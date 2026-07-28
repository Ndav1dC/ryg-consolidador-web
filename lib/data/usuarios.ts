import "server-only"
import { createClient } from "@/lib/supabase/server"

export async function getUsuarios() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("No se pudieron cargar los usuarios")
  }

  return data
}
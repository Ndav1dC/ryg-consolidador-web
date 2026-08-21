import "server-only"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type UserProfile = {
  id: string
  nombre: string
  roles: string[]
  email?: string | null
  auth_id?: string
  created_at?: string
  activo?: boolean
  rol?: string
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: profileData, error: profileError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (profileError || !profileData) {
    return null
  }

  return {
    authId: user.id,
    email: user.email ?? null,
    profile: {
      ...profileData,
      roles: profileData.roles || [
        profileData.rol || "consolidador",
      ],
    },
  }
}

export async function requireCurrentUserProfile() {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/login")
  }

  return currentUser
}
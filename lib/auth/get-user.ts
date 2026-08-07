import "server-only"
import { createClient } from "@/lib/supabase/server"

export type UserProfile = {
  id: string
  nombre: string
  roles: string[]
  email?: string | null
  auth_id?: string
  created_at?: string
  activo?: boolean
  rol?: string // Compatibilidad
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    return null
  }

  const authId = claimsData.claims.sub

  const { data: profileData, error: profileError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", authId)
    .limit(1)

  const profile = profileData?.[0] ?? null

  if (profileError || !profile) {
    return null
  }

  return {
    authId,
    email: typeof claimsData.claims.email === "string" ? claimsData.claims.email : null,
    profile: {
      ...profile,
      roles: profile.roles || [profile.rol || 'consolidador'],
    },
  }
}
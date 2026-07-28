import "server-only"
import { createClient } from "@/lib/supabase/server"

export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    return null
  }

  const authId = claimsData.claims.sub

  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", authId)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    authId,
    email: typeof claimsData.claims.email === "string" ? claimsData.claims.email : null,
    profile,
  }
}
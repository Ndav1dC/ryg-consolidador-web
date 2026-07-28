import "server-only"
import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth/get-user"

export async function requireAuth() {
  const current = await getCurrentUserProfile()

  if (!current) {
    redirect("/login")
  }

  return current
}

export async function requireRole(allowedRoles: string[]) {
  const current = await requireAuth()

  if (!allowedRoles.includes(current.profile.rol)) {
    redirect("/dashboard")
  }

  return current
}
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/guards"

export default async function DashboardPage() {
  await requireAuth()

  // Siempre enviar al listado de Nuevos
  redirect("/personas/nuevos")
}
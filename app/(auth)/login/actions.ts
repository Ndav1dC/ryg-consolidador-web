"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect("/login?error=Credenciales%20inv%C3%A1lidas")
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
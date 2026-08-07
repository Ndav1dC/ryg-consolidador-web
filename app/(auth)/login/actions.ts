"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !authData.user) {
    redirect("/login?error=Credenciales%20inv%C3%A1lidas")
  }

  // Obtener el usuario de la tabla usuarios
  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, nombre, roles")
    .eq("auth_id", authData.user.id)
    .single()

  if (usuarioError || !usuario) {
    redirect("/login?error=Usuario%20no%20encontrado")
  }

  // Guardar datos del usuario en cookies
  const userData = {
    id: usuario.id,
    nombre: usuario.nombre,
    roles: usuario.roles || ['consolidador'],
  }

  const cookieStore = await cookies()
  
  // Guardar datos del usuario
  cookieStore.set('user_data', JSON.stringify(userData), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  // Guardar rol activo por defecto (el primero)
  const rolDefault = usuario.roles && usuario.roles.length > 0 ? usuario.roles[0] : 'consolidador'
  cookieStore.set('rol_activo', rolDefault, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Limpiar cookies
  const cookieStore = await cookies()
  cookieStore.delete('user_data')
  cookieStore.delete('rol_activo')
  
  redirect("/login")
}
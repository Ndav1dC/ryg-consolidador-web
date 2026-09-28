"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

function obtenerRoles(usuario: {
  rol?: string | null
  roles?: string[] | null
}) {
  const roles = Array.isArray(usuario.roles)
    ? usuario.roles
        .filter(
          (rol): rol is string =>
            typeof rol === "string" &&
            rol.trim().length > 0
        )
        .map((rol) => rol.trim())
    : []

  if (roles.length > 0) {
    return Array.from(new Set(roles))
  }

  if (usuario.rol) {
    return [usuario.rol]
  }

  return ["consolidador"]
}

function obtenerRutaInicial(roles: string[]) {
  if (roles.includes("admin")) {
    return "/admin"
  }

  return "/dashboard"
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email = String(
    formData.get("email") || ""
  ).trim()

  const password = String(
    formData.get("password") || ""
  )

  if (!email || !password) {
    redirect(
      "/login?error=Debes%20completar%20todos%20los%20campos"
    )
  }

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    redirect(
      "/login?error=Credenciales%20inv%C3%A1lidas"
    )
  }

  const {
    data: usuario,
    error: usuarioError,
  } = await supabase
    .from("usuarios")
    .select("id, nombre, rol, roles")
    .eq("auth_id", authData.user.id)
    .maybeSingle()

  if (usuarioError || !usuario) {
    await supabase.auth.signOut()

    redirect(
      "/login?error=Usuario%20no%20encontrado"
    )
  }

  const roles = obtenerRoles(usuario)
  const rutaInicial = obtenerRutaInicial(roles)

  const userData = {
    id: usuario.id,
    nombre: usuario.nombre || "Usuario",
    roles,
  }

  const cookieStore = await cookies()

  cookieStore.set(
    "user_data",
    JSON.stringify(userData),
    {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }
  )

  cookieStore.set(
    "rol_activo",
    roles[0] || "consolidador",
    {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }
  )

  redirect(rutaInicial)
}

export async function logoutAction() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  const cookieStore = await cookies()

  cookieStore.delete("user_data")
  cookieStore.delete("rol_activo")

  redirect("/login")
}
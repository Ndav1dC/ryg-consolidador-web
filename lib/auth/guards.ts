import "server-only"
import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "./get-user"

export async function requireAuth() {
  const user = await getCurrentUserProfile()
  
  if (!user) {
    redirect("/login")
  }
  
  return user
}

export async function requireRole(role: string | string[]) {
  const user = await getCurrentUserProfile()
  
  if (!user) {
    redirect("/login")
  }
  
  const roles = user.profile.roles || []
  
  // Si es admin, tiene acceso a todo
  if (roles.includes('admin')) {
    return user
  }
  
  // Verificar si tiene el rol requerido
  if (Array.isArray(role)) {
    if (!role.some(r => roles.includes(r))) {
      redirect("/dashboard")
    }
  } else {
    if (!roles.includes(role)) {
      redirect("/dashboard")
    }
  }
  
  return user
}

// Función para obtener el rol activo (cliente)
export function getRolActivo(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rol_activo') || 'consolidador'
  }
  return 'consolidador'
}

// Función para obtener roles del usuario
export function getRolesUsuario(roles: string[]): string[] {
  return roles || []
}

// Verificar si el usuario tiene un rol específico
export function hasRole(roles: string[], role: string): boolean {
  return roles.includes(role)
}

// Verificar si el usuario tiene múltiples roles
export function hasMultipleRoles(roles: string[]): boolean {
  return roles.length > 1
}
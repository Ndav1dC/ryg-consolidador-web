"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { Sidebar } from "@/components/dashboard/sidebar"
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher"

type Props = {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userNombre, setUserNombre] = useState("Usuario")
  const [roles, setRoles] = useState<string[]>([])
  const [rolActivo, setRolActivo] = useState("consolidador")

  useEffect(() => {
    // Cargar datos del usuario desde cookies
    const loadUserData = () => {
      try {
        // Función para leer cookies
        const getCookie = (name: string) => {
          const cookies = document.cookie.split(';')
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.startsWith(name + '=')) {
              return cookie.substring(name.length + 1)
            }
          }
          return null
        }

        // Primero intentar leer de la cookie user_data
        let userDataCookie = getCookie('user_data')
        
        if (userDataCookie) {
          try {
            const userData = JSON.parse(decodeURIComponent(userDataCookie))
            setUserNombre(userData.nombre || "Usuario")
            setRoles(userData.roles || ['consolidador'])
          } catch (e) {
            console.error("Error parseando user_data:", e)
          }
        }

        // Leer rol activo de cookie
        const rolCookie = getCookie('rol_activo')
        if (rolCookie) {
          setRolActivo(rolCookie)
        } else {
          // Si no hay rol en cookie, usar el primero de los roles
          try {
            const userData = JSON.parse(decodeURIComponent(userDataCookie || '{}'))
            if (userData.roles && userData.roles.length > 0) {
              setRolActivo(userData.roles[0])
            }
          } catch (e) {
            // Si todo falla, usar consolidador por defecto
            setRolActivo('consolidador')
          }
        }
      } catch (error) {
        console.error("Error cargando datos del usuario:", error)
      }
      setMounted(true)
    }

    loadUserData()
  }, [])

  const handleRolChange = (nuevoRol: string) => {
    setRolActivo(nuevoRol)
    // Guardar en cookie
    document.cookie = `rol_activo=${nuevoRol}; path=/; max-age=${60 * 60 * 24 * 7}`
    // Recargar la página para aplicar filtros
    router.refresh()
  }

  // Mostrar un loader mientras se cargan los datos
  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[288px_minmax(0,1fr)]">
        <Sidebar 
          userNombre={userNombre}
          userRol={rolActivo}
          roles={roles}
        />

        <div className="min-w-0 pb-20 lg:pb-0">
          {/* Topbar con selector de roles */}
          <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">
                {rolActivo === 'consolidador' && 'Modo Consolidador'}
                {rolActivo === 'lider_casa' && 'Modo Líder de Casa'}
                {rolActivo === 'admin' && 'Modo Administrador'}
              </span>
            </div>
            <RoleSwitcher 
              roles={roles} 
              rolActual={rolActivo}
              onRolChange={handleRolChange}
            />
          </div>
          
          {children}
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
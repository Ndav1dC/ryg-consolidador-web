import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const RUTAS_PUBLICAS = [
  "/login",
  "/auth",
  "/api/auth",
]

function esRutaPublica(pathname: string) {
  return RUTAS_PUBLICAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  )
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const esPublica = esRutaPublica(pathname)

  /*
   * Si no hay sesión y la ruta no es pública,
   * enviar al inicio de sesión.
   */
  if (!user && !esPublica) {
    const loginUrl = request.nextUrl.clone()

    loginUrl.pathname = "/login"
    loginUrl.searchParams.set(
      "redirectTo",
      `${pathname}${request.nextUrl.search}`
    )

    return NextResponse.redirect(loginUrl)
  }

  /*
   * Si ya inició sesión e intenta entrar al login,
   * llevarlo a las personas asignadas.
   */
  if (user && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/personas"

    return NextResponse.redirect(dashboardUrl)
  }

  return response
}
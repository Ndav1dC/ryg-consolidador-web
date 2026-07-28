import Image from "next/image"
import { loginAction } from "./actions"

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const error = params.error

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center">
          <Image
            src="/brand/logo-icono.png"
            alt="Logo Reino y Gloria"
            width={110}
            height={110}
            priority
            className="h-auto w-auto"
          />
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold text-stone-900">Ingresar</h1>
          <p className="mt-2 text-sm text-stone-600">
            Accede al panel de consolidación.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-stone-800"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-stone-800"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-700"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  )
}
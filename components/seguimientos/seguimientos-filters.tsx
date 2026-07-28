"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

type Props = {
  defaultQ?: string
  defaultTipo?: string
  defaultEstadoPersona?: string
}

export function SeguimientosFilters({
  defaultQ = "",
  defaultTipo = "",
  defaultEstadoPersona = "",
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value.trim()) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    })
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm lg:grid-cols-3">
      <div>
        <label htmlFor="q" className="mb-2 block text-sm font-medium text-stone-700">
          Buscar
        </label>
        <input
          id="q"
          type="text"
          defaultValue={defaultQ}
          placeholder="Nombre, celular, barrio..."
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label htmlFor="tipo" className="mb-2 block text-sm font-medium text-stone-700">
          Tipo
        </label>
        <select
          id="tipo"
          defaultValue={defaultTipo}
          onChange={(e) => updateParam("tipo", e.target.value)}
          className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
        >
          <option value="">Todos</option>
          <option value="llamada">Llamada</option>
          <option value="visita">Visita</option>
          <option value="casita">Casita</option>
          <option value="discipulado">Discipulado</option>
          <option value="ministerio">Ministerio</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="estadoPersona"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Estado de persona
        </label>
        <select
          id="estadoPersona"
          defaultValue={defaultEstadoPersona}
          onChange={(e) => updateParam("estadoPersona", e.target.value)}
          className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
        >
          <option value="">Todos</option>
          <option value="nuevo">Nuevo</option>
          <option value="activo">Activo</option>
          <option value="pendiente">Pendiente</option>
          <option value="consolidado">Consolidado</option>
        </select>
      </div>

      {isPending ? (
        <p className="text-sm text-stone-500 lg:col-span-3">Actualizando filtros...</p>
      ) : null}
    </div>
  )
}
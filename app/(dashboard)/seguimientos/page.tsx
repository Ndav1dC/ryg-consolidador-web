import Link from "next/link"
import { Topbar } from "@/components/dashboard/topbar"
import { SeguimientosFilters } from "@/components/seguimientos/seguimientos-filters"
import { SeguimientosTable } from "@/components/seguimientos/seguimientos-table"
import { getSeguimientos } from "@/lib/data/seguimientos"

type Props = {
  searchParams: Promise<{
    q?: string
    tipo?: string
    estadoPersona?: string
  }>
}

export default async function SeguimientosPage({ searchParams }: Props) {
  const params = await searchParams

  const q = params.q?.trim() ?? ""
  const tipo = params.tipo?.trim() ?? ""
  const estadoPersona = params.estadoPersona?.trim() ?? ""

  const items = await getSeguimientos({ q, tipo, estadoPersona })

  return (
    <main>
      <Topbar
        title="Seguimientos"
        subtitle="Consulta, filtra y revisa la gestión realizada."
      />

      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-600 shadow-sm">
              Aquí puedes revisar llamadas, visitas, discipulados y gestiones programadas.
            </div>

            <Link
              href="/seguimientos/nuevo"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-700"
            >
              + Nuevo seguimiento
            </Link>
          </div>

          <SeguimientosFilters
            defaultQ={q}
            defaultTipo={tipo}
            defaultEstadoPersona={estadoPersona}
          />

          <SeguimientosTable items={items} />
        </div>
      </section>
    </main>
  )
}
import Link from "next/link"

type AdminAlert = {
  id: string
  tipo: "critica" | "atencion" | "info"
  titulo: string
  descripcion: string
  cantidad: number
  href: string
}

type AdminAlertsProps = {
  alertas: AdminAlert[]
}

const estilosPorTipo = {
  critica: {
    etiqueta: "Crítica",
    contenedor: "border-red-100 bg-red-50/50",
    icono: "bg-red-100 text-red-700",
    contador: "bg-red-100 text-red-700",
    texto: "text-red-700",
  },
  atencion: {
    etiqueta: "Atención",
    contenedor: "border-amber-100 bg-amber-50/50",
    icono: "bg-amber-100 text-amber-700",
    contador: "bg-amber-100 text-amber-700",
    texto: "text-amber-700",
  },
  info: {
    etiqueta: "Al día",
    contenedor: "border-emerald-100 bg-emerald-50/50",
    icono: "bg-emerald-100 text-emerald-700",
    contador: "bg-emerald-100 text-emerald-700",
    texto: "text-emerald-700",
  },
}

function IconoAlerta({
  tipo,
}: {
  tipo: "critica" | "atencion" | "info"
}) {
  if (tipo === "critica") {
    return <span aria-hidden="true">!</span>
  }

  if (tipo === "atencion") {
    return <span aria-hidden="true">!</span>
  }

  return <span aria-hidden="true">✓</span>
}

export function AdminAlerts({ alertas }: AdminAlertsProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-semibold text-stone-900">
          Atención inmediata
        </p>

        <p className="mt-1 text-sm text-stone-500">
          Casos que requieren revisión o seguimiento.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {alertas.map((alerta) => {
          const estilos = estilosPorTipo[alerta.tipo]

          return (
            <Link
              key={alerta.id}
              href={alerta.href}
              className={`group flex items-center gap-3 rounded-2xl border p-3 transition hover:shadow-sm ${estilos.contenedor}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${estilos.icono}`}
              >
                <IconoAlerta tipo={alerta.tipo} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900">
                    {alerta.titulo}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${estilos.contador}`}
                  >
                    {alerta.cantidad}
                  </span>
                </span>

                <span className="mt-0.5 block text-xs leading-5 text-stone-600">
                  {alerta.descripcion}
                </span>
              </span>

              <span
                className={`shrink-0 text-base font-bold transition group-hover:translate-x-0.5 ${estilos.texto}`}
                aria-hidden="true"
              >
                ›
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
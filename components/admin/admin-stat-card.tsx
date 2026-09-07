type AdminStatCardProps = {
  titulo: string
  valor: number
  descripcion: string
  color?: "amber" | "green" | "red" | "blue"
}

const estilosPorColor = {
  amber: {
    borde: "border-amber-200",
    icono: "bg-amber-100 text-amber-700",
    detalle: "text-amber-700",
  },
  green: {
    borde: "border-emerald-200",
    icono: "bg-emerald-100 text-emerald-700",
    detalle: "text-emerald-700",
  },
  red: {
    borde: "border-red-200",
    icono: "bg-red-100 text-red-700",
    detalle: "text-red-700",
  },
  blue: {
    borde: "border-sky-200",
    icono: "bg-sky-100 text-sky-700",
    detalle: "text-sky-700",
  },
}

function IconoTarjeta({
  color,
}: {
  color: "amber" | "green" | "red" | "blue"
}) {
  if (color === "green") {
    return <span aria-hidden="true">✓</span>
  }

  if (color === "red") {
    return <span aria-hidden="true">!</span>
  }

  if (color === "blue") {
    return <span aria-hidden="true">↗</span>
  }

  return <span aria-hidden="true">✦</span>
}

export function AdminStatCard({
  titulo,
  valor,
  descripcion,
  color = "amber",
}: AdminStatCardProps) {
  const estilos = estilosPorColor[color]

  return (
    <article
      className={`rounded-3xl border bg-white p-5 shadow-sm ${estilos.borde}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-600">{titulo}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            {valor}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${estilos.icono}`}
        >
          <IconoTarjeta color={color} />
        </div>
      </div>

      <p
        className={`mt-4 border-t border-stone-100 pt-3 text-xs leading-5 ${estilos.detalle}`}
      >
        {descripcion}
      </p>
    </article>
  )
}
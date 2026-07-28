type StatusBadgeProps = {
  status: string | null
}

const styles: Record<string, string> = {
  nuevo: "bg-amber-100 text-amber-800",
  activo: "bg-emerald-100 text-emerald-700",
  pendiente: "bg-orange-100 text-orange-700",
  discipulado: "bg-sky-100 text-sky-700",
  ministerio: "bg-fuchsia-100 text-fuchsia-700",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status?.trim() || "Sin estado"
  const key = label.toLowerCase()
  const className = styles[key] ?? "bg-stone-100 text-stone-700"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
import { BrandLogo } from "./brand-logo"

type TopbarProps = {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="min-w-0">
          <div className="lg:hidden">
            <BrandLogo compact />
          </div>

          <h1 className="mt-3 text-2xl font-bold text-stone-900 lg:mt-0">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
          )}
        </div>

        {/* Buscador solo en desktop */}
        <div className="hidden w-full max-w-md lg:block">
          <input
            type="text"
            placeholder="Buscar persona..."
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
          />
        </div>

        {/* Acciones: solo campana (notificaciones), sin botón + */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
            // Aquí luego puedes abrir un panel/modal o navegar a /notificaciones
          >
            🔔
          </button>
        </div>
      </div>
    </header>
  )
}
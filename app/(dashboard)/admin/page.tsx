import { getPersonas } from "@/lib/personas"

export default async function AdminPage() {
  const personas = await getPersonas()

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-stone-900">
          Panel administrativo
        </h1>
        <p className="mt-2 text-stone-600">
          Vista global del proceso de consolidación.
        </p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Persona</th>
                  <th className="px-4 py-3 font-semibold">Celular</th>
                  <th className="px-4 py-3 font-semibold">Barrio</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Etapa</th>
                  <th className="px-4 py-3 font-semibold">Última gestión</th>
                  <th className="px-4 py-3 font-semibold">Próximo paso</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((persona) => (
                  <tr key={persona.id} className="border-t border-stone-200">
                    <td className="px-4 py-3">{persona.nombre_completo}</td>
                    <td className="px-4 py-3">{persona.celular || "—"}</td>
                    <td className="px-4 py-3">{persona.barrio || "—"}</td>
                    <td className="px-4 py-3">{persona.estado_consolidacion || "—"}</td>
                    <td className="px-4 py-3">{persona.etapa_actual || "—"}</td>
                    <td className="px-4 py-3">{persona.ultima_gestion_fecha || "—"}</td>
                    <td className="px-4 py-3">{persona.proximo_paso || "—"}</td>
                  </tr>
                ))}

                {personas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                      No hay personas para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
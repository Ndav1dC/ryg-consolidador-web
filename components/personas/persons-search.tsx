"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition } from "react"

export function PersonsSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value.trim()) {
      params.set("q", value)
    } else {
      params.delete("q")
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar persona..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-amber-500"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
        {isPending ? "…" : "⌕"}
      </span>
    </div>
  )
}
"use client"

import { useFormStatus } from "react-dom"

type SubmitButtonProps = {
  label?: string
}

export function SubmitButton({
  label = "Guardar seguimiento",
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : label}
    </button>
  )
}
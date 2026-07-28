import Image from "next/image"
import Link from "next/link"

type BrandLogoProps = {
  compact?: boolean
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <Image
        src="/brand/logo-icono.png"
        alt="Logo Reino y Gloria"
        width={compact ? 40 : 56}
        height={compact ? 40 : 56}
        priority
        className="h-auto w-auto"
      />

      {!compact && (
        <Image
          src="/brand/logo-completo.png"
          alt="Reino y Gloria Ministerio Apostólico Internacional"
          width={150}
          height={52}
          priority
          className="h-auto w-auto"
        />
      )}
    </Link>
  )
}
import { readFile } from "node:fs/promises"
import path from "node:path"

import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib"

import { getReporteAnual } from "@/lib/data/reportes-anuales"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NEGRO = rgb(0.14, 0.13, 0.12)
const GRIS = rgb(0.43, 0.41, 0.39)
const BORDE = rgb(0.89, 0.87, 0.84)
const FONDO = rgb(0.97, 0.96, 0.94)
const DORADO = rgb(0.71, 0.33, 0.04)
const AZUL = rgb(0.29, 0.35, 0.42)

const ANCHO = 595
const ALTO = 842
const MARGEN = 44

function anioActualColombia() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      year: "numeric",
    }).format(new Date())
  )
}

function fechaGeneracion() {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const actual = anioActualColombia()
  const valorAnio = url.searchParams.get("anio")
  const anio = valorAnio
    ? Number(valorAnio)
    : actual

  if (
    !Number.isInteger(anio) ||
    anio < 2026 ||
    anio > actual
  ) {
    return new Response(
      "El año solicitado no es válido.",
      { status: 400 }
    )
  }

  // getReporteAnual comprueba la sesión y el rol admin.
  // Lo llamamos fuera del bloque de generación para no
  // interceptar las redirecciones de autenticación.
  const reporte = await getReporteAnual(anio)

  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(
    StandardFonts.Helvetica
  )
  const negrita = await pdf.embedFont(
    StandardFonts.HelveticaBold
  )

  const logoPath = path.join(
    process.cwd(),
    "public",
    "brand",
    "logo-completo.png"
  )

  const logoBytes = await readFile(logoPath)
  const logo = await pdf.embedPng(logoBytes)

  const tamanoLogo = logo.scale(1)
  const factorLogo = Math.min(
    150 / tamanoLogo.width,
    58 / tamanoLogo.height
  )

  const logoAncho = tamanoLogo.width * factorLogo
  const logoAlto = tamanoLogo.height * factorLogo

  function encabezado(
    pagina: ReturnType<typeof pdf.addPage>,
    subtitulo: string
  ) {
    pagina.drawImage(logo, {
      x: MARGEN,
      y: ALTO - 42 - logoAlto,
      width: logoAncho,
      height: logoAlto,
    })

    pagina.drawText(
      "REPORTE DE CONSOLIDACION",
      {
        x: MARGEN,
        y: ALTO - 124,
        size: 19,
        font: negrita,
        color: NEGRO,
      }
    )

    pagina.drawText(subtitulo, {
      x: MARGEN,
      y: ALTO - 145,
      size: 10,
      font: regular,
      color: GRIS,
    })

    pagina.drawLine({
      start: {
        x: MARGEN,
        y: ALTO - 160,
      },
      end: {
        x: ANCHO - MARGEN,
        y: ALTO - 160,
      },
      thickness: 1,
      color: BORDE,
    })
  }

  function pie(
    pagina: ReturnType<typeof pdf.addPage>,
    numero: number
  ) {
    pagina.drawLine({
      start: { x: MARGEN, y: 46 },
      end: { x: ANCHO - MARGEN, y: 46 },
      thickness: 1,
      color: BORDE,
    })

    pagina.drawText(
      `Reino y Gloria  |  ${anio}  |  Pagina ${numero} de 2`,
      {
        x: MARGEN,
        y: 30,
        size: 8,
        font: regular,
        color: GRIS,
      }
    )
  }

  const pagina1 = pdf.addPage([ANCHO, ALTO])

  encabezado(
    pagina1,
    `Informe anual ${anio}  |  Generado el ${fechaGeneracion()}`
  )

  pagina1.drawText(
    "Resumen del periodo",
    {
      x: MARGEN,
      y: 645,
      size: 14,
      font: negrita,
      color: NEGRO,
    }
  )

  const tarjetas = [
    {
      titulo: "Personas registradas",
      valor: reporte.totalPersonasRegistradas,
      x: MARGEN,
    },
    {
      titulo: "Seguimientos registrados",
      valor: reporte.totalSeguimientosRegistrados,
      x: 305,
    },
  ]

  for (const tarjeta of tarjetas) {
    pagina1.drawRectangle({
      x: tarjeta.x,
      y: 559,
      width: 246,
      height: 70,
      color: FONDO,
      borderColor: BORDE,
      borderWidth: 1,
    })

    pagina1.drawText(tarjeta.titulo, {
      x: tarjeta.x + 14,
      y: 604,
      size: 10,
      font: regular,
      color: GRIS,
    })

    pagina1.drawText(
      tarjeta.valor.toLocaleString("es-CO"),
      {
        x: tarjeta.x + 14,
        y: 573,
        size: 24,
        font: negrita,
        color: NEGRO,
      }
    )
  }

  pagina1.drawText(
    "Actividad mes a mes",
    {
      x: MARGEN,
      y: 526,
      size: 14,
      font: negrita,
      color: NEGRO,
    }
  )

  pagina1.drawRectangle({
    x: MARGEN,
    y: 481,
    width: ANCHO - 2 * MARGEN,
    height: 30,
    color: FONDO,
  })

  pagina1.drawText("Mes", {
    x: 56,
    y: 491,
    size: 9,
    font: negrita,
    color: NEGRO,
  })

  pagina1.drawText(
    "Personas registradas",
    {
      x: 210,
      y: 491,
      size: 9,
      font: negrita,
      color: NEGRO,
    }
  )

  pagina1.drawText(
    "Seguimientos",
    {
      x: 412,
      y: 491,
      size: 9,
      font: negrita,
      color: NEGRO,
    }
  )

  reporte.meses.forEach((mes, indice) => {
    const y = 461 - indice * 27

    if (indice % 2 === 1) {
      pagina1.drawRectangle({
        x: MARGEN,
        y: y - 8,
        width: ANCHO - 2 * MARGEN,
        height: 26,
        color: FONDO,
      })
    }

    pagina1.drawText(mes.nombre, {
      x: 56,
      y,
      size: 9,
      font: regular,
      color: NEGRO,
    })

    pagina1.drawText(
      String(mes.personasRegistradas),
      {
        x: 267,
        y,
        size: 9,
        font: regular,
        color: NEGRO,
      }
    )

    pagina1.drawText(
      String(mes.seguimientosRegistrados),
      {
        x: 444,
        y,
        size: 9,
        font: regular,
        color: NEGRO,
      }
    )
  })

  pagina1.drawLine({
    start: { x: MARGEN, y: 138 },
    end: { x: ANCHO - MARGEN, y: 138 },
    thickness: 1,
    color: BORDE,
  })

  pagina1.drawText(
    "TOTAL ANUAL",
    {
      x: 56,
      y: 120,
      size: 10,
      font: negrita,
      color: NEGRO,
    }
  )

  pagina1.drawText(
    String(reporte.totalPersonasRegistradas),
    {
      x: 267,
      y: 120,
      size: 10,
      font: negrita,
      color: NEGRO,
    }
  )

  pagina1.drawText(
    String(reporte.totalSeguimientosRegistrados),
    {
      x: 444,
      y: 120,
      size: 10,
      font: negrita,
      color: NEGRO,
    }
  )

  pie(pagina1, 1)

  const pagina2 = pdf.addPage([ANCHO, ALTO])

  encabezado(
    pagina2,
    `Evolucion mensual de la actividad  |  ${anio}`
  )

  pagina2.drawText(
    "Personas registradas",
    {
      x: MARGEN,
      y: 645,
      size: 10,
      font: regular,
      color: DORADO,
    }
  )

  pagina2.drawText(
    "Seguimientos registrados",
    {
      x: 210,
      y: 645,
      size: 10,
      font: regular,
      color: AZUL,
    }
  )

  const maximo = Math.max(
    1,
    ...reporte.meses.flatMap((mes) => [
      mes.personasRegistradas,
      mes.seguimientosRegistrados,
    ])
  )

  const baseY = 260
  const altoMaximo = 300
  const inicioX = 58
  const espacioMes = 41

  pagina2.drawLine({
    start: { x: MARGEN, y: baseY },
    end: { x: ANCHO - MARGEN, y: baseY },
    thickness: 1,
    color: BORDE,
  })

  reporte.meses.forEach((mes, indice) => {
    const x = inicioX + indice * espacioMes

    const altoPersonas =
      (mes.personasRegistradas / maximo) *
      altoMaximo

    const altoSeguimientos =
      (mes.seguimientosRegistrados / maximo) *
      altoMaximo

    if (altoPersonas > 0) {
      pagina2.drawRectangle({
        x,
        y: baseY,
        width: 14,
        height: altoPersonas,
        color: DORADO,
      })
    }

    if (altoSeguimientos > 0) {
      pagina2.drawRectangle({
        x: x + 15,
        y: baseY,
        width: 14,
        height: altoSeguimientos,
        color: AZUL,
      })
    }

    pagina2.drawText(
      mes.nombre.slice(0, 3),
      {
        x: x + 1,
        y: baseY - 17,
        size: 8,
        font: regular,
        color: GRIS,
      }
    )
  })

  pagina2.drawText(
    "Como leer este informe",
    {
      x: MARGEN,
      y: 183,
      size: 14,
      font: negrita,
      color: NEGRO,
    }
  )

  const notas = [
    "Personas registradas: altas segun personas.created_at.",
    "Seguimientos registrados: gestiones segun seguimientos.fecha.",
    "Los meses se calculan con horario de Colombia.",
    "Una persona puede tener varios seguimientos.",
    "Este informe contiene solo cifras agregadas.",
  ]

  notas.forEach((nota, indice) => {
    pagina2.drawText(nota, {
      x: MARGEN,
      y: 158 - indice * 17,
      size: 9,
      font: regular,
      color: GRIS,
    })
  })

  pie(pagina2, 2)

  const pdfBytes = await pdf.save()

  const cuerpo = new ArrayBuffer(
    pdfBytes.byteLength
  )

  new Uint8Array(cuerpo).set(pdfBytes)

  return new Response(cuerpo, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        `attachment; filename="reporte-consolidacion-${anio}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  })
}
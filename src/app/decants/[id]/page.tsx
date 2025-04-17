// src/app/decants/[id]/page.tsx
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface Decant {
  id: string
  nombre: string
  codigoQR: string
  cantidadDisponible: number
  urlImagen: string | null
  estado: number
  fechaCreacion: string
}

export default async function DecantPage({
  params,
  searchParams,               // ← lo añadimos aquí
}: {
  params: { id: string }
  searchParams: Record<string, string | string[]>  // o `ParsedUrlQuery` si prefieres
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Decants/${params.id}`,
    { cache: 'no-store' }
  )
  if (!res.ok) notFound()
  const decant: Decant = await res.json()

  return (
    <main className="pt-32 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {decant.nombre}
        </h1>
        {decant.urlImagen && (
          <Image
            src={decant.urlImagen}
            alt={decant.nombre}
            width={300}
            height={300}
            className="rounded mb-4 object-cover"
          />
        )}
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          <strong>Cantidad disponible:</strong> {decant.cantidadDisponible}
        </p>
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          <strong>Estado:</strong> {decant.estado === 1 ? 'Activo' : 'Inactivo'}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Creado el:</strong> {new Date(decant.fechaCreacion).toLocaleString()}
        </p>
      </div>
    </main>
  )
}

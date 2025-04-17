// src/app/decants/[id]/page.tsx
import Image from 'next/image'
import { notFound } from 'next/navigation'
import SocialMedia from '@/app/components/SocialMedia'

interface Decant {
  id: number
  nombre: string
  codigoQR: string
  cantidadDisponible: number
  urlImagen: string | null
  estado: number
  fechaCreacion: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DecantPage({ params }: PageProps) {
  const { id } = await params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Decants/${id}`,
    { cache: 'no-store' }
  )
  if (!res.ok) notFound()
  const decant: Decant = await res.json()

  return (
    <main className="flex justify-center items-start bg-gray-100 dark:bg-gray-900 min-h-screen pt-32 px-4 pb-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {decant.nombre}
          </h1>

          {/* Imagen completa, centrada y manteniendo proporción */}
          {decant.urlImagen && (
            <div className="w-full h-64 sm:h-80 mb-6 relative">
              <Image
                src={decant.urlImagen}
                alt={decant.nombre}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          )}

          {/* Datos */}
          <div className="w-full grid grid-cols-1 gap-4 text-center text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold">Tamaño:</p>
              <p className="text-xl">{decant.cantidadDisponible} ML</p>
            </div>
            {/* Puedes descomentar los siguientes si los necesitas */}
            {/* 
            <div>
              <p className="font-semibold">Estado</p>
              <p className="text-xl">
                {decant.estado === 1 ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div>
              <p className="font-semibold">Creado el</p>
              <p className="text-lg">
                {new Date(decant.fechaCreacion).toLocaleString()}
              </p>
            </div>
            */}
          </div>

          {/* Badge “Producto Certificado” */}
          <div className="mt-8">
            <span className="inline-block bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 rounded-full px-4 py-1 font-semibold">
              ¡Producto Certificado!
            </span>
          </div>

          {/* Social Media dentro de la carta */}
          <div className="mt-6 w-full">
            <SocialMedia />
          </div>
        </div>
      </div>
    </main>
  )
}

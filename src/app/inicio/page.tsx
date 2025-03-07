'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';

const Inicio: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'inicio' | 'nosotros'>('inicio');

  return (
    <>
      {/* Navbar principal */}
      <Navbar />

      {/* Segundo navbar fijo para navegación de secciones con fondo consistente */}
      <div className="fixed top-16 left-0 w-full bg-gray-800 shadow z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-center space-x-4">
          <Link 
            href="/catalogo" 
            className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white border border-transparent hover:border-white"
          >
            Catálogo
          </Link>
          <button
            onClick={() => setActiveSection('inicio')}
            className={`px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white ${
              activeSection === 'inicio'
                ? 'border border-white'
                : 'border border-transparent hover:border-white'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveSection('nosotros')}
            className={`px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white ${
              activeSection === 'nosotros'
                ? 'border border-white'
                : 'border border-transparent hover:border-white'
            }`}
          >
            Nosotros
          </button>
        </div>
      </div>

      {/* Contenido principal con fondo consistente */}
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        {activeSection === 'inicio' && (
          <div className="max-w-4xl mx-auto text-center">
            <Image 
              src="/logo.png" 
              alt="Logo WebParfum" 
              width={128}
              height={128}
              className="mx-auto mb-4 w-32 h-32 object-contain" 
            />
            <h1 className="text-4xl font-bold text-white">Bienvenido a WebParfum</h1>
            <p className="mt-4 text-lg text-white">
              Descubre nuestra exclusiva colección de perfumes importados, pensados para resaltar tu esencia.
            </p>
          </div>
        )}
        {activeSection === 'nosotros' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-white">Contacto y Nosotros</h1>
            <p className="mt-4 text-lg text-center text-white">
              Conoce nuestra historia, nuestros valores y cómo puedes contactarnos para obtener más información.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-2">Nuestra Historia</h2>
                <p className="text-gray-700">
                  WebParfum nació con la pasión por la perfumería y la búsqueda de calidad. Descubre nuestra trayectoria y compromiso con la excelencia.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-2">Contacto</h2>
                <p className="text-gray-700">
                  Teléfono: (123) 456-7890<br />
                  Email: contacto@webparfum.com<br />
                  Dirección: Av. Ejemplo 123, Ciudad, País.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Inicio;

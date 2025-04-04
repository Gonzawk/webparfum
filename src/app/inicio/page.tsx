'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';
import SocialMedia from '@/app/components/SocialMedia';

const Inicio: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'inicio' | 'nosotros'>('inicio');

  return (
    <>
      {/* Navbar principal */}
      <Navbar />

      {/* Segundo navbar fijo para navegación de secciones */}
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

      {/* Contenido principal */}
      <div className="min-h-screen bg-gray-900">
        {activeSection === 'inicio' && (
          <div className="relative w-full h-screen">
            {/* Imagen de fondo para escritorio */}
            <div className="hidden md:block absolute inset-0">
              <Image 
                src="/header-image1.jpg"  // Imagen para escritorio (ideal ~2500x1500)
                alt="Fondo de Perfumes - Escritorio"
                fill
                className="object-cover"
              />
            </div>
            {/* Imagen de fondo para móvil */}
            <div className="block md:hidden absolute inset-0">
              <Image 
                src="/header-image-mobile.png"  // Imagen para móvil (ideal ~1080x1920)
                alt="Fondo de Perfumes - Móvil"
                fill
                className="object-cover"
              />
            </div>
            {/* Contenido superpuesto centrado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-slideDown">
                Bienvenido a Perfumes Importados
              </h1>
              {/* Versión escritorio: typewriter */}
              <div className="hidden md:block">
                <p className="text-2xl md:text-3xl text-white animate-typewriter overflow-hidden whitespace-nowrap border-r-4 border-white">
                  Descubre nuestra exclusiva colección de fragancias para resaltar tu esencia.
                </p>
              </div>
              {/* Versión móvil: fadeIn, con wrapping normal */}
              <div className="block md:hidden">
                <p className="text-2xl md:text-3xl text-white animate-fadeIn whitespace-normal">
                  Descubre nuestra exclusiva colección de fragancias para resaltar tu esencia.
                </p>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'nosotros' && (
          <div className="relative w-full min-h-screen">
            {/* Reutilizamos la misma imagen de fondo */}
            <div className="hidden md:block absolute inset-0">
              <Image 
                src="/header-image1.jpg" 
                alt="Fondo de Perfumes - Escritorio"
                fill
                className="object-cover"
              />
            </div>
            <div className="block md:hidden absolute inset-0">
              <Image 
                src="/header-image-mobile.png" 
                alt="Fondo de Perfumes - Móvil"
                fill
                className="object-cover"
              />
            </div>
            {/* Contenido de la sección Nosotros */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
              <div className="mb-15 md:mb-30"></div>
              <div className="mb-4">
                <SocialMedia />
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-3xl border border-gray-200 mx-auto">
                <h2 className="text-3xl font-semibold mb-4 text-gray-800">Información de Contacto</h2>
                <p className="text-lg text-gray-800 mb-2"><strong>📞 Teléfono:</strong> +54 9 3832 413394</p>
                <p className="text-lg text-gray-800 mb-2 break-words">
                  <strong>📧 Email:</strong> <a href="mailto:perfumes.importados.777@perfumesadoss.com" className="text-blue-600 hover:underline break-words">perfumes.importados.777@perfumesadoss.com</a>
                </p>
                <p className="text-lg text-gray-800 mb-4"><strong>📍 Dirección:</strong> Corrientes 463, Centro - Córdoba, Argentina.</p>
                <h2 className="text-3xl font-semibold mt-6 mb-4 text-gray-800">Ubicación</h2>
                <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border border-gray-300">
  <iframe
    className="w-full h-full"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d869.9949095058355!2d-65.06336683035578!3d-29.282926628725345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942f823a513b68c5%3A0xfa310124fa0416b!2sRam%C3%B3n%20San%20Castillo%20280%2C%20K5260%20Recreo%2C%20Catamarca!5e0!3m2!1ses!2sar!4v1743783126632!5m2!1ses!2sar"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 1s ease-out forwards;
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-typewriter {
          animation: typewriter 3s steps(40) 1s 1 normal both;
          overflow: hidden;
          white-space: nowrap;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Inicio;

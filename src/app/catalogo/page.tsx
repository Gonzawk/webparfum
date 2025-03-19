'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import ProductCard from '@/app/components/ProductCard';
import { Perfume } from '@/app/types/Product';
import CartModal from '@/app/components/CartModal';

const Catalogo: React.FC = () => {
  const [products, setProducts] = useState<Perfume[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);

  useEffect(() => {
    // Actualizar estado de autenticación
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    const interval = setInterval(checkAuth, 500);

    // Cargar productos desde el endpoint
    fetch('https://wksolutions.somee.com/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products', error));

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      {/* Segundo navbar fijo */}
      <div className="fixed top-16 left-0 w-full bg-gray-800 shadow z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-center space-x-4">
          <Link
            href="/catalogo"
            className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white border border-white"
          >
            Catálogo
          </Link>
          <Link
            href="/inicio#inicio"
            className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white border border-transparent hover:border-white"
          >
            Inicio
          </Link>
        </div>
      </div>

      {/* Contenedor principal: se usa un contenedor flexible para mantener el tamaño de cada tarjeta */}
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {products.map((product) => (
              <div key={product.perfumeId} className="w-full sm:w-80">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <button
          onClick={() => setShowCartModal(true)}
          className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50"
          aria-label="Abrir carrito"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9"
            />
          </svg>
        </button>
      )}

      {showCartModal && <CartModal onClose={() => setShowCartModal(false)} />}
    </>
  );
};

export default Catalogo;

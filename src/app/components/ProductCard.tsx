'use client';

import React, { useEffect, useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import Image from 'next/image';
import { Perfume } from '@/app/types/Product';
import { useCart } from '@/app/context/CartContext';

interface TokenPayload {
  role: string;
  [key: string]: unknown;
}

interface ProductCardProps {
  product: Perfume;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const [canAddToCart, setCanAddToCart] = useState(false);
  const { addToCart } = useCart();

  // Función para decodificar el JWT
  function parseJwt(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (
        payload &&
        (payload.role === 'Usuario' || payload.role === 'Admin' || payload.role === 'Superadmin')
      ) {
        setCanAddToCart(true);
      }
    }
  }, []);

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-64">
      <Zoom>
        {product.imagenUrl ? (
          <div className="relative w-full h-64">
            <Image
              src={product.imagenUrl}
              alt={product.modelo}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">Sin imagen</span>
          </div>
        )}
      </Zoom>
      <div className="absolute inset-0 flex flex-col justify-end items-center bg-gradient-to-t from-black via-transparent to-transparent p-4 transition-all duration-300">
        {expanded ? (
          <div className="bg-black bg-opacity-60 rounded-lg p-4 text-center w-full">
            <h2 className="text-lg font-bold text-white">{product.modelo}</h2>
            <p className="mt-2 text-sm font-semibold text-white">
              ${product.precioMinorista.toFixed(2)}
            </p>
            {product.descripcion && (
              <p className="mt-2 text-xs text-white">{product.descripcion}</p>
            )}
            <p className="mt-2 text-xs text-white">Volumen: {product.volumen} ml</p>
            {product.stock > 0 ? (
              canAddToCart && (
                <button
                  onClick={() => {
                    addToCart(product);
                    alert("Producto agregado al carrito");
                  }}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-2 rounded transition-colors"
                >
                  Agregar al carrito
                </button>
              )
            ) : (
              <p className="mt-4 text-red-500 text-xs font-bold">¡Sin Stock!</p>
            )}
            <button
              onClick={() => setExpanded(false)}
              className="mt-3 ml-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded transition-colors"
            >
              Ocultar detalles
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <button
              onClick={() => setExpanded(true)}
              className="bg-black bg-opacity-60 text-white px-4 py-2 rounded transition-colors"
            >
              Ver detalles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

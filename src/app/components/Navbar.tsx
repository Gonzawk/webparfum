'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/app/context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { tokenPayload, logout } = useContext(AuthContext);
  const router = useRouter();

  // Opciones para escritorio
  const renderDesktopOptions = () => {
    if (!tokenPayload) {
      return (
        <Link
          href="/login"
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          role="menuitem"
        >
          Ingresar
        </Link>
      );
    }

    if (tokenPayload.role === 'Superadmin') {
      return (
        <>
          <Link href="/mis-datos" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Mis Datos
          </Link>
          <Link href="/admin-usuarios" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Usuarios
          </Link>
          <Link href="/catalogo" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Catálogo
          </Link>
          <Link href="/productos" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Productos
          </Link>
          <Link href="/ventas" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Ventas
          </Link>
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left"
            role="menuitem"
          >
            Cerrar Sesión
          </button>
        </>
      );
    } else if (tokenPayload.role === 'Admin') {
      return (
        <>
          <Link href="/mis-datos" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Mis Datos
          </Link>
          <Link href="/catalogo" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Catálogo
          </Link>
          <Link href="/productos" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Productos
          </Link>
          <Link href="/ventas" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Ventas
          </Link>
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left"
            role="menuitem"
          >
            Cerrar Sesión
          </button>
        </>
      );
    } else {
      // Rol Usuario
      return (
        <>
          <Link href="/mis-datos" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Mis Datos
          </Link>
          <Link href="/mis-compras" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Mis Pedidos
          </Link>
          <Link href="/catalogo" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded" role="menuitem">
            Catálogo
          </Link>
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left"
            role="menuitem"
          >
            Cerrar Sesión
          </button>
        </>
      );
    }
  };

  // Opciones para menú móvil (sin cambios importantes, solo ajustes de padding)
  const renderMobileOptions = () => {
    if (!tokenPayload) {
      return (
        <Link
          href="/login"
          className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded"
        >
          Ingresar
        </Link>
      );
    }

    if (tokenPayload.role === 'Superadmin') {
      return (
        <>
          <Link href="/mis-datos" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Mis Datos
          </Link>
          <Link href="/admin-usuarios" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Usuarios
          </Link>
          <Link href="/catalogo" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Catálogo
          </Link>
          <Link href="/productos" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Productos
          </Link>
          <Link href="/ventas" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Ventas
          </Link>
          <button
            onClick={() => logout()}
            className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            Cerrar Sesión
          </button>
        </>
      );
    } else if (tokenPayload.role === 'Admin') {
      return (
        <>
          <Link href="/mis-datos" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Mis Datos
          </Link>
          <Link href="/catalogo" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Catálogo
          </Link>
          <Link href="/productos" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Productos
          </Link>
          <Link href="/ventas" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Ventas
          </Link>
          <button
            onClick={() => logout()}
            className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            Cerrar Sesión
          </button>
        </>
      );
    } else {
      // Rol Usuario
      return (
        <>
          <Link href="/mis-datos" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Mis Datos
          </Link>
          <Link href="/mis-compras" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Mis Pedidos
          </Link>
          <Link href="/catalogo" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Catálogo
          </Link>
          <button
            onClick={() => logout()}
            className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            Cerrar Sesión
          </button>
        </>
      );
    }
  };

  return (
    <nav className="bg-gray-800 fixed top-0 left-0 w-full z-50 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link href="/">
              <span className="text-white font-bold text-xl">Perfumes Importados</span>
            </Link>
          </div>
          {/* Menú de escritorio */}
          <div className="hidden md:flex space-x-4">
            {renderDesktopOptions()}
          </div>
          {/* Botón del menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-900 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menú</span>
              {isOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {renderMobileOptions()}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

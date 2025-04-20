'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/app/context/AuthContext';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { tokenPayload, logout } = useContext(AuthContext);
  const userRole = (tokenPayload as { role?: string } | null)?.role;

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);

  const renderDesktopOptions = () => {
    if (!tokenPayload) {
      return (
        <Link href="/login" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Ingresar
        </Link>
      );
    }

    const productosDropdown = (
      <div className="relative inline-block">
        <button
          onClick={() => setIsProductsOpen(!isProductsOpen)}
          className="inline-flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          Productos
          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </button>
        {isProductsOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow py-2 z-50">
            <Link href="/productos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Perfumes
            </Link>
            <Link href="/decants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Decants
            </Link>
          </div>
        )}
      </div>
    );

    const baseLinks = (
      <>
        <Link href="/mis-datos" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Mis Datos
        </Link>
        <Link href="/catalogo" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Catálogo
        </Link>
        {productosDropdown}
        <Link href="/ventas" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Ventas
        </Link>
      </>
    );

    if (userRole === 'Superadmin') {
      return (
        <>
          {baseLinks}
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Estadísticas
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow py-2 z-50">
                <Link href="/estadisticas-ventas" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Estadísticas de Ventas
                </Link>
                <Link href="/estadisticas-compras" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Estadísticas de Admin
                </Link>
              </div>
            )}
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Cerrar Sesión
          </button>
        </>
      );
    } else if (userRole === 'Admin') {
      return (
        <>
          {baseLinks}
          <button onClick={logout} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Cerrar Sesión
          </button>
        </>
      );
    } else {
      return (
        <>
          <Link href="/mis-datos" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Mis Datos
          </Link>
          <Link href="/mis-compras" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Mis Pedidos
          </Link>
          <Link href="/catalogo" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Catálogo
          </Link>
          <button onClick={logout} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Cerrar Sesión
          </button>
        </>
      );
    }
  };

  const renderMobileOptions = () => {
    if (!tokenPayload) {
      return (
        <Link href="/login" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
          Ingresar
        </Link>
      );
    }

    const productosMobile = (
      <>
        <button
          onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
          className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded"
        >
          Productos
        </button>
        {isMobileProductsOpen && (
          <div className="pl-4">
            <Link href="/productos" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
              Perfumes
            </Link>
            <Link href="/decants" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
              Decants
            </Link>
          </div>
        )}
      </>
    );

    if (userRole === 'Superadmin') {
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
          {productosMobile}
          <Link href="/ventas" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Ventas
          </Link>
          <button
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            Estadísticas
          </button>
          {isMobileDropdownOpen && (
            <div className="pl-4">
              <Link href="/estadisticas-ventas" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Estadísticas de Ventas
              </Link>
              <Link href="/estadisticas-compras" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Estadísticas de Admin
              </Link>
            </div>
          )}
          <button onClick={logout} className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Cerrar Sesión
          </button>
        </>
      );
    } else if (userRole === 'Admin') {
      return (
        <>
          <Link href="/mis-datos" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Mis Datos
          </Link>
          <Link href="/catalogo" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Catálogo
          </Link>
          {productosMobile}
          <Link href="/ventas" className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Ventas
          </Link>
          <button onClick={logout} className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            Cerrar Sesión
          </button>
        </>
      );
    } else {
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
          <button onClick={logout} className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded">
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
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/inicio">
              <span className="text-white font-bold text-xl">Perfumes Importados</span>
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            {renderDesktopOptions()}
          </div>
          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-900 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
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

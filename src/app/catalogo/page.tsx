'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import ProductCard from '@/app/components/ProductCard';
import { Perfume } from '@/app/types/Product';
import CartModal from '@/app/components/CartModal';

// Interfaz para las marcas (obtenidas del endpoint)
interface Brand {
  marcaId: number;
  nombre: string;
}

interface Filters {
  priceMin?: number;
  priceMax?: number;
  gender?: string[];
  brand?: number[]; // Se almacenarán los IDs de marca
}

interface PriceRange {
  min: number;
  max: number;
}

interface FilterModalProps {
  initialFilters: Filters;
  priceRange: PriceRange;
  brands: Brand[];
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ initialFilters, priceRange, brands, onApply, onClose }) => {
  const [selectedPriceMin, setSelectedPriceMin] = useState<number>(
    initialFilters.priceMin !== undefined ? initialFilters.priceMin : priceRange.min
  );
  const [selectedPriceMax, setSelectedPriceMax] = useState<number>(
    initialFilters.priceMax !== undefined ? initialFilters.priceMax : priceRange.max
  );
  const [selectedGenders, setSelectedGenders] = useState<string[]>(initialFilters.gender || []);
  const [selectedBrands, setSelectedBrands] = useState<number[]>(initialFilters.brand || []);

  const genderOptions = ['masculino', 'femenino', 'unisex'];

  const toggleGender = (value: string) => {
    if (selectedGenders.includes(value)) {
      setSelectedGenders(selectedGenders.filter((g) => g !== value));
    } else {
      setSelectedGenders([...selectedGenders, value]);
    }
  };

  const toggleBrand = (value: number) => {
    if (selectedBrands.includes(value)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== value));
    } else {
      setSelectedBrands([...selectedBrands, value]);
    }
  };

  const handleApply = () => {
    onApply({
      priceMin: selectedPriceMin,
      priceMax: selectedPriceMax,
      gender: selectedGenders,
      brand: selectedBrands,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-11/12 max-w-lg text-gray-800">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-center">Filtrar</h2>
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Rango de precio: ${selectedPriceMin} - ${selectedPriceMax}
          </label>
          <div className="flex flex-col space-y-3">
            <input
              type="range"
              className="accent-blue-500"
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceMin}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value <= selectedPriceMax) {
                  setSelectedPriceMin(value);
                }
              }}
            />
            <input
              type="range"
              className="accent-blue-500"
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceMax}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= selectedPriceMin) {
                  setSelectedPriceMax(value);
                }
              }}
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Género</label>
          <div className="flex flex-wrap gap-4">
            {genderOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedGenders.includes(option)}
                  onChange={() => toggleGender(option)}
                  className="accent-blue-500"
                />
                <span className="capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Marca</label>
          <div className="flex flex-wrap gap-4">
            {brands.length > 0 ? (
              brands.map((brand) => (
                <label key={brand.marcaId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={brand.marcaId}
                    checked={selectedBrands.includes(brand.marcaId)}
                    onChange={() => toggleBrand(brand.marcaId)}
                    className="accent-blue-500"
                  />
                  <span>{brand.nombre}</span>
                </label>
              ))
            ) : (
              <span>No hay marcas disponibles</span>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

const Catalogo: React.FC = () => {
  const [products, setProducts] = useState<Perfume[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Perfume[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({});
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    const interval = setInterval(checkAuth, 500);

    // Cargar productos
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Products`)
      .then((res) => res.json())
      .then((data: Perfume[]) => {
        setProducts(data);
        const prices = data.map((p) => p.precioMinorista);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange({ min: minPrice, max: maxPrice });
        setFilters((prev) => ({
          priceMin: prev.priceMin !== undefined ? prev.priceMin : minPrice,
          priceMax: prev.priceMax !== undefined ? prev.priceMax : maxPrice,
          gender: prev.gender || [],
          brand: prev.brand || [],
        }));
      })
      .catch((error) => console.error('Error fetching products', error));

    // Llamada al endpoint para obtener las marcas
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Marca`)
      .then((res) => res.json())
      .then((data: Brand[]) => {
        setAvailableBrands(data);
      })
      .catch((error) => console.error('Error fetching brands', error));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = products;
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((p) => p.precioMinorista >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((p) => p.precioMinorista <= filters.priceMax!);
    }
    if (filters.gender && filters.gender.length > 0) {
      filtered = filtered.filter((p) =>
        filters.gender!.map((g) => g.toLowerCase()).includes(p.genero.toLowerCase())
      );
    }
    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter((p) => filters.brand!.includes(p.marcaId));
    }
    setFilteredProducts(filtered);
  }, [filters, products]);

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
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white border border-white"
          >
            Filtros
          </button>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {filteredProducts.map((product) => (
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
      {showFilterModal && (
        <FilterModal
          initialFilters={filters}
          priceRange={priceRange}
          brands={availableBrands}
          onApply={(newFilters) => setFilters(newFilters)}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </>
  );
};

export default Catalogo;

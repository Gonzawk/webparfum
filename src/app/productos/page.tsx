'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import PrivateRoutes from '@/app/components/PrivateRoutes';
import { Perfume } from '@/app/types/Product';

interface Brand {
  marcaId: number;
  nombre: string;
}

interface ModelDetails {
  modelo: string;
  precioMinorista: number;
  precioMayorista: number;
  genero: string;
  descripcion: string;
  volumen: number;
  stock: number;
  imagenUrl: string;
}

const Productos: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'marca' | 'modelo'>('marca');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState('');
  const [modelDetails, setModelDetails] = useState<ModelDetails>({
    modelo: '',
    precioMinorista: 0,
    precioMayorista: 0,
    genero: '',
    descripcion: '',
    volumen: 0,
    stock: 0,
    imagenUrl: ''
  });
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');
  const [products, setProducts] = useState<Perfume[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Cargar marcas y productos al montar el componente
  useEffect(() => {
    fetch('https://wksolutions.somee.com/api/Marca')
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((err) => console.error('Error fetching brands', err));

    fetch('https://wksolutions.somee.com/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products', err));
  }, []);

  // Manejo de marcas
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://wksolutions.somee.com/api/Marca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: brandName }),
      });
      if (res.ok) {
        const newBrand = await res.json();
        setBrands((prev) => [...prev, newBrand]);
        setBrandName('');
      } else {
        const msg = await res.text();
        setError(`Error agregando marca: ${msg}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  const handleDeleteBrand = async (marcaId: number) => {
    try {
      const res = await fetch(`https://wksolutions.somee.com/api/Marca/${marcaId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBrands((prev) => prev.filter((b) => b.marcaId !== marcaId));
      } else {
        const msg = await res.text();
        setError(`Error eliminando marca: ${msg}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  // Manejo de modelos/productos: Se usa handleSaveModel para crear o actualizar
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrandId === '') {
      setError('Por favor, selecciona una marca.');
      return;
    }
    try {
      const payload = {
        ...modelDetails,
        MarcaId: selectedBrandId
      };
      if (editingProductId === null) {
        // Crear producto
        const res = await fetch('https://wksolutions.somee.com/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const newProduct = await res.json();
          setProducts((prev) => [...prev, newProduct]);
          resetModelForm();
        } else {
          const msg = await res.text();
          setError(`Error agregando modelo: ${msg}`);
        }
      } else {
        // Actualizar producto
        const res = await fetch(`https://wksolutions.somee.com/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, perfumeId: editingProductId }),
        });
        if (res.ok) {
          const updatedProduct = await res.json();
          setProducts((prev) =>
            prev.map((p) => (p.perfumeId === editingProductId ? updatedProduct : p))
          );
          resetModelForm();
        } else {
          const msg = await res.text();
          setError(`Error actualizando modelo: ${msg}`);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  const resetModelForm = () => {
    setModelDetails({
      modelo: '',
      precioMinorista: 0,
      precioMayorista: 0,
      genero: '',
      descripcion: '',
      volumen: 0,
      stock: 0,
      imagenUrl: ''
    });
    setSelectedBrandId('');
    setEditingProductId(null);
  };

  const handleEditProduct = (product: Perfume) => {
    setEditingProductId(product.perfumeId);
    setModelDetails({
      modelo: product.modelo,
      precioMinorista: product.precioMinorista,
      precioMayorista: product.precioMayorista,
      genero: product.genero,
      descripcion: product.descripcion || '',
      volumen: product.volumen,
      stock: product.stock,
      imagenUrl: product.imagenUrl || ''
    });
    setSelectedBrandId(product.marcaId);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`https://wksolutions.somee.com/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.perfumeId !== id));
      } else {
        const msg = await res.text();
        setError(`Error eliminando producto: ${msg}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Productos</h1>

        {/* Navbar secundario para secciones */}
        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => setActiveSection('marca')}
            className={`px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white ${
              activeSection === 'marca'
                ? 'border border-white'
                : 'border border-transparent hover:border-white'
            }`}
          >
            Marca
          </button>
          <button
            onClick={() => setActiveSection('modelo')}
            className={`px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white ${
              activeSection === 'modelo'
                ? 'border border-white'
                : 'border border-transparent hover:border-white'
            }`}
          >
            Modelo - Detalles
          </button>
        </div>

        {activeSection === 'marca' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Administrar Marcas</h2>
            {/* Formulario para agregar marca */}
            <form onSubmit={handleAddBrand} className="mb-6 space-y-4">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nueva Marca"
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                required
              />
              <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded">
                Agregar Marca
              </button>
            </form>
            {/* Listado de marcas */}
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand.marcaId} className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-800">{brand.nombre}</span>
                  <div className="space-x-2">
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
                    <button
                      onClick={() => handleDeleteBrand(brand.marcaId)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'modelo' && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Modelo - Detalles</h2>
            {/* Formulario para agregar/editar modelo */}
            <form onSubmit={handleSaveModel} className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-800">Nombre del Modelo</label>
                  <input
                    type="text"
                    value={modelDetails.modelo}
                    onChange={(e) =>
                      setModelDetails({ ...modelDetails, modelo: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800">Precio Minorista</label>
                  <input
                    type="number"
                    value={modelDetails.precioMinorista}
                    onChange={(e) =>
                      setModelDetails({ ...modelDetails, precioMinorista: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800">Precio Mayorista</label>
                  <input
                    type="number"
                    value={modelDetails.precioMayorista}
                    onChange={(e) =>
                      setModelDetails({ ...modelDetails, precioMayorista: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800">Género</label>
                  <input
                    type="text"
                    value={modelDetails.genero}
                    onChange={(e) =>
                      setModelDetails({ ...modelDetails, genero: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block mb-1 text-gray-800">Descripción</label>
                <textarea
                  value={modelDetails.descripcion}
                  onChange={(e) =>
                    setModelDetails({ ...modelDetails, descripcion: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                  rows={3}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-gray-800">Volumen (ml)</label>
                  <input
                    type="number"
                    value={modelDetails.volumen}
                    onChange={(e) =>
                      setModelDetails({ ...modelDetails, volumen: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800">Stock</label>
                  <input
                    type="number"
                    value={modelDetails.stock}
                    onChange={(e) =>
                      setModelDetails({ ...modelDetails, stock: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800">Imagen URL</label>
                  <input
                    type="text"
                    value={modelDetails.imagenUrl}
                    onChange={(e) =>
                      setModelDetails({ ...modelDetails, imagenUrl: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block mb-1 text-gray-800">Seleccionar Marca</label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                  required
                >
                  <option value="">Selecciona una marca</option>
                  {brands.map((brand) => (
                    <option key={brand.marcaId} value={brand.marcaId}>
                      {brand.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded mt-4">
                {editingProductId ? 'Actualizar Modelo' : 'Agregar Modelo'}
              </button>
            </form>
            {/* Listado de productos */}
            <div className="mt-6 divide-y divide-gray-300">
              {products.length === 0 ? (
                <p className="text-gray-800">No hay modelos cargados.</p>
              ) : (
                products.map((product) => {
                  const brand = brands.find((b) => b.marcaId === product.marcaId);
                  return (
                    <div
                      key={product.perfumeId}
                      className="py-2 flex flex-col sm:flex-row justify-between items-center"
                    >
                      <span className="text-gray-800 mb-2 sm:mb-0">
                        {product.modelo} - {brand ? brand.nombre : 'Sin marca'} (ID: {product.perfumeId})
                      </span>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.perfumeId)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </div>
    </PrivateRoutes>
  );
};

export default Productos;

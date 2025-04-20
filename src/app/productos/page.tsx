'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'marca' | 'modelo' | 'listado'>('marca');
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Marca`)
      .then((res) => res.json())
      .then(setBrands)
      .catch((err) => console.error('Error fetching brands', err));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error('Error fetching products', err));
  }, []);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Marca`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: brandName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const newB = await res.json();
      setBrands((prev) => [...prev, newB]);
      setBrandName('');
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud.');
    }
  };

  const handleDeleteBrand = async (marcaId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Marca/${marcaId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(await res.text());
      setBrands((prev) => prev.filter((b) => b.marcaId !== marcaId));
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud.');
    }
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrandId === '') {
      setError('Por favor, selecciona una marca.');
      return;
    }
    if (
      modelDetails.precioMinorista === 0 ||
      modelDetails.precioMayorista === 0 ||
      modelDetails.volumen === 0 ||
      modelDetails.stock === 0
    ) {
      setError('Los campos Precio, Volumen y Stock deben ser mayores a 0.');
      return;
    }
    try {
      const payload = { ...modelDetails, MarcaId: selectedBrandId };
      let res: Response;
      if (editingProductId == null) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, perfumeId: editingProductId }),
        });
      }
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setProducts((prev) =>
        editingProductId == null
          ? [...prev, saved]
          : prev.map((p) => (p.perfumeId === editingProductId ? saved : p))
      );
      resetModelForm();
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud.');
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
    setIsModalOpen(false);
  };

  const handleEditProduct = (p: Perfume) => {
    setEditingProductId(p.perfumeId);
    setModelDetails({
      modelo: p.modelo,
      precioMinorista: p.precioMinorista,
      precioMayorista: p.precioMayorista,
      genero: p.genero,
      descripcion: p.descripcion || '',
      volumen: p.volumen,
      stock: p.stock,
      imagenUrl: p.imagenUrl || ''
    });
    setSelectedBrandId(p.marcaId);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(await res.text());
      setProducts((prev) => prev.filter((p) => p.perfumeId !== id));
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud.');
    }
  };

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 px-4 pb-8 bg-gray-800 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Productos</h1>

        {/* Secciones */}
        <div className="flex justify-center space-x-4 mb-8">
          {(['marca', 'modelo', 'listado'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2 rounded-md font-medium bg-gray-800 text-white transition ${
                activeSection === sec ? 'border border-white' : 'border-transparent hover:border-white'
              }`}
            >
              {sec === 'modelo' ? 'Modelo - Detalles' : sec.charAt(0).toUpperCase() + sec.slice(1)}
            </button>
          ))}
          {/* <button
            onClick={() => router.push('/decants')}
            className="px-4 py-2 rounded-md font-medium bg-gray-800 text-white border-transparent hover:border-white"
          >
            Decants
          </button> */}
        </div>

        {/* Marca */}
        {activeSection === 'marca' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow mb-8 text-black">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Administrar Marcas</h2>
            <form onSubmit={handleAddBrand} className="space-y-4">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nueva Marca"
                className="w-full border border-gray-300 rounded px-4 py-2"
                required
              />
              <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded">
                Agregar Marca
              </button>
            </form>
            <div className="mt-6 space-y-2">
              {brands.map((b) => (
                <div key={b.marcaId} className="flex justify-between items-center border-b pb-2">
                  <span>{b.nombre}</span>
                  <div className="space-x-2">
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
                    <button onClick={() => handleDeleteBrand(b.marcaId)} className="bg-red-500 text-white px-3 py-1 rounded">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modelo - Detalles */}
        {activeSection === 'modelo' && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg p-6 shadow mb-6 text-black">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Modelo - Detalles</h2>
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
                {editingProductId == null ? 'Agregar Modelo' : 'Editar Modelo'}
              </button>
              <div className="mt-6 divide-y divide-gray-300">
                {products.length === 0 ? (
                  <p>No hay modelos cargados.</p>
                ) : (
                  products.map((p) => (
                    <div key={p.perfumeId} className="py-2 flex justify-between items-center">
                      <span>
                        {p.modelo} - {(brands.find((b) => b.marcaId === p.marcaId)?.nombre) || 'Sin marca'} (ID: {p.perfumeId})
                      </span>
                      <div className="space-x-2">
                        <button onClick={() => handleEditProduct(p)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                          Editar
                        </button>
                        <button onClick={() => handleDeleteProduct(p.perfumeId)} className="bg-red-500 text-white px-3 py-1 rounded">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal sobre la página existente */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-lg p-6 shadow-lg w-full max-w-lg text-black">
                  <h3 className="text-xl font-bold mb-4">
                    {editingProductId == null ? 'Nuevo Modelo' : 'Editar Modelo'}
                  </h3>
                  <form onSubmit={handleSaveModel} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Nombre del Modelo</label>
                        <input
                          type="text"
                          value={modelDetails.modelo}
                          onChange={(e) => setModelDetails({ ...modelDetails, modelo: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Precio Minorista</label>
                        <input
                          type="number"
                          value={modelDetails.precioMinorista || ''}
                          onChange={(e) => setModelDetails({ ...modelDetails, precioMinorista: Number(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Precio Mayorista</label>
                        <input
                          type="number"
                          value={modelDetails.precioMayorista || ''}
                          onChange={(e) => setModelDetails({ ...modelDetails, precioMayorista: Number(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Género</label>
                        <input
                          type="text"
                          value={modelDetails.genero}
                          onChange={(e) => setModelDetails({ ...modelDetails, genero: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1">Descripción</label>
                      <textarea
                        rows={3}
                        value={modelDetails.descripcion}
                        onChange={(e) => setModelDetails({ ...modelDetails, descripcion: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-1">Volumen (ml)</label>
                        <input
                          type="number"
                          value={modelDetails.volumen || ''}
                          onChange={(e) => setModelDetails({ ...modelDetails, volumen: Number(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Stock</label>
                        <input
                          type="number"
                          value={modelDetails.stock || ''}
                          onChange={(e) => setModelDetails({ ...modelDetails, stock: Number(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1">URL Imagen</label>
                        <input
                          type="text"
                          value={modelDetails.imagenUrl}
                          onChange={(e) => setModelDetails({ ...modelDetails, imagenUrl: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1">Marca</label>
                      <select
                        value={selectedBrandId}
                        onChange={(e) => setSelectedBrandId(Number(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">Selecciona una marca</option>
                        {brands.map((b) => (
                          <option key={b.marcaId} value={b.marcaId}>
                            {b.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                      {editingProductId == null ? 'Agregar Modelo' : 'Actualizar Modelo'}
                    </button>
                  </form>
                  <button onClick={resetModelForm} className="mt-4 w-full bg-red-500 text-white py-2 rounded">
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listado */}
        {activeSection === 'listado' && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow text-black">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Listado de Productos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Modelo</th>
                    <th className="border px-4 py-2">Marca</th>
                    <th className="border px-4 py-2">Minorista</th>
                    <th className="border px-4 py-2">Mayorista</th>
                    <th className="border px-4 py-2">Género</th>
                    <th className="border px-4 py-2">Volumen</th>
                    <th className="border px-4 py-2">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const mb = brands.find((b) => b.marcaId === p.marcaId)?.nombre || 'Sin marca';
                    return (
                      <tr key={p.perfumeId}>
                        <td className="border px-4 py-2 text-center">{p.perfumeId}</td>
                        <td className="border px-4 py-2">{p.modelo}</td>
                        <td className="border px-4 py-2">{mb}</td>
                        <td className="border px-4 py-2 text-right">${p.precioMinorista.toFixed(2)}</td>
                        <td className="border px-4 py-2 text-right">${p.precioMayorista.toFixed(2)}</td>
                        <td className="border px-4 py-2 text-center">{p.genero}</td>
                        <td className="border px-4 py-2 text-center">{p.volumen} ml</td>
                        <td className="border px-4 py-2 text-center">{p.stock}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </div>
    </PrivateRoutes>
  );
};

export default Productos;

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import PrivateRoutes from '@/app/components/PrivateRoutes';
import Link from 'next/link';

interface Decant {
  id: string;
  nombre: string;
  codigoQR: string;
  cantidadDisponible: number;
  urlImagen: string | null;
  estado: number;
  fechaCreacion: string;
}

interface DecantForm {
  id: string;
  nombre: string;
  codigoQR: string;
  cantidadDisponible: number;
  urlImagen: string;
  estado: number;
}

export default function DecantsAdmin() {
  const [decants, setDecants] = useState<Decant[]>([]);
  const [filteredDecants, setFilteredDecants] = useState<Decant[]>([]);
  const [searchId, setSearchId] = useState('');
  const [form, setForm] = useState<DecantForm>({
    id: '',
    nombre: '',
    codigoQR: '',
    cantidadDisponible: 0,
    urlImagen: '',
    estado: 1
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [origin, setOrigin] = useState('');
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/Decants`;

  // Capturar origen para generar URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Función de recarga de datos, memoizada
  const loadDecants = useCallback(async () => {
    try {
      const res = await fetch(apiUrl);
      const data: Decant[] = await res.json();
      setDecants(data);
      setFilteredDecants(data);
    } catch (e) {
      console.error(e);
    }
  }, [apiUrl]);

  // Carga inicial
  useEffect(() => {
    loadDecants();
  }, [loadDecants]);

  // Filtrado por ID
  useEffect(() => {
    if (!searchId) {
      setFilteredDecants(decants);
    } else {
      setFilteredDecants(
        decants.filter(d =>
          d.id.toLowerCase().includes(searchId.toLowerCase())
        )
      );
    }
  }, [searchId, decants]);

  const openAddModal = () => {
    setForm({ id:'', nombre:'', codigoQR:'', cantidadDisponible:0, urlImagen:'', estado:1 });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (d: Decant) => {
    setForm({
      id: d.id,
      nombre: d.nombre,
      codigoQR: d.codigoQR,
      cantidadDisponible: d.cantidadDisponible,
      urlImagen: d.urlImagen ?? '',
      estado: d.estado
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: (name === 'cantidadDisponible' || name === 'estado') ? Number(value) : value
    }));
  };

  // POST luego PUT para asignar codigoQR basado en ID
  async function createDecant() {
    // 1) POST inicial
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        cantidadDisponible: form.cantidadDisponible,
        urlImagen: form.urlImagen || null,
        estado: form.estado
      })
    });
    if (!res.ok) throw new Error('Error al crear decant');
    const newId: string = await res.json();

    // 2) Generar URL y PUT para actualizar codigoQR
    const qrUrl = `${origin}/decants/${newId}`;
    await fetch(`${apiUrl}/${newId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newId,
        nombre: form.nombre,
        cantidadDisponible: form.cantidadDisponible,
        urlImagen: form.urlImagen || null,
        estado: form.estado,
        codigoQR: qrUrl
      })
    });

    // 3) Refrescar y cerrar modal
    await loadDecants();
    closeModal();
  }

  // PUT edición incluyendo codigoQR
  async function updateDecant() {
    await fetch(`${apiUrl}/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    await loadDecants();
    closeModal();
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDecant();
      } else {
        await createDecant();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este decant?')) return;
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    await loadDecants();
  };

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          Decants
        </h1>

        {/* Barra de búsqueda y agregar */}
        <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <input
            type="text"
            placeholder="Buscar por ID"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="w-full md:w-1/3 border border-gray-300 dark:border-gray-700 rounded px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={openAddModal}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Agregar Decant
          </button>
        </div>

        {/* Tabla de listado */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border px-4 py-2 text-left text-gray-700 dark:text-gray-300">Nombre</th>
                <th className="border px-4 py-2 text-center text-gray-700 dark:text-gray-300">Cantidad</th>
                <th className="border px-4 py-2 text-center text-gray-700 dark:text-gray-300">Estado</th>
                <th className="border px-4 py-2 text-center text-gray-700 dark:text-gray-300">Creación</th>
                <th className="border px-4 py-2 text-center text-gray-700 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDecants.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border px-4 py-2 text-gray-900 dark:text-gray-100">{d.nombre}</td>
                  <td className="border px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                    {d.cantidadDisponible}
                  </td>
                  <td className="border px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                    {d.estado === 1 ? 'Activo' : 'Inactivo'}
                  </td>
                  <td className="border px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                    {new Date(d.fechaCreacion).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => openEditModal(d)}
                        className="bg-yellow-500 dark:bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-600 dark:hover:bg-yellow-500"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600 dark:hover:bg-red-500"
                      >
                        Eliminar
                      </button>
                      <Link
                        href={`/decants/${d.id}/${encodeURIComponent(d.nombre)}`}
                        className="bg-gray-600 dark:bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDecants.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No se encontraron decants.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Crear/Editar */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isEditing ? 'Editar Decant' : 'Crear Decant'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
                <input
                  name="codigoQR"
                  value={form.codigoQR}
                  readOnly
                  placeholder="(Se generará automáticamente)"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
                <input
                  name="cantidadDisponible"
                  type="number"
                  value={form.cantidadDisponible}
                  onChange={handleChange}
                  placeholder="Cantidad Disponible"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
                <input
                  name="urlImagen"
                  value={form.urlImagen}
                  onChange={handleChange}
                  placeholder="URL Imagen"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrivateRoutes>
  );
}

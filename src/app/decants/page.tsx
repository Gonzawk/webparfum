'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import PrivateRoutes from '@/app/components/PrivateRoutes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';

interface Decant {
  id: number;
  nombre: string;
  cantidadDisponible: number;
  urlImagen: string | null;
  estado: number;
  fechaCreacion: string;
}

export default function DecantsAdmin() {
  const router = useRouter();
  const [decants, setDecants] = useState<Decant[]>([]);
  const [filtered, setFiltered] = useState<Decant[]>([]);
  const [searchId, setSearchId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    nombre: '',
    cantidadDisponible: 0,
    urlImagen: '',
    estado: 1
  });
  const [isEditing, setIsEditing] = useState(false);
  const [origin, setOrigin] = useState('');
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/Decants`;

  // Capturar	el origin para montar el QR
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Carga inicial y recarga
  const loadDecants = useCallback(async () => {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(res.statusText);
      const data: Decant[] = await res.json();
      setDecants(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error cargando decants:', err);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadDecants();
  }, [loadDecants]);

  // Filtrar por ID
  useEffect(() => {
    setFiltered(
      searchId
        ? decants.filter(d => d.id.toString().includes(searchId))
        : decants
    );
  }, [searchId, decants]);

  // Modales
  const openAdd = () => {
    setIsEditing(false);
    setForm({ id: 0, nombre: '', cantidadDisponible: 0, urlImagen: '', estado: 1 });
    setModalOpen(true);
  };
  const openEdit = (d: Decant) => {
    setIsEditing(true);
    setForm({
      id: d.id,
      nombre: d.nombre,
      cantidadDisponible: d.cantidadDisponible,
      urlImagen: d.urlImagen ?? '',
      estado: d.estado
    });
    setModalOpen(true);
  };
  const close = () => setModalOpen(false);

  // Handler compartido
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]:
        name === 'cantidadDisponible' || name === 'estado'
          ? Number(value)
          : value
    }));
  };

  // Crear
  const createDecant = async () => {
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
    if (!res.ok) throw new Error('Error creando decant');
    await loadDecants();
    close();
  };

  // Actualizar (incluye QR generado en frontend)
  const updateDecant = async () => {
    await fetch(`${apiUrl}/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        nombre: form.nombre,
        cantidadDisponible: form.cantidadDisponible,
        urlImagen: form.urlImagen || null,
        estado: form.estado,
        codigoQR: `${origin}/decants/${form.id}`
      })
    });
    await loadDecants();
    close();
  };

  // Submit de formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) await updateDecant();
      else await createDecant();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este decant?')) return;
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    await loadDecants();
  };

  return (
    <PrivateRoutes>
      <Navbar />

      <div className="pt-32 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-gray-100">
          Decants
        </h1>

        {/* Botón igual a Productos */}
        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/productos')}
            className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
          >
            Productos
          </button>
          <button
            onClick={() => router.push('/decants')}
            className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
          >
            Decants
          </button>
        </div>

        {/* Filtro y agregar */}
        <div className="flex mb-6 space-x-4">
          <input
            type="text"
            placeholder="Buscar por ID"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="flex-1 border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Agregar Decant
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                {['ID','Nombre','Cantidad','Estado','Creado','QR','Acciones'].map(h => (
                  <th key={h} className="px-4 py-2 text-left dark:text-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const qrUrl = `${origin}/decants/${d.id}`;
                return (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border px-4 py-2">{d.id}</td>
                    <td className="border px-4 py-2">{d.nombre}</td>
                    <td className="border px-4 py-2">{d.cantidadDisponible}</td>
                    <td className="border px-4 py-2">
                      {d.estado === 1 ? 'Activo' : 'Inactivo'}
                    </td>
                    <td className="border px-4 py-2">
                      {new Date(d.fechaCreacion).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2">
                      <QRCodeCanvas value={qrUrl} size={48} />
                    </td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => openEdit(d)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Eliminar
                      </button>
                      <Link
                        href={`/decants/${d.id}`}
                        className="bg-gray-600 text-white px-2 py-1 rounded"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 dark:text-gray-400">
                    No se encontraron decants.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Modal Crear/Editar */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                {isEditing ? 'Editar Decant' : 'Crear Decant'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  name="cantidadDisponible"
                  type="number"
                  value={form.cantidadDisponible}
                  onChange={handleChange}
                  placeholder="Cantidad Disponible"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  name="urlImagen"
                  value={form.urlImagen}
                  onChange={handleChange}
                  placeholder="URL Imagen"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="w-full mt-2 bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrivateRoutes>
  );
}

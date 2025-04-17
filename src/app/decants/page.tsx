'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import PrivateRoutes from '@/app/components/PrivateRoutes';
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
  const api = `${process.env.NEXT_PUBLIC_API_URL}/api/Decants`;

  // capturar origin
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(api);
    const data = await res.json();
    setDecants(data);
    setFiltered(data);
  }, [api]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    setFiltered(searchId
      ? decants.filter(d => d.id.toString().includes(searchId))
      : decants
    );
  }, [searchId, decants]);

  const openAdd = () => {
    setIsEditing(false);
    setForm({ id: 0, nombre: '', cantidadDisponible: 0, urlImagen: '', estado: 1 });
    setModalOpen(true);
  };
  const openEdit = (d: Decant) => {
    setIsEditing(true);
    setForm({ ...d, urlImagen: d.urlImagen ?? '' });
    setModalOpen(true);
  };
  const close = () => setModalOpen(false);
  const onChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: ['cantidadDisponible','estado'].includes(name)
        ? Number(value)
        : value
    }));
  };

  // POST -> devuelve newId
  const createDecant = async () => {
    const res = await fetch(api, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        nombre: form.nombre,
        cantidadDisponible: form.cantidadDisponible,
        urlImagen: form.urlImagen||null,
        estado: form.estado
      })
    });
    if (!res.ok) throw new Error('Error creando');
    await load();
    close();
  };

  // PUT
  const updateDecant = async () => {
    await fetch(`${api}/${form.id}`, {
      method: 'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, codigoQR: `${origin}/decants/${form.id}` })
    });
    await load();
    close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { isEditing ? await updateDecant() : await createDecant(); }
    catch (err) { alert((err as Error).message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar?')) return;
    await fetch(`${api}/${id}`,{method:'DELETE'});
    await load();
  };

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-gray-100">Decants</h1>

        <div className="flex mb-6 space-x-4">
          <input
            value={searchId}
            onChange={e=>setSearchId(e.target.value)}
            placeholder="Buscar por ID"
            className="border px-3 py-2 rounded flex-1 dark:bg-gray-800 dark:border-gray-700"
          />
          <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
            Agregar Decant
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="dark:bg-gray-700">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Creado</th>
                <th className="px-4 py-2">QR</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const qrUrl = `${origin}/decants/${d.id}`;
                return (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border px-4 py-2 text-center">{d.id}</td>
                    <td className="border px-4 py-2">{d.nombre}</td>
                    <td className="border px-4 py-2 text-center">{d.cantidadDisponible}</td>
                    <td className="border px-4 py-2 text-center">{new Date(d.fechaCreacion).toLocaleString()}</td>
                    <td className="border px-4 py-2 text-center">
                      <QRCodeCanvas value={qrUrl} size={64} />
                    </td>
                    <td className="border px-4 py-2">
                      <button onClick={()=>openEdit(d)} className="bg-yellow-500 px-3 py-1 rounded text-white mr-2">
                        Editar
                      </button>
                      <button onClick={()=>handleDelete(d.id)} className="bg-red-500 px-3 py-1 rounded text-white mr-2">
                        Eliminar
                      </button>
                      <Link href={`/decants/${d.id}`} className="bg-gray-600 px-3 py-1 rounded text-white">
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl mb-4 dark:text-gray-100">
                {isEditing ? 'Editar Decant' : 'Crear Decant'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Nombre"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  name="cantidadDisponible"
                  type="number"
                  value={form.cantidadDisponible}
                  onChange={onChange}
                  placeholder="Cantidad Disponible"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  name="urlImagen"
                  value={form.urlImagen}
                  onChange={onChange}
                  placeholder="URL Imagen"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                  name="estado"
                  value={form.estado}
                  onChange={onChange}
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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import PrivateRoutes from '@/app/components/PrivateRoutes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';

interface Decant {
  id: number;
  nombre: string;
  codigoQR: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [actionModalId, setActionModalId] = useState<number | null>(null);
  const [exportMenuId, setExportMenuId] = useState<number | null>(null);
  const [labelMenuId, setLabelMenuId] = useState<number | null>(null);
  const [form, setForm] = useState<{
    id: number;
    nombre: string;
    cantidadDisponible: number;
    urlImagen: string;
    estado: number;
    codigoQR: string;
  }>({
    id: 0,
    nombre: '',
    cantidadDisponible: 0,
    urlImagen: '',
    estado: 1,
    codigoQR: ''
  });

  // Enlace directo del logo (imgbb); debe soportar CORS
  const LOGO_URL = 'https://i.ibb.co/ycWXrFPz/Logo-Perfumeria.png';

  // Convertir cm a px (96 dpi)
  const DPI = 96;
  const PX_PER_CM = DPI / 2.54;

  const [origin, setOrigin] = useState('');
  const api = `${process.env.NEXT_PUBLIC_API_URL}/api/Decants`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const loadDecants = useCallback(async () => {
    const res = await fetch(api);
    if (!res.ok) throw new Error('Error al cargar decants');
    const data: Decant[] = await res.json();
    setDecants(data);
    setFiltered(data);
  }, [api]);

  useEffect(() => { loadDecants(); }, [loadDecants]);
  useEffect(() => {
    setFiltered(
      searchId
        ? decants.filter(d => d.id.toString().includes(searchId))
        : decants
    );
  }, [searchId, decants]);

  const openAdd = () => {
    setIsEditing(false);
    setForm({ id: 0, nombre: '', cantidadDisponible: 0, urlImagen: '', estado: 1, codigoQR: '' });
    setModalOpen(true);
  };
  const openEdit = (d: Decant) => {
    setIsEditing(true);
    setForm({ id: d.id, nombre: d.nombre, cantidadDisponible: d.cantidadDisponible, urlImagen: d.urlImagen ?? '', estado: d.estado, codigoQR: d.codigoQR });
    setModalOpen(true);
  };
  const close = () => {
    setModalOpen(false);
    setActionModalId(null);
    setExportMenuId(null);
    setLabelMenuId(null);
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: ['cantidadDisponible','estado'].includes(name) ? Number(value) : value }));
  };

  const createDecant = async () => {
    const res = await fetch(api, {
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
    const { id: newId } = await res.json() as { id: number };
    const qrUrl = `${origin}/decants/${newId}`;
    await fetch(`${api}/${newId}`, {
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
    await loadDecants();
    close();
  };

  const updateDecant = async () => {
    await fetch(`${api}/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    await loadDecants();
    close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      isEditing ? await updateDecant() : await createDecant();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este decant?')) return;
    await fetch(`${api}/${id}`, { method: 'DELETE' });
    setDecants(prev => prev.filter(d => d.id !== id));
  };

  const exportPNG = (id: number, nombre: string) => {
    const canvas = document.getElementById(`qr-canvas-${id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombre} QR.png`;
    link.click();
    setExportMenuId(null);
  };

  const exportPDF = (id: number, nombre: string) => {
    const canvas = document.getElementById(`qr-canvas-${id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const doc = new jsPDF();
    doc.addImage(url, 'PNG', 20, 20, 60, 60);
    doc.save(`${nombre} QR.pdf`);
    setExportMenuId(null);
  };

  // -------- Etiqueta 3.5cm×1.5cm --------
  const generateLabelPNG = async (id: number, nombre: string) => {
    const wCm = 3.5, hCm = 1.5;
    const width = Math.round(wCm * PX_PER_CM);
    const height = Math.round(hCm * PX_PER_CM);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // fondo blanco + borde negro
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    const padding = 4;
    const boxSize = height - padding * 2;

    // logo izquierda
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = LOGO_URL;
    await new Promise(res => logo.onload = res);
    ctx.drawImage(logo, padding, padding, boxSize, boxSize);

    // QR derecha
    const qrCanvas = document.getElementById(`qr-canvas-${id}`) as HTMLCanvasElement;
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrCanvas.toDataURL();
    await new Promise(res => qrImg.onload = res);
    ctx.drawImage(qrImg, width - padding - boxSize, padding, boxSize, boxSize);

    // texto centrado
    ctx.fillStyle = '#000';
    ctx.font = `${Math.round(boxSize * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nombre, width / 2, height / 2);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${nombre} QR Label.png`;
    link.click();
    setLabelMenuId(null);
  };

  const generateLabelPDF = async (id: number, nombre: string) => {
    const wCm = 3.5, hCm = 1.5;
    const width = Math.round(wCm * PX_PER_CM);
    const height = Math.round(hCm * PX_PER_CM);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    const padding = 4;
    const boxSize = height - padding * 2;

    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = LOGO_URL;
    await new Promise(res => logo.onload = res);
    ctx.drawImage(logo, padding, padding, boxSize, boxSize);

    const qrCanvas = document.getElementById(`qr-canvas-${id}`) as HTMLCanvasElement;
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrCanvas.toDataURL();
    await new Promise(res => qrImg.onload = res);
    ctx.drawImage(qrImg, width - padding - boxSize, padding, boxSize, boxSize);

    ctx.fillStyle = '#000';
    ctx.font = `${Math.round(boxSize * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nombre, width / 2, height / 2);

    const doc = new jsPDF({ unit: 'cm', format: [wCm, hCm] });
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, wCm, hCm);
    doc.save(`${nombre} QR Label.pdf`);
    setLabelMenuId(null);
  };
  // --------------------------------------

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Decants</h1>

        <div className="flex mb-6 space-x-4">
          <input
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Buscar por ID"
            className="flex-1 border px-3 py-2 rounded text-black"
          />
          <button onClick={openAdd} className="bg-blue-500 text-white px-4 py-2 rounded">
            Agregar Decant
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-black">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Creado</th>
                <th className="px-4 py-2">QR</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-700">
                  <td className="border px-4 py-2 text-center">{d.id}</td>
                  <td className="border px-4 py-2">{d.nombre}</td>
                  <td className="border px-4 py-2 text-center">{d.cantidadDisponible}</td>
                  <td className="border px-4 py-2 text-center">
                    {new Date(d.fechaCreacion).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {d.codigoQR && (
                      <QRCodeCanvas
                        id={`qr-canvas-${d.id}`}
                        value={d.codigoQR}
                        size={64}
                      />
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {/* **Se conservan TODOS los botones de acciones** */}
                    <div className="hidden md:flex justify-center space-x-2 relative">
                      <button onClick={() => openEdit(d)} className="bg-yellow-500 px-3 py-1 rounded text-white">Editar</button>
                      <button onClick={() => handleDelete(d.id)} className="bg-red-500 px-3 py-1 rounded text-white">Eliminar</button>
                      <Link href={`/decants/${d.id}`} className="bg-gray-600 px-3 py-1 rounded text-white">Ver</Link>
                      <button onClick={() => setExportMenuId(exportMenuId === d.id ? null : d.id)} className="bg-green-500 px-3 py-1 rounded text-white">Exportar</button>
                      {exportMenuId === d.id && (
                        <div className="absolute right-0 mt-8 w-36 bg-white rounded shadow py-1 z-50">
                          <button onClick={() => exportPNG(d.id, d.nombre)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">PNG</button>
                          <button onClick={() => exportPDF(d.id, d.nombre)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">PDF</button>
                        </div>
                      )}
                      <button onClick={() => setLabelMenuId(labelMenuId === d.id ? null : d.id)} className="bg-indigo-500 px-3 py-1 rounded text-white">Generar Etiqueta</button>
                      {labelMenuId === d.id && (
                        <div className="absolute right-0 mt-8 w-40 bg-white rounded shadow py-1 z-50">
                          <button onClick={() => generateLabelPNG(d.id, d.nombre)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">PNG</button>
                          <button onClick={() => generateLabelPDF(d.id, d.nombre)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">PDF</button>
                        </div>
                      )}
                    </div>
                    <div className="md:hidden">
                      <button onClick={() => setActionModalId(d.id)} className="bg-blue-600 px-3 py-1 rounded text-white">Ver acciones</button>
                      {actionModalId === d.id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-white p-4 rounded-lg w-full max-w-xs text-center">
                            <button onClick={() => openEdit(d)} className="w-full mb-2 bg-yellow-500 text-white py-2 rounded">Editar</button>
                            <button onClick={() => handleDelete(d.id)} className="w-full mb-2 bg-red-500 text-white py-2 rounded">Eliminar</button>
                            <Link href={`/decants/${d.id}`} className="block w-full mb-2 bg-gray-600 text-white py-2 rounded">Ver</Link>
                            <button onClick={() => exportPNG(d.id, d.nombre)} className="w-full mb-2 bg-green-500 text-white py-2 rounded">PNG</button>
                            <button onClick={() => exportPDF(d.id, d.nombre)} className="w-full mb-2 bg-green-700 text-white py-2 rounded">PDF</button>
                            <button onClick={() => generateLabelPNG(d.id, d.nombre)} className="w-full mb-2 bg-indigo-500 text-white py-2 rounded">Etiqueta PNG</button>
                            <button onClick={() => generateLabelPDF(d.id, d.nombre)} className="w-full mb-2 bg-indigo-700 text-white py-2 rounded">Etiqueta PDF</button>
                            <button onClick={close} className="w-full bg-gray-500 text-white py-2 rounded">Cerrar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md text-black">
              <h2 className="text-xl font-bold mb-4">
                {isEditing ? 'Editar Decant' : 'Crear Decant'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Nombre"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  name="cantidadDisponible"
                  type="number"
                  value={form.cantidadDisponible}
                  onChange={onChange}
                  placeholder="Cantidad Disponible"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  name="urlImagen"
                  value={form.urlImagen}
                  onChange={onChange}
                  placeholder="URL Imagen (opcional)"
                  className="w-full border px-3 py-2 rounded"
                />
                <select
                  name="estado"
                  value={form.estado}
                  onChange={onChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
                {isEditing && (
                  <input
                    name="codigoQR"
                    value={form.codigoQR}
                    onChange={onChange}
                    placeholder="URL Código QR"
                    className="w-full border px-3 py-2 rounded"
                  />
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={close}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrivateRoutes>
  );
}

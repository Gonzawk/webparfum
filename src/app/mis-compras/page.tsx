// src/app/mis-compras/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';

interface SaleDetail {
  ventaDetalleId: number;
  perfumeId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  modelo: string;
  marca: string;
}

interface Purchase {
  ventaId: number;
  fechaCompra: string;
  total: number;
  estado: string;
  adminId: number;
  adminName?: string;
  detalles: SaleDetail[];
}

const MisCompras: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);

  // Función para decodificar el JWT
  function parseJwt(token: string): unknown | null {
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

  // Obtener el ID del usuario desde el token, memoizado
  const getUserIdFromToken = useCallback((): number | null => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return null;
    const payload = parseJwt(token) as { nameid?: string; sub?: string } | null;
    return payload?.nameid ? Number(payload.nameid) : payload?.sub ? Number(payload.sub) : null;
  }, []);

  // Cargar compras al montar
  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setError('No se pudo obtener el usuario autenticado.');
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/compras/miscompras/${userId}`)
      .then((res) => res.json())
      .then((data) => setPurchases(data))
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError('Error al cargar tus compras: ' + err.message);
        } else {
          setError('Error al cargar tus compras.');
        }
      });
  }, [getUserIdFromToken]);

  const toggleDetails = (ventaId: number) => {
    setExpandedSaleId(expandedSaleId === ventaId ? null : ventaId);
  };

  return (
    <>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Mis Compras</h1>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        {purchases.length === 0 ? (
          <p className="text-center text-white">No has realizado ninguna compra.</p>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div key={purchase.ventaId} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-2 mb-4">
                  <div className="text-gray-800">
                    <p><strong>Compra ID:</strong> {purchase.ventaId}</p>
                    <p><strong>Fecha:</strong> {new Date(purchase.fechaCompra).toLocaleDateString()}</p>
                  </div>
                  <div className="text-gray-800">
                    <p><strong>Total:</strong> ${purchase.total.toFixed(2)}</p>
                    <p><strong>Estado:</strong> {purchase.estado}</p>
                  </div>
                  <div className="text-gray-800">
                    <p><strong>Administrador:</strong> {purchase.adminName ?? purchase.adminId}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <button
                      onClick={() => toggleDetails(purchase.ventaId)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      {expandedSaleId === purchase.ventaId ? 'Ocultar Detalles' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>
                {expandedSaleId === purchase.ventaId && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Detalles de la Compra:</h3>
                    {purchase.detalles.length > 0 ? (
                      <div className="space-y-4">
                        {purchase.detalles.map((detail) => (
                          <div
                            key={detail.ventaDetalleId}
                            className="flex flex-col sm:flex-row items-center border border-gray-300 rounded p-4"
                          >
                            <div className="flex-1 text-gray-800">
                              <p><strong>Producto:</strong> {detail.modelo} - {detail.marca}</p>
                              <p><strong>Cantidad:</strong> {detail.cantidad}</p>
                            </div>
                            <div className="text-gray-800">
                              <p><strong>Precio Unitario:</strong> ${detail.precioUnitario.toFixed(2)}</p>
                              <p><strong>Subtotal:</strong> ${detail.subtotal.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-800">No hay detalles disponibles.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MisCompras;

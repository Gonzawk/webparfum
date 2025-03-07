'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import PrivateRoutes from '@/app/components/PrivateRoutes';

interface SaleDetail {
  ventaDetalleId: number;
  perfumeId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Sale {
  ventaId: number;
  usuarioId: number;
  adminId: number;
  adminName?: string; // Se espera que el endpoint retorne el nombre del admin (opcional)
  fechaCompra: string;
  total: number;
  estado: string;
  detalles: SaleDetail[];
}

const Ventas: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
  const [visibleSalesCount, setVisibleSalesCount] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'ventas' | 'asignadas'>('ventas');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // Función para decodificar el JWT y obtener el payload
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

  // Función para obtener el ID y el rol del usuario del token
  const getUserDataFromToken = useCallback((): { id: number | null; role: string } => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return { id: null, role: '' };
    const payload = parseJwt(token) as { nameid?: string; sub?: string; role?: string } | null;
    const id = payload?.nameid ? Number(payload.nameid) : payload?.sub ? Number(payload.sub) : null;
    const role = payload?.role || '';
    return { id, role };
  }, []);

  useEffect(() => {
    const { id, role } = getUserDataFromToken();
    setCurrentUserId(id);
    setUserRole(role);
    // Si el usuario no es Superadmin, forzamos la pestaña "Ventas Asignadas"
    if (role !== 'Superadmin') {
      setActiveTab('asignadas');
    }
    fetch('https://wksolutions.somee.com/api/ventas/lista')
      .then((res) => res.json())
      .then((data) => setSales(data))
      .catch((err) => setError('Error al cargar las ventas: ' + (err instanceof Error ? err.message : err)));
  }, [getUserDataFromToken]);

  const toggleSaleDetails = (ventaId: number) => {
    setExpandedSaleId(expandedSaleId === ventaId ? null : ventaId);
  };

  const handleLoadMore = () => {
    setVisibleSalesCount(sales.length);
  };

  // Ventas asignadas: filtrar aquellas cuyo adminId coincide con el ID del usuario logueado
  const assignedSales = currentUserId !== null ? sales.filter(sale => sale.adminId === currentUserId) : [];
  // La pestaña "Ventas" muestra todas las ventas (solo para Superadmin) y "Ventas Asignadas" para Admin
  const salesToDisplay = activeTab === 'ventas' ? sales.slice(0, visibleSalesCount) : assignedSales;

  // Función para confirmar o finalizar la venta según el estado actual
  const confirmSale = async (ventaId: number, currentEstado: string) => {
    if (!currentUserId) return;
    let endpoint = `https://wksolutions.somee.com/api/ventas/${ventaId}/confirmar?adminId=${currentUserId}`;
    if (currentEstado.toLowerCase() === 'confirmado') {
      endpoint = `https://wksolutions.somee.com/api/ventas/${ventaId}/finalizar?adminId=${currentUserId}`;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setSales(prev =>
          prev.map(sale =>
            sale.ventaId === ventaId
              ? { ...sale, estado: currentEstado.toLowerCase() === 'confirmado' ? 'Completado' : 'Confirmado' }
              : sale
          )
        );
        setPurchaseMessage(
          data.Message ||
            (currentEstado.toLowerCase() === 'confirmado'
              ? 'Venta finalizada exitosamente.'
              : 'Venta confirmada exitosamente.')
        );
        // Ocultar el mensaje automáticamente después de 5 segundos
        setTimeout(() => {
          setPurchaseMessage('');
        }, 5000);
      } else {
        const msg = await res.text();
        setPurchaseMessage(`Error confirmando venta: ${msg}`);
        setTimeout(() => {
          setPurchaseMessage('');
        }, 5000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPurchaseMessage(`Error en la solicitud: ${err.message}`);
      } else {
        setPurchaseMessage("Error en la solicitud.");
      }
      setTimeout(() => {
        setPurchaseMessage('');
      }, 5000);
    }
  };

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Ventas</h1>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        {purchaseMessage && (
          <div className="mb-4 p-2 bg-blue-100 border border-blue-400 rounded text-blue-800 text-center">
            {purchaseMessage}
          </div>
        )}
        <div className="flex justify-center space-x-4 mb-4">
          {userRole === 'Superadmin' && (
            <button
              onClick={() => setActiveTab('ventas')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'ventas' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              Ventas
            </button>
          )}
          <button
            onClick={() => setActiveTab('asignadas')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === 'asignadas' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            Ventas Asignadas
          </button>
        </div>
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {/* Encabezados fijos */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-4 font-bold border-b pb-2 text-black">
            <div className="hidden sm:block">Venta ID</div>
            <div className="block sm:hidden">ID</div>
            <div className="hidden sm:block">Fecha</div>
            <div className="hidden sm:block">Total</div>
            <div className="hidden sm:block">Estado</div>
            <div className="hidden sm:block">Administrador</div>
            <div className="hidden sm:block">Acciones</div>
            <div className="sm:hidden">Resumen</div>
          </div>
          {/* Listado de ventas */}
          {salesToDisplay.length === 0 ? (
            <p className="text-black text-center">
              {activeTab === 'ventas'
                ? 'No se encontraron ventas.'
                : 'No tienes ventas asignadas.'}
            </p>
          ) : (
            salesToDisplay.map((sale) => (
              <div key={sale.ventaId} className="border-b py-2">
                {/* Vista para pantallas grandes */}
                <div className="hidden sm:grid grid-cols-7 gap-4 items-center text-black">
                  <div className="text-center">{sale.ventaId}</div>
                  <div className="text-center">{new Date(sale.fechaCompra).toLocaleDateString()}</div>
                  <div className="text-center">${sale.total.toFixed(2)}</div>
                  <div className="text-center">{sale.estado}</div>
                  <div className="text-center">{sale.adminName ? sale.adminName : sale.adminId}</div>
                  <div className="text-center flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => toggleSaleDetails(sale.ventaId)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      {expandedSaleId === sale.ventaId ? 'Ocultar Detalles' : 'Ver Detalles'}
                    </button>
                    {activeTab === 'asignadas' &&
                      (sale.estado.toLowerCase() === 'pendiente' || sale.estado.toLowerCase() === 'confirmado') && (
                        <button
                          onClick={() => confirmSale(sale.ventaId, sale.estado)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          {sale.estado.toLowerCase() === 'confirmado' ? 'Cerrar Venta' : 'Confirmar'}
                        </button>
                      )}
                  </div>
                </div>
                {/* Vista para pantallas móviles */}
                <div className="sm:hidden flex flex-col text-black">
                  <div className="flex justify-between items-center">
                    <span>
                      <strong>ID:</strong> {sale.ventaId}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleSaleDetails(sale.ventaId)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        {expandedSaleId === sale.ventaId ? 'Ocultar' : 'Ver'}
                      </button>
                      {activeTab === 'asignadas' &&
                        (sale.estado.toLowerCase() === 'pendiente' || sale.estado.toLowerCase() === 'confirmado') && (
                          <button
                            onClick={() => confirmSale(sale.ventaId, sale.estado)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            {sale.estado.toLowerCase() === 'confirmado' ? 'Cerrar Venta' : 'Confirmar'}
                          </button>
                        )}
                    </div>
                  </div>
                  <div className="mt-1 text-sm">
                    <p>
                      <strong>Fecha:</strong> {new Date(sale.fechaCompra).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Total:</strong> ${sale.total.toFixed(2)}
                    </p>
                    <p>
                      <strong>Estado:</strong> {sale.estado}
                    </p>
                    <p>
                      <strong>Admin:</strong> {sale.adminName ? sale.adminName : sale.adminId}
                    </p>
                  </div>
                </div>
                {expandedSaleId === sale.ventaId && (
                  <div className="mt-2 ml-4 border-t pt-2">
                    <h3 className="font-bold mb-2 text-black">Detalles de Venta:</h3>
                    {sale.detalles && sale.detalles.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left mt-2 text-black">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-3 py-1 border">Producto ID</th>
                              <th className="px-3 py-1 border">Cantidad</th>
                              <th className="px-3 py-1 border">Precio Unitario</th>
                              <th className="px-3 py-1 border">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.detalles.map((detail) => (
                              <tr key={detail.ventaDetalleId} className="hover:bg-gray-100">
                                <td className="px-3 py-1 border text-center">{detail.perfumeId}</td>
                                <td className="px-3 py-1 border text-center">{detail.cantidad}</td>
                                <td className="px-3 py-1 border text-center">${detail.precioUnitario.toFixed(2)}</td>
                                <td className="px-3 py-1 border text-center">${detail.subtotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-black">No hay detalles disponibles.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          {activeTab === 'ventas' && sales.length > visibleSalesCount && (
            <div className="text-center mt-4">
              <button onClick={handleLoadMore} className="bg-green-500 text-white px-4 py-2 rounded">
                Ver Más
              </button>
            </div>
          )}
        </div>
      </div>
    </PrivateRoutes>
  );
};

export default Ventas;

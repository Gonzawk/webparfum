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
  perfumeName?: string;
  marca?: string;
}

interface Sale {
  ventaId: number;
  usuarioId: number;
  adminId: number;
  clienteName?: string; // Para Admin: nombre del cliente
  adminName?: string;   // Para Superadmin: nombre del administrador
  fechaCompra: string;
  total: number;
  estado: string;
  detalles: SaleDetail[];
}

const Ventas: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
  const [actionMenuSaleId, setActionMenuSaleId] = useState<number | null>(null);
  const [visibleSalesCount, setVisibleSalesCount] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'ventas' | 'asignadas'>('ventas');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Decodificar JWT
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

  // Obtener datos del usuario
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
    // Si no es Superadmin, se usa el endpoint "lista-completa", de lo contrario "lista"
    const endpoint =
      role !== 'Superadmin'
        ? (setActiveTab('asignadas'), `${process.env.NEXT_PUBLIC_API_URL}/api/ventas/lista-completa`)
        : `${process.env.NEXT_PUBLIC_API_URL}/api/ventas/lista`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setSales(data))
      .catch((err) =>
        setError('Error al cargar las ventas: ' + (err instanceof Error ? err.message : err))
      );
  }, [getUserDataFromToken]);

  const toggleSaleDetails = (ventaId: number) => {
    setExpandedSaleId(expandedSaleId === ventaId ? null : ventaId);
  };

  const handleLoadMore = () => {
    setVisibleSalesCount(sales.length);
  };

  // Función para confirmar/finalizar ventas
  const confirmSale = async (ventaId: number, currentEstado: string) => {
    if (!currentUserId) return;
    let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/ventas/${ventaId}/confirmar?adminId=${currentUserId}`;
    if (currentEstado.toLowerCase() === 'confirmado') {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/ventas/${ventaId}/finalizar?adminId=${currentUserId}`;
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
        setTimeout(() => setPurchaseMessage(''), 5000);
      } else {
        const msg = await res.text();
        setPurchaseMessage(`Error confirmando venta: ${msg}`);
        setTimeout(() => setPurchaseMessage(''), 5000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPurchaseMessage(`Error en la solicitud: ${err.message}`);
      } else {
        setPurchaseMessage("Error en la solicitud.");
      }
      setTimeout(() => setPurchaseMessage(''), 5000);
    }
  };

  // Función para cancelar venta (cambia estado a 'Cancelado')
  const cancelSale = async (ventaId: number) => {
    if (!currentUserId) return;
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/ventas/${ventaId}/cancelar?adminId=${currentUserId}`;
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setSales(prev =>
          prev.map(sale =>
            sale.ventaId === ventaId ? { ...sale, estado: 'Cancelado' } : sale
          )
        );
        setPurchaseMessage(data.Message || 'Venta cancelada exitosamente y stock actualizado.');
        setTimeout(() => setPurchaseMessage(''), 5000);
      } else {
        const msg = await res.text();
        setPurchaseMessage(`Error cancelando venta: ${msg}`);
        setTimeout(() => setPurchaseMessage(''), 5000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPurchaseMessage(`Error en la solicitud: ${err.message}`);
      } else {
        setPurchaseMessage("Error en la solicitud.");
      }
      setTimeout(() => setPurchaseMessage(''), 5000);
    }
  };

  // Función para eliminar venta (para ventas canceladas)
  const eliminarVenta = async (ventaId: number) => {
    if (!currentUserId) return;
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/ventas/${ventaId}/eliminar`;
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setSales(prev => prev.filter(sale => sale.ventaId !== ventaId));
        setPurchaseMessage(data.Message || 'Venta eliminada exitosamente.');
        setTimeout(() => setPurchaseMessage(''), 5000);
      } else {
        const msg = await res.text();
        setPurchaseMessage(`Error eliminando venta: ${msg}`);
        setTimeout(() => setPurchaseMessage(''), 5000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPurchaseMessage(`Error en la solicitud: ${err.message}`);
      } else {
        setPurchaseMessage("Error en la solicitud.");
      }
      setTimeout(() => setPurchaseMessage(''), 5000);
    }
  };

  // Filtrado de ventas
  const assignedSales = currentUserId !== null ? sales.filter(sale => sale.adminId === currentUserId) : [];
  const baseSales = activeTab === 'ventas' ? sales : assignedSales;

  const filteredSales = baseSales.filter(sale => {
    const nameField = userRole === 'Superadmin'
      ? sale.adminName || sale.adminId.toString()
      : sale.clienteName || sale.usuarioId.toString();
    if (filterName && !nameField.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterEstado && sale.estado.toLowerCase() !== filterEstado.toLowerCase()) return false;
    const saleDate = new Date(sale.fechaCompra);
    if (filterStartDate && saleDate < new Date(filterStartDate)) return false;
    if (filterEndDate && saleDate > new Date(filterEndDate)) return false;
    return true;
  });

  const salesToDisplay = filteredSales.slice(0, visibleSalesCount);

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

        {/* Sección de filtros */}
        <div className="max-w-7xl mx-auto bg-white rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-black">
                {userRole === 'Superadmin' ? 'Administrador' : 'Nombre de Usuario'}
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md bg-white text-black"
                placeholder="Buscar..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md bg-white text-black"
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Fecha Inicio</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Fecha Fin</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md bg-white text-black"
              />
            </div>
          </div>
        </div>

        {/* Lista de ventas */}
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {/* Encabezados fijos */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 font-bold border-b pb-2 text-black">
            <div className="hidden sm:block">Venta ID</div>
            <div className="block sm:hidden">ID</div>
            <div className="hidden sm:block">Fecha</div>
            <div className="hidden sm:block">Total</div>
            <div className="hidden sm:block">Estado</div>
            <div className="hidden sm:block">
              {userRole === 'Superadmin' ? 'Administrador' : 'Cliente'}
            </div>
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
                <div className="hidden sm:block">
                  <div className="grid grid-cols-6 gap-4 items-center text-black">
                    <div className="text-center">{sale.ventaId}</div>
                    <div className="text-center">{new Date(sale.fechaCompra).toLocaleDateString()}</div>
                    <div className="text-center">${sale.total.toFixed(2)}</div>
                    <div className="text-center">{sale.estado}</div>
                    <div className="text-center">
                      {userRole === 'Superadmin'
                        ? sale.adminName ? sale.adminName : sale.adminId
                        : sale.clienteName ? sale.clienteName : sale.usuarioId}
                    </div>
                    <div className="text-center">
                      <button
                        onClick={() =>
                          setActionMenuSaleId(
                            actionMenuSaleId === sale.ventaId ? null : sale.ventaId
                          )
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded whitespace-nowrap"
                      >
                        {actionMenuSaleId === sale.ventaId ? 'Dejar acciones' : 'Ver acciones'}
                      </button>
                    </div>
                  </div>
                  {actionMenuSaleId === sale.ventaId && (
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => toggleSaleDetails(sale.ventaId)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        {expandedSaleId === sale.ventaId ? 'Cerrar' : 'Ver Detalles'}
                      </button>
                      {sale.estado.toLowerCase() !== 'cancelado' && (
                        <>
                          {(sale.estado.toLowerCase() === 'pendiente' ||
                            sale.estado.toLowerCase() === 'confirmado') && (
                            <>
                              <button
                                onClick={() => {
                                  confirmSale(sale.ventaId, sale.estado);
                                  setActionMenuSaleId(null);
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                              >
                                {sale.estado.toLowerCase() === 'confirmado'
                                  ? 'Cerrar Venta'
                                  : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => {
                                  cancelSale(sale.ventaId);
                                  setActionMenuSaleId(null);
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {/* Mostrar el botón "Eliminar Venta" si el estado es 'cancelado' y el usuario es Superadmin o si está en la pestaña asignadas */}
                      {(sale.estado.toLowerCase() === 'cancelado' && (activeTab === 'asignadas' || userRole === 'Superadmin')) && (
                        <button
                          onClick={() => {
                            eliminarVenta(sale.ventaId);
                            setActionMenuSaleId(null);
                          }}
                          className="bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Eliminar Venta
                        </button>
                      )}
                    </div>
                  )}
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
                      {sale.estado.toLowerCase() !== 'cancelado' && (
                        <>
                          {(sale.estado.toLowerCase() === 'pendiente' ||
                            sale.estado.toLowerCase() === 'confirmado') && (
                            <>
                              <button
                                onClick={() => confirmSale(sale.ventaId, sale.estado)}
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                              >
                                {sale.estado.toLowerCase() === 'confirmado'
                                  ? 'Cerrar'
                                  : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => cancelSale(sale.ventaId)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {(sale.estado.toLowerCase() === 'cancelado' && (activeTab === 'asignadas' || userRole === 'Superadmin')) && (
                        <button
                          onClick={() => eliminarVenta(sale.ventaId)}
                          className="bg-red-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Eliminar Venta
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
                      <strong>{userRole === 'Superadmin' ? 'Administrador' : 'Cliente'}:</strong>{' '}
                      {userRole === 'Superadmin'
                        ? sale.adminName ? sale.adminName : sale.adminId
                        : sale.clienteName ? sale.clienteName : sale.usuarioId}
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
                              {(userRole === 'Superadmin' || userRole === 'Admin') ? (
                                <>
                                  <th className="px-3 py-1 border">Producto</th>
                                  <th className="px-3 py-1 border">Marca</th>
                                </>
                              ) : (
                                <th className="px-3 py-1 border">Producto ID</th>
                              )}
                              <th className="px-3 py-1 border">Cantidad</th>
                              <th className="px-3 py-1 border">Precio Unitario</th>
                              <th className="px-3 py-1 border">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.detalles.map((detail) => (
                              <tr key={detail.ventaDetalleId} className="hover:bg-gray-100">
                                {(userRole === 'Superadmin' || userRole === 'Admin') ? (
                                  <>
                                    <td className="px-3 py-1 border text-center">{detail.perfumeName}</td>
                                    <td className="px-3 py-1 border text-center">{detail.marca}</td>
                                  </>
                                ) : (
                                  <td className="px-3 py-1 border text-center">{detail.perfumeId}</td>
                                )}
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
          {activeTab === 'ventas' && filteredSales.length > visibleSalesCount && (
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

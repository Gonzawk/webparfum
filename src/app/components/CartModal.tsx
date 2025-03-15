'use client';

import React, { useEffect, useState } from "react";
import { useCart, CartItem } from "@/app/context/CartContext";
import Image from "next/image";

export interface CartModalProps {
  onClose: () => void;
}

interface Admin {
  usuarioId: number;
  nombreCompleto: string;
  email: string;
}

const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { cart, removeFromCart, clearCart, updateCartItemQuantity } = useCart();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Función para mostrar toast
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Cargar administradores desde el endpoint
  useEffect(() => {
    fetch("https://wksolutions.somee.com/api/Ventas/admins")
      .then((res) => res.json())
      .then((data: Admin[]) => {
        setAdmins(data);
        if (data.length > 0) {
          setSelectedAdminId(data[0].usuarioId);
        }
      })
      .catch((err) => console.error("Error fetching admins:", err));
  }, []);

  // Función para calcular el total del carrito
  const calculateTotal = () => {
    return cart.reduce(
      (acc: number, item: CartItem) =>
        acc + item.quantity * item.product.precioMinorista,
      0
    );
  };

  // Función para actualizar la cantidad de un producto
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(productId, newQuantity);
  };

  // Función para decodificar el JWT y extraer el ID del usuario
  function parseJwt(token: string): unknown | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((_char) => '%' + ('00' + _char.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return null;
    const payload = parseJwt(token) as { nameid?: string; sub?: string } | null;
    return payload?.nameid ? Number(payload.nameid) : payload?.sub ? Number(payload.sub) : null;
  };

  // Función para confirmar la compra
  const handleConfirmPurchase = async () => {
    setPurchaseMessage("");
    const usuarioId = getUserIdFromToken();
    if (!usuarioId) {
      setPurchaseMessage("No se pudo obtener el usuario.");
      return;
    }
    if (!selectedAdminId) {
      setPurchaseMessage("Por favor, seleccione un administrador.");
      return;
    }
    const payload = {
      usuarioId: usuarioId,
      adminId: selectedAdminId,
      items: cart.map((item) => ({
        perfumeId: item.product.perfumeId,
        cantidad: item.quantity,
        precioUnitario: item.product.precioMinorista,
      })),
    };

    try {
      const res = await fetch("https://wksolutions.somee.com/api/ventas/confirmar-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        // Asigna el mensaje recibido tal cual
        setPurchaseMessage(data.message);
        // Si el mensaje no menciona stock, se considera que la compra fue exitosa y se limpia el carrito
        if (!data.message.toLowerCase().includes("stock")) {
          clearCart();
        }
      } else {
        const msg = await res.text();
        setPurchaseMessage(`Error confirmando compra: ${msg}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPurchaseMessage(`Error en la solicitud: ${err.message}`);
      } else {
        setPurchaseMessage("Error en la solicitud.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast de confirmación para eliminación o vaciado */}
        {showToast && toastMessage && (
          <div className="mb-4 p-2 bg-green-100 border border-green-400 rounded text-green-800 text-center">
            {toastMessage}
          </div>
        )}
        {/* Mensaje de confirmación de compra o error */}
        {purchaseMessage && (
          <div className="mb-4 p-2 bg-blue-100 border border-blue-400 rounded text-blue-800 text-center">
            {purchaseMessage}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Tu Carrito</h2>
        {cart.length === 0 ? (
          <p className="text-black text-center">Tu carrito está vacío.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item: CartItem) => (
              <div
                key={item.product.perfumeId}
                className="flex flex-col sm:flex-row items-center border border-gray-300 rounded p-4"
              >
                <div className="w-16 h-16 flex-shrink-0 relative">
                  {item.product.imagenUrl ? (
                    <Image
                      src={item.product.imagenUrl}
                      alt={item.product.modelo}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm text-gray-500">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow sm:ml-4 mt-2 sm:mt-0">
                  <h3 className="text-lg font-bold text-black">{item.product.modelo}</h3>
                  <p className="text-sm text-black">Precio: ${item.product.precioMinorista.toFixed(2)}</p>
                  <p className="text-sm text-black">
                    Subtotal: ${(item.quantity * item.product.precioMinorista).toFixed(2)}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.product.perfumeId, Number(e.target.value))
                    }
                    className="w-16 border rounded text-black px-1 py-0.5"
                  />
                  <button
                    onClick={() => {
                      removeFromCart(item.product.perfumeId);
                      showToastMessage("Producto eliminado correctamente.");
                    }}
                    className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-right font-bold text-black">
          Total: ${calculateTotal().toFixed(2)}
        </div>
        {/* Sección para seleccionar el administrador */}
        <div className="mt-4">
          <label className="block text-black mb-1">Asignar un Administrador:</label>
          <select
            value={selectedAdminId || ""}
            onChange={(e) => setSelectedAdminId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-4 py-2 text-black"
          >
            {admins.map((admin) => (
              <option key={admin.usuarioId} value={admin.usuarioId}>
                {admin.nombreCompleto} ({admin.email})
              </option>
            ))}
          </select>
        </div>
        {/* Botones finales */}
        <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleConfirmPurchase}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Realizar Pedido
          </button>
          <button
            onClick={() => {
              clearCart();
              showToastMessage("Carrito vaciado correctamente.");
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Vaciar Carrito
          </button>
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;

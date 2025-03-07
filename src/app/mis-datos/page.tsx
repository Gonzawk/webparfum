'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  emailVerificado: boolean;
}

const MisDatos: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Función para decodificar el JWT (igual que en el Navbar)
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

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setError("No se encontró token. Por favor, inicia sesión.");
      return;
    }
    const payload = parseJwt(token);
    // Usamos "nameid" (o "sub", según tu configuración) para obtener el identificador
    const userId = payload
      ? ((payload as { nameid?: string; sub?: string }).nameid ||
         (payload as { nameid?: string; sub?: string }).sub)
      : null;
    if (!userId) {
      setError("Token inválido.");
      return;
    }
    fetch(`https://wksolutions.somee.com/api/usuarios/misdatos/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setNombreCompleto(data.nombreCompleto);
        setEmail(data.email);
      })
      .catch((err) => setError("Error al cargar los datos: " + err.message));
  }, [router]);

  const handleSave = async () => {
    setError('');
    if (!nombreCompleto || !email) {
      setError('El nombre y correo son requeridos.');
      return;
    }
    const payload = {
      usuarioId: userData?.usuarioId,
      nombreCompleto,
      newEmail: email
    };
    try {
      const res = await fetch(`https://wksolutions.somee.com/api/usuarios/misdatos/${userData?.usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Datos actualizados correctamente");
        setIsEditing(false);
        setUserData({ ...userData!, nombreCompleto, email });
      } else {
        const msg = await res.text();
        setError("Error actualizando datos: " + msg);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Error en la solicitud: " + err.message);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Mis Datos</h1>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        {userData ? (
          <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow">
            {isEditing ? (
              <>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-800 font-medium">Nombre Completo</label>
                  <input
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-800 font-medium">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Guardar
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-lg text-gray-800">
                  <strong>Nombre:</strong> {userData.nombreCompleto}
                </p>
                <p className="text-lg text-gray-800">
                  <strong>Email:</strong> {userData.email}
                </p>
                <p className="text-lg text-gray-800">
                  <strong>Email Verificado:</strong> {userData.emailVerificado ? 'Sí' : 'No'}
                </p>
                <div className="flex justify-around mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Modificar Datos
                  </button>
                  <Link
                    href="/cambiar-contrasena"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Cambiar Contraseña
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-white">Cargando datos...</p>
        )}
      </div>
    </>
  );
};

export default MisDatos;

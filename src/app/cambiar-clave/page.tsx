'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

const CambiarClave: React.FC = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Usuarios/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, newPassword }),
      });

      if (res.ok) {
        setMensaje('¡Contraseña actualizada correctamente! Serás redirigido a iniciar sesión en 10 segundos.');
        setTimeout(() => {
          router.push('/login');
        }, 10000);
      } else {
        const data = await res.text();
        setError('Error al actualizar la contraseña: ' + data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error en la solicitud: ' + err.message);
      } else {
        setError('Error en la solicitud.');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Cambiar Contraseña</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-gray-800 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Cambiar Contraseña
          </h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {mensaje && <p className="text-green-500 text-sm mb-4">{mensaje}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-black font-medium mb-2">
                Código de Recuperación
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full p-3 border border-black rounded focus:outline-none focus:ring focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-black font-medium mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-3 border border-black rounded focus:outline-none focus:ring focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-black font-medium mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border border-black rounded focus:outline-none focus:ring focus:border-blue-500 text-black"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-black">
              ¿Recordaste tu contraseña?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CambiarClave;

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

const RestablecerClave: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Función para validar el formato del email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://www.perfumesadoss.com/api/Usuarios/solicitarRecuperacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        const data: string = await res.text();
        // Mostramos el mensaje textual devuelto por la API
        setSuccess(data);
      } else {
        const dataText = await res.text();
        setError('Error al solicitar restablecimiento: ' + dataText);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        setError('Error en la conexión: ' + err.message);
      } else {
        console.error(err);
        setError('Error en la conexión.');
      }
    }
    setLoading(false);
  };

  const handleProceed = (): void => {
    router.push(`/cambiar-clave?email=${encodeURIComponent(email)}`);
  };

  return (
    <>
      <Head>
        <title>Restablecer Contraseña</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-gray-800 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Restablecer Contraseña
          </h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-black font-medium mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-black rounded focus:outline-none focus:ring focus:border-blue-500 text-black"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
            >
              {loading ? 'Enviando...' : 'Restablecer'}
            </button>
          </form>
          {success && (
            <div className="mt-4 text-center">
              <p className="text-green-500 text-sm mb-2">{success}</p>
              <button
                onClick={handleProceed}
                className="text-blue-500 hover:underline font-medium"
              >
                Recibí mi Código
              </button>
            </div>
          )}
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

export default RestablecerClave;

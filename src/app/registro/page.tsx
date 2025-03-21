'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Head from 'next/head';

const Registro: React.FC = () => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas deben ser idénticas.');
      return;
    }

    const body = {
      nombreCompleto,
      email,
      password
    };

    try {
      const response = await fetch('https://www.perfumesadoss.com/api/Usuarios/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(`Error en el registro: ${errorMessage}`);
        return;
      }

      const result = await response.json();
      console.log('Usuario registrado:', result);
      // Limpia los campos
      setNombreCompleto('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      // Muestra el modal de confirmación
      setShowModal(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  return (
    <>
      <Head>
        <title>Registrarse</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-gray-800 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">Registrarse</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleRegistro} className="space-y-4">
            <div>
              <label htmlFor="nombreCompleto" className="block text-black font-medium mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombreCompleto"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
                className="w-full border border-black rounded px-3 py-2 text-black focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
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
                className="w-full border border-black rounded px-3 py-2 text-black focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-black font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 border border-black rounded px-3 py-2 pr-10 text-black focus:outline-none focus:ring focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-black font-medium mb-2">
                Repetir Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-10 border border-black rounded px-3 py-2 pr-10 text-black focus:outline-none focus:ring focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
            >
              Registrarse
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-black">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-auto text-center">
            <img
              src="https://i.ibb.co/bgVxMWhC/confirmation-1152155-960-720.webp"
              alt="Confirmación"
              className="w-24 h-24 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-black mb-4">
              Usuario Registrado.
            </h2>
            <p className="text-black mb-4">
              Verifique su correo para poder ingresar a su cuenta.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Registro;

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

const Registro: React.FC = () => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Arma el cuerpo de la solicitud
    const body = {
      nombreCompleto,
      email,
      password
    };

    try {
      // Llamada al endpoint de tu API ASP.NET Core
      const response = await fetch('http://localhost:5200/api/Usuarios/register', {
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
      // Muestra un mensaje de éxito, limpia campos o redirige a otra página
      alert(`Registro exitoso. ID de usuario: ${result.UsuarioId}`);
    } catch (err: any) {
      setError(`Error en la solicitud: ${err.message}`);
    }
  };

  return (
    <>
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
                  {/* Íconos para mostrar/ocultar */}
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
                  {/* Íconos para mostrar/ocultar */}
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
    </>
  );
};

export default Registro;

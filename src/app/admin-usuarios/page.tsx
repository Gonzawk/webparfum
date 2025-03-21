'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
// Se eliminó el import de Link, ya que no se usa
import PrivateRoutes from '@/app/components/PrivateRoutes';
import Image from 'next/image'; // Se agregó para optimizar la imagen

interface Usuario {
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  emailVerificado: boolean;
  fechaRegistro: string;
  rol: string;
}

interface NewUsuario {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: string; // se enviará como roleName en el payload
}

const Usuarios: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'listado' | 'agregar'>('listado');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filterRol, setFilterRol] = useState<string>('Todos');
  const [newUsuario, setNewUsuario] = useState<NewUsuario>({
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'Usuario'
  });
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Roles disponibles
  const rolesDisponibles = ['Usuario', 'Admin', 'Superadmin'];

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetch('https://www.perfumesadoss.com/api/usuarios')
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error('Error fetching usuarios', err));
  }, []);

  // Filtrar usuarios por rol
  const usuariosFiltrados =
    filterRol === 'Todos'
      ? usuarios
      : usuarios.filter((u) => u.rol === filterRol);

  // Función para mostrar toast
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Función para borrar un usuario
  const handleDeleteUsuario = async (id: number) => {
    try {
      const res = await fetch(`https://www.perfumesadoss.com/api/usuarios/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsuarios((prev) => prev.filter((u) => u.usuarioId !== id));
        showToastMessage("Usuario eliminado correctamente.");
      } else {
        const msg = await res.text();
        setError(`Error eliminando usuario: ${msg}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  // Función para agregar un nuevo usuario usando el endpoint createByAdmin
  const handleAddUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nombreCompleto: newUsuario.nombreCompleto,
        email: newUsuario.email,
        password: newUsuario.password,
        roleName: newUsuario.rol
      };
      const res = await fetch('https://www.perfumesadoss.com/api/Usuarios/createByAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const usuarioAgregado = await res.json();
        setUsuarios((prev) => [
          ...prev,
          { 
            usuarioId: usuarioAgregado.usuarioId, 
            nombreCompleto: newUsuario.nombreCompleto, 
            email: newUsuario.email, 
            emailVerificado: true, 
            fechaRegistro: new Date().toISOString(), 
            rol: newUsuario.rol 
          }
        ]);
        setNewUsuario({
          nombreCompleto: '',
          email: '',
          password: '',
          rol: 'Usuario'
        });
        setError('');
        showToastMessage("Usuario creado exitosamente.");
      } else {
        const msg = await res.text();
        setError(`Error agregando usuario: ${msg}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-800 min-h-screen relative">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Usuarios</h1>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg px-6 py-4 z-50">
            <div className="flex items-center">
              <Image
                src="https://i.ibb.co/bgVxMWhC/confirmation-1152155-960-720.webp"
                alt="Confirmación"
                width={40}
                height={40}
                className="w-10 h-10 mr-3"
              />
              <p className="text-gray-800">{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Navbar secundario para secciones */}
        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => setActiveSection('listado')}
            className={`px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white ${
              activeSection === 'listado'
                ? 'border border-white'
                : 'border border-transparent hover:border-white'
            }`}
          >
            Listado
          </button>
          <button
            onClick={() => setActiveSection('agregar')}
            className={`px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-white ${
              activeSection === 'agregar'
                ? 'border border-white'
                : 'border border-transparent hover:border-white'
            }`}
          >
            Agregar Usuario
          </button>
        </div>

        {activeSection === 'listado' && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Listado de Usuarios</h2>
              <div className="mt-4 md:mt-0">
                <label className="mr-2 text-gray-800 font-medium">Filtrar por Rol:</label>
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-gray-800"
                >
                  <option value="Todos">Todos</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {usuariosFiltrados.length === 0 ? (
                <p className="text-gray-800">No se encontraron usuarios.</p>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <div key={usuario.usuarioId} className="border-b pb-2 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <p className="text-gray-800">
                        <strong>ID:</strong> {usuario.usuarioId}
                      </p>
                      <p className="text-gray-800">
                        <strong>Nombre:</strong> {usuario.nombreCompleto}
                      </p>
                      <p className="text-gray-800">
                        <strong>Email:</strong> {usuario.email}
                      </p>
                      <p className="text-gray-800">
                        <strong>Email Verificado:</strong> {usuario.emailVerificado ? 'Sí' : 'No'}
                      </p>
                      <p className="text-gray-800">
                        <strong>Fecha de Registro:</strong> {new Date(usuario.fechaRegistro).toLocaleDateString()}
                      </p>
                      <p className="text-gray-800">
                        <strong>Rol:</strong> {usuario.rol}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0 space-x-2">
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => handleDeleteUsuario(usuario.usuarioId)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'agregar' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nuevo Usuario</h2>
            <form onSubmit={handleAddUsuario} className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-800">Nombre Completo</label>
                <input
                  type="text"
                  value={newUsuario.nombreCompleto}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, nombreCompleto: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-800">Correo Electrónico</label>
                <input
                  type="email"
                  value={newUsuario.email}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-800">Contraseña</label>
                <input
                  type="password"
                  value={newUsuario.password}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, password: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-800">Rol</label>
                <select
                  value={newUsuario.rol}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, rol: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2 text-gray-800"
                  required
                >
                  {rolesDisponibles.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded">
                Agregar Usuario
              </button>
            </form>
          </div>
        )}

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </div>
    </PrivateRoutes>
  );
};

export default Usuarios;

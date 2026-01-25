'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Marca } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

export default function NuevoModelo() {
  const [nombre, setNombre] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkAuth = () => {
    if (!isClient) return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  useEffect(() => {
    if (isClient) {
      checkAuth();
      loadMarcas();
    }
  }, [isClient]);

  const loadMarcas = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/marcas/`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMarcas(data);
      }
    } catch (err) {
      setError('Error al cargar las marcas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/modelos/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nombre,
          marca_id: parseInt(marcaId),
        }),
      });

      if (response.ok) {
        router.push('/admin/modelos');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al crear el modelo');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/modelos" className="text-blue-600 hover:text-blue-800">
                ← Volver a Modelos
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Modelo</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700">
                  Marca *
                </label>
                <select
                  id="marca_id"
                  name="marca_id"
                  required
                  value={marcaId}
                  onChange={(e) => setMarcaId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del Modelo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej: Corolla, Focus, Serie 3..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/modelos"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
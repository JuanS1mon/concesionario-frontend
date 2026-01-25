'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Modelo, Marca } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

export default function EditarModelo() {
  const [nombre, setNombre] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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
      loadModelo();
    }
  }, [isClient, id]);

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
      console.error('Error loading marcas:', err);
    }
  };

  const loadModelo = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/modelos/${id}/`, { headers });
      if (response.ok) {
        const modelo: Modelo = await response.json();
        setNombre(modelo.nombre);
        setMarcaId(modelo.marca_id.toString());
      } else {
        setError('Error al cargar el modelo');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoadingData(false);
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

      const response = await fetch(`${API_BASE_URL}/modelos/${id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nombre,
          marca_id: parseInt(marcaId)
        }),
      });

      if (response.ok) {
        router.push('/admin/modelos');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al actualizar el modelo');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Editar Modelo</h1>
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
                <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
                  Marca *
                </label>
                <select
                  id="marca"
                  name="marca"
                  required
                  value={marcaId}
                  onChange={(e) => setMarcaId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar marca...</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id.toString()}>
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
                  {loading ? 'Actualizando...' : 'Actualizar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
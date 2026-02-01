'use client';

import { useState, useEffect } from 'react';
import { CubeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Modelo, Marca } from '@/types';
import { API_BASE_URL } from '@/lib/constants';
import Button from '@/components/Button';
import AdminHero from '@/components/AdminHero';

export default function EditarModelo() {
  const [nombre, setNombre] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cargando modelo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toggle Button for Hero */}
      <div className="fixed top-20 right-4 z-30">
        <button
          onClick={() => setHeroVisible(!heroVisible)}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200"
          title={heroVisible ? 'Ocultar encabezado' : 'Mostrar encabezado'}
        >
          {heroVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Hero Section */}
      {heroVisible && (
        <AdminHero
          title="Editar Modelo"
          description="Actualiza la información del modelo de vehículo"
          buttonText="Ver Modelos"
          buttonHref="/admin/modelos"
          buttonIcon={<CubeIcon className="h-6 w-6" />}
        />
      )}

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <select
                    id="marca"
                    name="marca"
                    required
                    value={marcaId}
                    onChange={(e) => setMarcaId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Modelo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Ej: Corolla, Focus, Serie 3..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="secondary" href="/admin/modelos">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar Modelo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
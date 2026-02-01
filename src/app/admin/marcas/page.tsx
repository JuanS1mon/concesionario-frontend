'use client';

import { useState, useEffect } from 'react';
import { TagIcon, PlusCircleIcon, TrashIcon, PencilSquareIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Marca } from '@/types';
import { API_BASE_URL } from '@/lib/constants';
import Button from '@/components/Button';
import AdminHero from '@/components/AdminHero';

export default function AdminMarcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroVisible, setHeroVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadMarcas();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  const loadMarcas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marcas/`);
      if (response.ok) {
        const data = await response.json();
        setMarcas(data);
      } else {
        setError('Error al cargar las marcas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta marca? Esto también eliminará todos los modelos asociados.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/marcas/${id}/`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setMarcas(marcas.filter(marca => marca.id !== id));
      } else {
        setError('Error al eliminar la marca');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cargando marcas...</p>
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
          title="Gestión de Marcas"
          description="Administra las marcas de vehículos disponibles en tu inventario"
          buttonText="Nueva Marca"
          buttonHref="/admin/marcas/nueva"
          buttonIcon={<PlusCircleIcon className="h-6 w-6" />}
        />
      )}

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Lista de Marcas</h2>
            <p className="text-gray-600">Gestiona todas las marcas registradas</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marcas.map((marca) => (
                    <tr key={marca.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{marca.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{marca.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button href={`/admin/marcas/${marca.id}/editar`} className="bg-blue-600 hover:bg-blue-700 py-2 px-3 text-sm inline-flex items-center">
                          <PencilSquareIcon className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button onClick={() => handleDelete(marca.id)} className="bg-red-600 hover:bg-red-700 py-2 px-3 text-sm inline-flex items-center">
                          <TrashIcon className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {marcas.length === 0 && (
              <div className="text-center py-16">
                <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay marcas registradas aún.</p>
                <Button href="/admin/marcas/nueva" className="bg-blue-600 hover:bg-blue-700 inline-flex items-center">
                  <PlusCircleIcon className="h-5 w-5 mr-2" /> Agregar la primera marca
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

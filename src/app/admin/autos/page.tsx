'use client';

import { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon, PlusCircleIcon, TrashIcon, PencilSquareIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Auto } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

export default function AdminAutos() {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadAutos();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  const loadAutos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/autos`);
      if (response.ok) {
        const data = await response.json();
        setAutos(data);
      } else {
        setError('Error al cargar los autos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este auto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/autos/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setAutos(autos.filter(auto => auto.id !== id));
      } else {
        setError('Error al eliminar el auto');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-blue-100 p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ArrowLeftCircleIcon className="h-8 w-8 text-blue-500" />
            <Link href="/admin/dashboard" className="text-blue-700 hover:underline font-semibold text-lg">Volver al Dashboard</Link>
            <WrenchScrewdriverIcon className="h-8 w-8 text-blue-500 ml-4" />
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Gestionar Autos</h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/autos/nuevo"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg text-base font-bold shadow-lg flex items-center gap-2"
            >
              <PlusCircleIcon className="h-6 w-6" /> Nuevo Auto
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg text-base font-bold shadow-lg"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Auto</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {autos.map((auto) => (
                <tr key={auto.id} className="hover:bg-blue-50 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {auto.imagenes && auto.imagenes.length > 0 && (
                        <img
                          className="h-12 w-12 rounded-lg object-cover mr-3 border border-blue-200 shadow-sm"
                          src={auto.imagenes[0].url}
                          alt={`${auto.marca?.nombre} ${auto.modelo?.nombre}`}
                        />
                      )}
                      <div>
                        <div className="text-base font-bold text-blue-900">
                          {auto.marca?.nombre} {auto.modelo?.nombre}
                        </div>
                        <div className="text-xs text-blue-500">ID: {auto.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-900">{auto.anio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-900">{auto.tipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-900">${auto.precio.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                      auto.en_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {auto.estado?.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-900">
                    {auto.en_stock ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold text-xs">Disponible</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold text-xs">No disponible</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-bold space-x-2">
                    <Link
                      href={`/admin/autos/${auto.id}/editar`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 font-semibold transition-all"
                    >
                      <PencilSquareIcon className="h-5 w-5" /> Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(auto.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 font-semibold transition-all"
                    >
                      <TrashIcon className="h-5 w-5" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {autos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-blue-500">No hay autos registrados aún.</p>
            <Link
              href="/admin/autos/nuevo"
              className="mt-4 inline-flex items-center px-6 py-2 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              <PlusCircleIcon className="h-6 w-6 mr-2" /> Agregar el primer auto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

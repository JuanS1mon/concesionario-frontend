'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, PlusCircleIcon, TrashIcon, PencilSquareIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Estado } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

export default function AdminEstados() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadEstados();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  const loadEstados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estados/`);
      if (response.ok) {
        const data = await response.json();
        setEstados(data);
      } else {
        setError('Error al cargar los estados');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este estado? Esto puede afectar a los autos que lo usan.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/estados/${id}/`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setEstados(estados.filter(estado => estado.id !== id));
      } else {
        setError('Error al eliminar el estado');
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
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-blue-100 p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ArrowLeftCircleIcon className="h-8 w-8 text-blue-500" />
            <Link href="/admin/dashboard" className="text-blue-700 hover:underline font-semibold text-lg">Volver al Dashboard</Link>
            <MapPinIcon className="h-8 w-8 text-blue-500 ml-4" />
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Gestionar Estados</h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/estados/nueva"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg text-base font-bold shadow-lg flex items-center gap-2"
            >
              <PlusCircleIcon className="h-6 w-6" /> Nuevo Estado
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
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {estados.map((estado) => (
                <tr key={estado.id} className="hover:bg-blue-50 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-900">{estado.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-900">{estado.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-bold space-x-2">
                    <Link
                      href={`/admin/estados/${estado.id}/editar`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 font-semibold transition-all"
                    >
                      <PencilSquareIcon className="h-5 w-5" /> Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(estado.id)}
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

        {estados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-blue-500">No hay estados registrados aún.</p>
            <Link
              href="/admin/estados/nueva"
              className="mt-4 inline-flex items-center px-6 py-2 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              <PlusCircleIcon className="h-6 w-6 mr-2" /> Agregar el primer estado
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

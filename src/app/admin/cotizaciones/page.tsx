'use client';

import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cotizacion } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

export default function AdminCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadCotizaciones();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  const loadCotizaciones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizaciones/`);
      if (response.ok) {
        const data = await response.json();
        setCotizaciones(data);
      } else {
        setError('Error al cargar las cotizaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
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
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500 ml-4" />
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Cotizaciones</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg text-base font-bold shadow-lg"
          >
            Cerrar Sesión
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Auto</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Mensaje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {cotizaciones.map((cotizacion) => (
                <tr key={cotizacion.id} className="hover:bg-blue-50 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-900">{cotizacion.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-900">{cotizacion.nombre_usuario}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-900">{cotizacion.auto?.marca?.nombre} {cotizacion.auto?.modelo?.nombre} {cotizacion.auto?.anio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-500">{cotizacion.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-500">{cotizacion.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-blue-500">{new Date(cotizacion.fecha_creacion).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-base text-blue-500 max-w-xs truncate">{cotizacion.mensaje || 'Sin mensaje'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cotizaciones.length === 0 && (
          <div className="text-center py-12">
            <p className="text-blue-500">No hay cotizaciones registradas aún.</p>
            <p className="text-sm text-blue-400 mt-2">
              Las cotizaciones aparecerán aquí cuando los clientes soliciten información sobre los autos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

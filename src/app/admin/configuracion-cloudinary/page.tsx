'use client';

import { useState, useEffect } from 'react';
import { Cog6ToothIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants';
import Button from '@/components/Button';
import AdminHero from '@/components/AdminHero';

interface ConfiguracionCloudinary {
  id: number;
  cloud_name: string;
  api_key: string;
  api_secret: string;
  upload_preset: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
}

export default function ConfiguracionCloudinary() {
  const [configuracion, setConfiguracion] = useState<ConfiguracionCloudinary | null>(null);
  const [formData, setFormData] = useState({
    cloud_name: '',
    api_key: '',
    api_secret: '',
    upload_preset: '',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkAuth = () => {
    if (!isClient) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin';
    }
  };

  useEffect(() => {
    if (isClient) {
      checkAuth();
      loadConfiguracion();
    }
  }, [isClient]);

  const loadConfiguracion = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/configuracion-cloudinary`);
      if (response.ok) {
        const data = await response.json();
        setConfiguracion(data);
        setFormData({
          cloud_name: data.cloud_name,
          api_key: data.api_key,
          api_secret: data.api_secret,
          upload_preset: data.upload_preset,
          activo: data.activo,
        });
      } else if (response.status === 404) {
        // No hay configuración, mostrar formulario vacío
        setConfiguracion(null);
      } else {
        setError('Error al cargar la configuración');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/configuracion-cloudinary`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setConfiguracion(data);
        setSuccess('Configuración guardada exitosamente');
        // Recargar la configuración para mostrar los datos actualizados
        loadConfiguracion();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al guardar la configuración');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!formData.cloud_name || !formData.api_key || !formData.api_secret) {
      setError('Complete todos los campos para probar la conexión');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Probar la conexión haciendo una petición simple a Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${formData.cloud_name}/resources/image`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${formData.api_key}:${formData.api_secret}`)}`,
        },
      });

      if (response.ok) {
        setSuccess('Conexión a Cloudinary exitosa');
      } else {
        setError('Error en la conexión a Cloudinary. Verifique las credenciales.');
      }
    } catch (err) {
      setError('Error de conexión a Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !configuracion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cargando configuración...</p>
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
          title="Configuración de Cloudinary"
          description="Administra las credenciales y configuración de tu servicio de almacenamiento de imágenes"
          buttonText="Volver al Dashboard"
          buttonHref="/admin/dashboard"
          buttonIcon={<Cog6ToothIcon className="h-6 w-6" />}
        />
      )}

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">

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

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-xl p-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 font-medium">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="cloud_name" className="block text-sm font-medium text-gray-700 mb-2">Cloud Name *</label>
                  <input
                    type="text"
                    id="cloud_name"
                    name="cloud_name"
                    required
                    value={formData.cloud_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Su cloud name de Cloudinary"
                  />
                </div>
                <div>
                  <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 mb-2">API Key *</label>
                  <input
                    type="text"
                    id="api_key"
                    name="api_key"
                    required
                    value={formData.api_key}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Su API key"
                  />
                </div>
                <div>
                  <label htmlFor="api_secret" className="block text-sm font-medium text-gray-700 mb-2">API Secret *</label>
                  <input
                    type="password"
                    id="api_secret"
                    name="api_secret"
                    required
                    value={formData.api_secret}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Su API secret"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="upload_preset" className="block text-sm font-medium text-gray-700 mb-2">Upload Preset *</label>
                  <input
                    type="text"
                    id="upload_preset"
                    name="upload_preset"
                    required
                    value={formData.upload_preset}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Nombre del upload preset"
                  />
                  <p className="mt-2 text-xs text-gray-500">El upload preset debe estar configurado en Cloudinary para permitir uploads sin autenticación.</p>
                </div>
              </div>
              <div className="flex items-center pt-2">
                <input
                  id="activo"
                  name="activo"
                  type="checkbox"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">Configuración activa</label>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={loading}
                  className="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition"
                >
                  {loading ? 'Probando...' : 'Probar Conexión'}
                </button>
                <div className="flex gap-3">
                  <Button variant="secondary" href="/admin/dashboard">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </div>
              </div>
            </form>

            {configuracion && (
              <div className="mt-10 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                  Configuración Actual
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cloud Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">{configuracion.cloud_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Upload Preset</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">{configuracion.upload_preset}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        configuracion.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {configuracion.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Última actualización</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">
                      {new Date(configuracion.updated_at || configuracion.created_at).toLocaleString('es-ES')}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants';

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
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Volver al Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Configuración de Cloudinary</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 shadow-xl rounded-2xl border border-gray-200">
          <div className="px-6 py-8">
            <div className="flex items-center mb-8 gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25M12 18.75V21M4.219 4.219l1.591 1.591M18.19 18.19l1.591 1.591M21 12h-2.25M5.25 12H3M4.219 19.781l1.591-1.591M18.19 5.81l1.591-1.591M7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurar Cloudinary</h2>
                <p className="text-sm text-gray-500">Gestiona las credenciales y estado de integración con Cloudinary para la carga de imágenes.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-green-800 font-medium">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="cloud_name" className="block text-sm font-semibold text-gray-700 mb-1">Cloud Name *</label>
                  <input
                    type="text"
                    id="cloud_name"
                    name="cloud_name"
                    required
                    value={formData.cloud_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                    placeholder="Su cloud name de Cloudinary"
                  />
                </div>
                <div>
                  <label htmlFor="api_key" className="block text-sm font-semibold text-gray-700 mb-1">API Key *</label>
                  <input
                    type="text"
                    id="api_key"
                    name="api_key"
                    required
                    value={formData.api_key}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                    placeholder="Su API key"
                  />
                </div>
                <div>
                  <label htmlFor="api_secret" className="block text-sm font-semibold text-gray-700 mb-1">API Secret *</label>
                  <input
                    type="password"
                    id="api_secret"
                    name="api_secret"
                    required
                    value={formData.api_secret}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                    placeholder="Su API secret"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="upload_preset" className="block text-sm font-semibold text-gray-700 mb-1">Upload Preset *</label>
                  <input
                    type="text"
                    id="upload_preset"
                    name="upload_preset"
                    required
                    value={formData.upload_preset}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                    placeholder="Nombre del upload preset"
                  />
                  <p className="mt-1 text-xs text-gray-500">El upload preset debe estar configurado en Cloudinary para permitir uploads sin autenticación.</p>
                </div>
              </div>
              <div className="flex items-center">
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
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-4">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={loading}
                  className="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 4h-1a1 1 0 01-1-1v-1a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1z" /></svg>
                  {loading ? 'Probando...' : 'Probar Conexión'}
                </button>
                <div className="flex gap-3">
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                  >
                    <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
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
      </div>
    </div>
  );
}

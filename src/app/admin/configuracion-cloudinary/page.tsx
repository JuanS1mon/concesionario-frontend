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
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/configuracion-cloudinary`, { headers });
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

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Configuración de Cloudinary</h2>
              <p className="text-sm text-gray-600">
                Configure las credenciales de Cloudinary para subir imágenes de los autos.
                Puede obtener estas credenciales desde su panel de control de Cloudinary.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="cloud_name" className="block text-sm font-medium text-gray-700">
                    Cloud Name *
                  </label>
                  <input
                    type="text"
                    id="cloud_name"
                    name="cloud_name"
                    required
                    value={formData.cloud_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Su cloud name de Cloudinary"
                  />
                </div>

                <div>
                  <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
                    API Key *
                  </label>
                  <input
                    type="text"
                    id="api_key"
                    name="api_key"
                    required
                    value={formData.api_key}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Su API key"
                  />
                </div>

                <div>
                  <label htmlFor="api_secret" className="block text-sm font-medium text-gray-700">
                    API Secret *
                  </label>
                  <input
                    type="password"
                    id="api_secret"
                    name="api_secret"
                    required
                    value={formData.api_secret}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Su API secret"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="upload_preset" className="block text-sm font-medium text-gray-700">
                    Upload Preset *
                  </label>
                  <input
                    type="text"
                    id="upload_preset"
                    name="upload_preset"
                    required
                    value={formData.upload_preset}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nombre del upload preset"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    El upload preset debe estar configurado en Cloudinary para permitir uploads sin autenticación.
                  </p>
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
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                  Configuración activa
                </label>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={loading}
                  className="bg-gray-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  {loading ? 'Probando...' : 'Probar Conexión'}
                </button>

                <div className="flex space-x-4">
                  <Link
                    href="/admin/dashboard"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </div>
            </form>

            {configuracion && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Actual</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cloud Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{configuracion.cloud_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Upload Preset</dt>
                    <dd className="mt-1 text-sm text-gray-900">{configuracion.upload_preset}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
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
                    <dt className="text-sm font-medium text-gray-500">Última actualización</dt>
                    <dd className="mt-1 text-sm text-gray-900">
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

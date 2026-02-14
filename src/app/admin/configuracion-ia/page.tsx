'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cog6ToothIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import AdminHero from '@/components/AdminHero';
import Button from '@/components/Button';
import { aiConfigAPI } from '@/lib/api';

interface ConfiguracionAI {
  id?: number;
  proveedor: string;
  activo: boolean;
  has_key: boolean;
  api_key_last4?: string | null;
  source: 'db' | 'env';
}

export default function ConfiguracionIA() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfiguracionAI | null>(null);
  const [formData, setFormData] = useState({
    proveedor: 'deepseek',
    api_key: '',
    activo: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
      return;
    }
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiConfigAPI.get();
      const data = res.data as ConfiguracionAI;
      setConfig(data);
      setFormData({
        proveedor: data.proveedor || 'deepseek',
        api_key: '',
        activo: data.activo ?? true,
      });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Error al cargar la configuracion de IA');
      }
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
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
      if (config?.id) {
        const payload: { proveedor?: string; api_key?: string; activo?: boolean } = {
          proveedor: formData.proveedor,
          activo: formData.activo,
        };
        if (formData.api_key) {
          payload.api_key = formData.api_key;
        }
        await aiConfigAPI.update(config.id, payload);
      } else {
        if (!formData.api_key) {
          setError('La API key es obligatoria');
          return;
        }
        await aiConfigAPI.create({
          proveedor: formData.proveedor,
          api_key: formData.api_key,
          activo: formData.activo,
        });
      }

      setSuccess('Configuracion guardada');
      setFormData(prev => ({ ...prev, api_key: '' }));
      loadConfig();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-20 right-4 z-30">
        <button
          onClick={() => setHeroVisible(!heroVisible)}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200"
          title={heroVisible ? 'Ocultar encabezado' : 'Mostrar encabezado'}
        >
          {heroVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      {heroVisible && (
        <AdminHero
          title="Configuracion IA"
          description="Gestiona la API key para analisis con IA en pricing"
          buttonText="Volver al Dashboard"
          buttonHref="/admin/dashboard"
          buttonIcon={<Cog6ToothIcon className="h-6 w-6" />}
        />
      )}

      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4">
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            )}

            {config?.source === 'env' && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Se detecto una API key configurada en variables de entorno. Esa clave tiene prioridad sobre la almacenada en la base.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                <select
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleInputChange}
                  title="Proveedor de IA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key *</label>
                <input
                  type="password"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={config?.has_key ? `Actual: ****${config.api_key_last4 || ''}` : 'Ingresar API key'}
                />
                {config?.has_key && (
                  <p className="mt-2 text-xs text-gray-500">Clave guardada: ****{config.api_key_last4}</p>
                )}
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
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">Configuracion activa</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" href="/admin/dashboard">Cancelar</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Configuracion'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

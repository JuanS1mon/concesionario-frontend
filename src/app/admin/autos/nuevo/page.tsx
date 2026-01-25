'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Marca, Modelo, Estado } from '@/types';

export default function NuevoAuto() {
  const [formData, setFormData] = useState({
    marca_id: '',
    modelo_id: '',
    anio: '',
    tipo: '',
    precio: '',
    descripcion: '',
    estado_id: '',
    en_stock: true,
  });
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cloudinaryConfig, setCloudinaryConfig] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  useEffect(() => {
    if (formData.marca_id) {
      loadModelos(formData.marca_id);
    } else {
      setModelos([]);
    }
  }, [formData.marca_id]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const [marcasRes, estadosRes, cloudinaryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/estados`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion-cloudinary`, { headers }).catch(() => null),
      ]);

      if (marcasRes.ok) {
        const marcasData = await marcasRes.json();
        setMarcas(marcasData);
      }

      if (estadosRes.ok) {
        const estadosData = await estadosRes.json();
        setEstados(estadosData);
      }

      if (cloudinaryRes && cloudinaryRes.ok) {
        const cloudinaryData = await cloudinaryRes.json();
        setCloudinaryConfig(cloudinaryData);
      }
    } catch (err) {
      setError('Error al cargar los datos');
    }
  };

  const loadModelos = async (marcaId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modelos`, { headers });
      if (response.ok) {
        const modelosData = await response.json();
        const modelosFiltrados = modelosData.filter((modelo: Modelo) => modelo.marca_id === parseInt(marcaId));
        setModelos(modelosFiltrados);
      }
    } catch (err) {
      console.error('Error loading modelos:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const uploadImages = async (autoId: number): Promise<string[]> => {
    if (!cloudinaryConfig) {
      throw new Error('Configuración de Cloudinary no disponible');
    }

    const imageUrls: string[] = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', cloudinaryConfig.upload_preset);

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          imageUrls.push(data.secure_url);

          // Crear registro de imagen en la base de datos
          const token = localStorage.getItem('token');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/imagenes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              auto_id: autoId,
              url: data.secure_url,
              public_id: data.public_id,
            }),
          });
        }
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }

    return imageUrls;
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

      const autoData = {
        ...formData,
        marca_id: parseInt(formData.marca_id),
        modelo_id: parseInt(formData.modelo_id),
        estado_id: parseInt(formData.estado_id),
        anio: parseInt(formData.anio),
        precio: parseFloat(formData.precio),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/autos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(autoData),
      });

      if (response.ok) {
        const newAuto = await response.json();

        // Subir imágenes si hay
        if (images.length > 0) {
          const imageUrls = await uploadImages(newAuto.id);
          // Aquí podrías actualizar el auto con las URLs de las imágenes
        }

        router.push('/admin/autos');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al crear el auto');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/autos" className="text-blue-600 hover:text-blue-800">
                ← Volver a Autos
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Auto</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700">
                    Marca *
                  </label>
                  <select
                    id="marca_id"
                    name="marca_id"
                    required
                    value={formData.marca_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map((marca) => (
                      <option key={marca.id} value={marca.id}>
                        {marca.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="modelo_id" className="block text-sm font-medium text-gray-700">
                    Modelo *
                  </label>
                  <select
                    id="modelo_id"
                    name="modelo_id"
                    required
                    value={formData.modelo_id}
                    onChange={handleInputChange}
                    disabled={!formData.marca_id}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar modelo</option>
                    {modelos.map((modelo) => (
                      <option key={modelo.id} value={modelo.id}>
                        {modelo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="anio" className="block text-sm font-medium text-gray-700">
                    Año *
                  </label>
                  <input
                    type="number"
                    id="anio"
                    name="anio"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.anio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                    Tipo *
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    required
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Sedán">Sedán</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Deportivo">Deportivo</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Minivan">Minivan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                    Precio *
                  </label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="estado_id" className="block text-sm font-medium text-gray-700">
                    Estado *
                  </label>
                  <select
                    id="estado_id"
                    name="estado_id"
                    required
                    value={formData.estado_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar estado</option>
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Descripción opcional del auto..."
                />
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  Imágenes
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Selecciona múltiples imágenes del auto (opcional)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="en_stock"
                  name="en_stock"
                  type="checkbox"
                  checked={formData.en_stock}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="en_stock" className="ml-2 block text-sm text-gray-900">
                  Disponible en stock
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/autos"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Auto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
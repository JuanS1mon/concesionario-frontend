'use client';

import { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Marca, Modelo, Estado } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageMetadata, setImageMetadata] = useState({
    titulo: '',
    descripcion: '',
    alt: '',
  });
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
      const [marcasRes, estadosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marcas/`),
        fetch(`${API_BASE_URL}/estados/`),
      ]);

      if (marcasRes.ok) {
        const marcasData = await marcasRes.json();
        setMarcas(marcasData);
      }

      if (estadosRes.ok) {
        const estadosData = await estadosRes.json();
        setEstados(estadosData);
      }
    } catch (err) {
      setError('Error al cargar los datos');
    }
  };

  const loadModelos = async (marcaId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/modelos/`);
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
      const files = Array.from(e.target.files);
      setImages(files);
      // Previsualización
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const uploadImages = async (autoId: number): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('auto_id', autoId.toString());
      if (imageMetadata.titulo) formData.append('titulo', imageMetadata.titulo);
      if (imageMetadata.descripcion) formData.append('descripcion', imageMetadata.descripcion);
      if (imageMetadata.alt) formData.append('alt', imageMetadata.alt);

      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/imagenes/upload`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          imageUrls.push(data.url);
        } else {
          console.error('Error uploading image:', response.status, await response.text());
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

      const response = await fetch(`${API_BASE_URL}/autos`, {
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
      // Mostrar mensaje de error más informativo si está disponible
      if (err instanceof Error) setError(err.message);
      else setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 p-8 relative animate-fade-in">
        <div className="flex items-center mb-8 gap-3">
          <PhotoIcon className="h-10 w-10 text-blue-500" />
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Nuevo Auto</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
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
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
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
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imagePreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`preview-${i}`}
                    className="h-20 w-28 object-cover rounded-lg border border-blue-200 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Metadata para imágenes */}
          {imagePreviews.length > 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Metadata para las Imágenes (opcional, mejora SEO)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="imageTitulo" className="block text-xs font-medium text-gray-600">
                    Título
                  </label>
                  <input
                    type="text"
                    id="imageTitulo"
                    value={imageMetadata.titulo}
                    onChange={(e) => setImageMetadata(prev => ({ ...prev, titulo: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Título de la imagen"
                  />
                </div>
                <div>
                  <label htmlFor="imageAlt" className="block text-xs font-medium text-gray-600">
                    Texto Alternativo (Alt)
                  </label>
                  <input
                    type="text"
                    id="imageAlt"
                    value={imageMetadata.alt}
                    onChange={(e) => setImageMetadata(prev => ({ ...prev, alt: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Descripción para accesibilidad"
                  />
                </div>
                <div>
                  <label htmlFor="imageDescripcion" className="block text-xs font-medium text-gray-600">
                    Descripción
                  </label>
                  <input
                    type="text"
                    id="imageDescripcion"
                    value={imageMetadata.descripcion}
                    onChange={(e) => setImageMetadata(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Descripción detallada"
                  />
                </div>
              </div>
            </div>
          )}


          <div className="flex items-center mt-2">
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

          <div className="flex justify-end space-x-4 mt-8">
            <Link
              href="/admin/autos"
              className="bg-white py-2 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 py-2 px-8 border border-transparent rounded-lg shadow-lg text-base font-bold text-white hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-150"
            >
              {loading ? 'Creando...' : 'Crear Auto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

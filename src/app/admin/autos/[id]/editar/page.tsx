'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Marca, Modelo, Estado, Auto } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

console.log('📄 Archivo page.tsx cargado correctamente');

export default function EditarAuto() {
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [cloudinaryConfig, setCloudinaryConfig] = useState<any>(null);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
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
  const router = useRouter();
  const params = useParams();
  const autoId = params.id as string;

  console.log('🚀 Componente EditarAuto renderizándose, loadingData:', loadingData);

  // Verificar autenticación y cargar datos
  useEffect(() => {
    console.log('🔥 useEffect de autenticación ejecutándose...');
    const token = localStorage.getItem('token');
    console.log('Verificando autenticación, token:', !!token);
    if (!token) {
      console.log('No hay token, redirigiendo a /admin');
      router.push('/admin');
      return;
    }
    console.log('Autenticación correcta, iniciando carga de datos...');
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      console.log('🚀 Iniciando loadData...');
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('📡 Haciendo llamadas a la API...');
      const [marcasRes, estadosRes, cloudinaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marcas/`, { headers }),
        fetch(`${API_BASE_URL}/estados/`, { headers }),
        fetch(`${API_BASE_URL}/configuracion-cloudinary/`, { headers }).catch(() => null),
      ]);

      console.log('✅ Respuestas recibidas:', {
        marcas: marcasRes.status,
        estados: estadosRes.status,
        cloudinary: cloudinaryRes?.status || 'no disponible'
      });

      if (marcasRes.ok) {
        const marcasData = await marcasRes.json();
        console.log('📊 Marcas cargadas:', marcasData.length);
        setMarcas(marcasData);
      }

      if (estadosRes.ok) {
        const estadosData = await estadosRes.json();
        console.log('📊 Estados cargados:', estadosData.length);
        setEstados(estadosData);
      }

      if (cloudinaryRes && cloudinaryRes.ok) {
        const cloudinaryData = await cloudinaryRes.json();
        console.log('☁️ Configuración Cloudinary cargada');
        setCloudinaryConfig(cloudinaryData);
      }

      console.log('✅ Datos básicos cargados, llamando loadAuto...');
      await loadAuto();
      console.log('✅ loadData completado exitosamente');
    } catch (err) {
      console.error('❌ Error al cargar los datos:', err);
      setError('Error al cargar los datos');
      setLoadingData(false);
    }
  };

  const loadAuto = async () => {
    try {
      console.log('🚗 Iniciando loadAuto para ID:', autoId);
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('📡 Consultando auto en la API...');
      const response = await fetch(`${API_BASE_URL}/autos/${autoId}/`, { headers });
      console.log('📡 Respuesta del servidor:', response.status);

      if (response.ok) {
        const auto: Auto = await response.json();
        console.log('🚗 Auto cargado:', auto);

        // Cargar modelos de la marca
        if (auto.marca_id) {
          console.log('📊 Cargando modelos para marca:', auto.marca_id);
          const modelosRes = await fetch(`${API_BASE_URL}/modelos/marca/${auto.marca_id}/`, { headers });
          if (modelosRes.ok) {
            const modelosData = await modelosRes.json();
            console.log('📊 Modelos cargados:', modelosData.length);
            setModelos(modelosData);
          }
        }

        // Cargar imágenes existentes
        console.log('🖼️ Cargando imágenes del auto...');
        const imagesRes = await fetch(`${API_BASE_URL}/imagenes/auto/${autoId}/`, { headers });
        if (imagesRes.ok) {
          const imagesData = await imagesRes.json();
          console.log('🖼️ Imágenes cargadas:', imagesData.length);
          setExistingImages(imagesData);
        }

        // Actualizar formData
        setFormData({
          marca_id: auto.marca_id?.toString() || '',
          modelo_id: auto.modelo_id?.toString() || '',
          anio: auto.anio?.toString() || '',
          tipo: auto.tipo || '',
          precio: auto.precio?.toString() || '',
          descripcion: auto.descripcion || '',
          estado_id: auto.estado_id?.toString() || '',
          en_stock: auto.en_stock ?? true,
        });

        console.log('✅ loadAuto completado exitosamente');
      } else {
        console.error('❌ Error al cargar el auto:', response.status);
        setError('Error al cargar el auto');
      }
    } catch (err) {
      console.error('❌ Error en loadAuto:', err);
      setError('Error al cargar el auto');
    } finally {
      console.log('🔄 Estableciendo loadingData a false');
      setLoadingData(false);
    }
  };

  useEffect(() => {
    return () => {
      // Limpiar URLs de vista previa al desmontar el componente
      imagePreviews.forEach(preview => {
        try {
          URL.revokeObjectURL(preview);
        } catch (e) {
          // Ignorar errores si la URL ya fue revocada
        }
      });
    };
  }, []); // Remover dependencia de imagePreviews para evitar problemas

  useEffect(() => {
    if (formData.marca_id) {
      loadModelos(formData.marca_id);
    } else {
      setModelos([]);
    }
  }, [formData.marca_id]);

  const loadModelos = async (marcaId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/modelos/`, { headers });
      if (response.ok) {
        const modelosData = await response.json();
        const modelosFiltrados = modelosData.filter((modelo: any) => modelo.marca_id === parseInt(marcaId));
        setModelos(modelosFiltrados);
      }
    } catch (err) {
      console.error('Error loading modelos:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);

      // Crear URLs de vista previa
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeExistingImage = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Limpiar URL de objeto para liberar memoria
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteMarkedImages = async () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    for (const imageId of imagesToDelete) {
      try {
        await fetch(`${API_BASE_URL}/imagenes/${imageId}/`, {
          method: 'DELETE',
          headers,
        });
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
  };

  const uploadImages = async (): Promise<string[]> => {
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

          await fetch(`${API_BASE_URL}/imagenes/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              auto_id: parseInt(autoId),
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
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
        marca_id: parseInt(formData.marca_id),
        modelo_id: parseInt(formData.modelo_id),
        estado_id: parseInt(formData.estado_id),
        anio: parseInt(formData.anio),
        precio: parseFloat(formData.precio),
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        en_stock: formData.en_stock,
      };

      const response = await fetch(`${API_BASE_URL}/autos/${autoId}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(autoData),
      });

      if (response.ok) {
        // Eliminar imágenes marcadas para eliminación
        if (imagesToDelete.length > 0) {
          await deleteMarkedImages();
        }

        // Subir nuevas imágenes si las hay
        if (images.length > 0) {
          await uploadImages();
        }

        // Limpiar URLs de vista previa y resetear estado
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setImages([]);
        setImagePreviews([]);

        router.push('/admin/autos');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al actualizar el auto');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    console.log('Mostrando loading spinner');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando datos del auto...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Renderizando formulario principal');
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Auto</h1>
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

              {/* Imágenes existentes */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Imágenes del Auto
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                          <img
                            src={image.url}
                            alt="Auto"
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                          title="Eliminar imagen"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          Imagen actual
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nuevas imágenes seleccionadas */}
              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Nuevas Imágenes a Agregar
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                          <img
                            src={preview}
                            alt={`Nueva imagen ${index + 1}`}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                          title="Quitar imagen"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 left-2 bg-green-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          Nueva imagen
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  Agregar Nuevas Imágenes
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white hover:file:from-blue-600 hover:file:to-blue-700 transition-all duration-200"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Selecciona múltiples imágenes adicionales del auto (opcional)
                  </p>
                  {imagePreviews.length > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      {imagePreviews.length} imagen(es) seleccionada(s)
                    </span>
                  )}
                </div>
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
                  {loading ? 'Actualizando...' : 'Actualizar Auto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
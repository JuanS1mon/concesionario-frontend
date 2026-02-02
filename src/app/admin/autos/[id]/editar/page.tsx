'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { Marca, Modelo, Estado, Auto } from '@/types';
import { API_BASE_URL } from '@/lib/constants';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

console.log('📄 Archivo page.tsx cargado correctamente');

export default function EditarAuto() {
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [imageMetadata, setImageMetadata] = useState({
    titulo: '',
    descripcion: '',
    alt: '',
  });
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
      const [marcasRes, estadosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marcas/`, { headers }),
        fetch(`${API_BASE_URL}/estados/`, { headers }),
      ]);

      console.log('✅ Respuestas recibidas:', {
        marcas: marcasRes.status,
        estados: estadosRes.status,
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
      const response = await fetch(`${API_BASE_URL}/autos/${autoId}`, { headers });
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

      const response = await fetch(`${API_BASE_URL}/modelos`, { headers });
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
        await fetch(`${API_BASE_URL}/imagenes/${imageId}`, {
          method: 'DELETE',
          headers,
        });
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('auto_id', autoId);
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
      console.log('[EditarAuto] Token en localStorage:', token ? `${token.substring(0, 50)}...` : 'NO ENCONTRADO');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('[EditarAuto] Header Authorization:', headers.Authorization.substring(0, 50) + '...');
      } else {
        console.warn('[EditarAuto] ⚠️ Token NO encontrado en localStorage');
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

      const response = await fetch(`${API_BASE_URL}/autos/${autoId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(autoData),
      });

      console.log('[EditarAuto] Respuesta del servidor:', response.status);
      console.log('[EditarAuto] Headers enviados:', headers);

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
        console.error('[EditarAuto] Error 401/500:', errorData);
        setError(errorData.detail || 'Error al actualizar el auto');
      }
    } catch (err) {
      console.error('[EditarAuto] Exception:', err);
      if (err instanceof Error) setError(err.message);
      else setError('Error de conexión');
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-radial from-blue-50 to-blue-100 rounded-2xl shadow-2xl border border-blue-100 p-8 relative animate-fade-in">
      <div className="flex items-center mb-8 gap-3">
        <PencilSquareIcon className="h-10 w-10 text-gray-700" />
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Editar Auto</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  label="Marca"
                  name="marca_id"
                  as="select"
                  value={formData.marca_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </FormField>

                <FormField
                  label="Modelo"
                  name="modelo_id"
                  as="select"
                  value={formData.modelo_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.marca_id}
                >
                  <option value="">Seleccionar modelo</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {modelo.nombre}
                    </option>
                  ))}
                </FormField>

                <FormField
                  label="Año"
                  name="anio"
                  type="number"
                  value={formData.anio}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />

                <FormField
                  label="Tipo"
                  name="tipo"
                  as="select"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
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
                </FormField>

                <FormField
                  label="Precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />

                <FormField
                  label="Estado"
                  name="estado_id"
                  as="select"
                  value={formData.estado_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar estado</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </FormField>
              </div>

              <FormField
                label="Descripción"
                name="descripcion"
                as="textarea"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción opcional del auto..."
              />

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
                <Button variant="secondary" href="/admin/autos">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar Auto'}
                </Button>
              </div>
            </form>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { Auto, Marca, Modelo, Estado } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

interface AutoEditModalProps {
  auto: Auto | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const initialFormData = {
  marca_id: '',
  modelo_id: '',
  anio: '',
  tipo: '',
  precio: '',
  descripcion: '',
  estado_id: '',
  en_stock: true,
};

export default function AutoEditModal({ auto, isOpen, onClose, onSaved }: AutoEditModalProps) {
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
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (!isOpen || !auto) return;
    setError('');
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
    setExistingImages(auto.imagenes || []);
    loadLists();
  }, [isOpen, auto]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formData.marca_id || !isOpen) {
      setModelos([]);
      return;
    }
    loadModelos(formData.marca_id);
  }, [formData.marca_id, isOpen]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        try {
          URL.revokeObjectURL(preview);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    };
  }, [imagePreviews]);

  const resetForm = () => {
    imagePreviews.forEach((preview) => {
      try {
        URL.revokeObjectURL(preview);
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    setLoading(false);
    setError('');
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setImageMetadata({ titulo: '', descripcion: '', alt: '' });
    setMarcas([]);
    setModelos([]);
    setEstados([]);
    setFormData(initialFormData);
  };

  const buildAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token && token !== 'undefined' && token !== 'null') {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const loadLists = async () => {
    try {
      const headers = buildAuthHeaders();
      const [marcasRes, estadosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marcas/`, { headers }),
        fetch(`${API_BASE_URL}/estados/`, { headers }),
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
      const headers = buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/modelos/marca/${marcaId}`, { headers });
      if (response.ok) {
        const modelosData = await response.json();
        setModelos(modelosData);
      }
    } catch (err) {
      // Keep previous modelos if fetch fails
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);

      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeExistingImage = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteMarkedImages = async () => {
    const headers = buildAuthHeaders();

    for (const imageId of imagesToDelete) {
      try {
        await fetch(`${API_BASE_URL}/imagenes/${imageId}`, {
          method: 'DELETE',
          headers,
        });
      } catch (err) {
        // Continue with remaining deletions
      }
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const image of images) {
      if (!auto) continue;
      const formData = new FormData();
      formData.append('file', image);
      formData.append('auto_id', auto.id.toString());
      if (imageMetadata.titulo) formData.append('titulo', imageMetadata.titulo);
      if (imageMetadata.descripcion) formData.append('descripcion', imageMetadata.descripcion);
      if (imageMetadata.alt) formData.append('alt', imageMetadata.alt);

      try {
        const headers = buildAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/imagenes/upload`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          imageUrls.push(data.url);
        }
      } catch (err) {
        // Ignore individual upload errors
      }
    }

    return imageUrls;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auto) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        setError('Sesión expirada. Inicia sesión nuevamente.');
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(),
      };

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

      const response = await fetch(`${API_BASE_URL}/autos/${auto.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(autoData),
      });

      if (response.ok) {
        if (imagesToDelete.length > 0) {
          await deleteMarkedImages();
        }

        if (images.length > 0) {
          await uploadImages();
        }

        onSaved();
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setError('Sesión expirada o token inválido. Inicia sesión nuevamente.');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al actualizar el auto');
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Editar Auto</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Cerrar edición"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)] text-gray-900">
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
                      onChange={(e) => setImageMetadata((prev) => ({ ...prev, titulo: e.target.value }))}
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
                      onChange={(e) => setImageMetadata((prev) => ({ ...prev, alt: e.target.value }))}
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
                      onChange={(e) => setImageMetadata((prev) => ({ ...prev, descripcion: e.target.value }))}
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
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Auto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

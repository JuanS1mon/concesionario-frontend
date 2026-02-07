'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Auto, Imagen } from '@/types';
import { cotizacionesAPI } from '@/lib/api';

interface AutoDetalleProps {
  auto: Auto;
  onClose: () => void;
}

export default function AutoDetalle({ auto, onClose }: AutoDetalleProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationForm, setQuotationForm] = useState({
    nombre_usuario: '',
    email: '',
    telefono: '',
    mensaje: '',
    ciudad: '',
    fuente: 'web',
    preferencias_contacto: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await cotizacionesAPI.create({
        ...quotationForm,
        auto_id: auto.id,
        estado: 'nuevo'
      });
      alert('Cotización enviada exitosamente. Nos pondremos en contacto pronto.');
      setShowQuotationModal(false);
      setQuotationForm({
        nombre_usuario: '',
        email: '',
        telefono: '',
        mensaje: '',
        ciudad: '',
        fuente: 'web',
        preferencias_contacto: 'email'
      });
    } catch (error) {
      alert('Error al enviar la cotización. Inténtalo de nuevo.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === auto.imagenes.length - 1 ? 0 : prev + 1
    );
    setZoom(1);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? auto.imagenes.length - 1 : prev - 1
    );
    setZoom(1);
  };

  const goToImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const getImageUrl = (url: string, quality: 'low' | 'medium' | 'high' = 'medium') => {
    // Asumiendo URLs de Cloudinary, agregar parámetros de calidad
    if (url.includes('cloudinary.com')) {
      const qualityParam = quality === 'low' ? 'q_50' : quality === 'medium' ? 'q_75' : 'q_100';
      // Insertar el parámetro de calidad en la URL
      return url.replace('/upload/', `/upload/${qualityParam}/`);
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-blue-700 to-gray-900 text-white p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-gray-800/20"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Detalles del Vehículo Premium
              </h2>
              <div className="flex items-center space-x-4 text-blue-100 text-sm">
                <span>{auto.marca?.nombre} {auto.modelo?.nombre}</span>
                <span>•</span>
                <span>{auto.anio}</span>
                <span>•</span>
                <span>{auto.tipo}</span>
                <span>•</span>
                <span>{auto.estado?.nombre}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Cerrar detalles del auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido Scrollable */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] lg:max-h-[calc(95vh-120px)]">
          <div className="flex flex-col lg:flex-row">
            {/* Imagen principal y miniaturas */}
            <div className="lg:w-2/3 flex flex-col">
              {/* Imagen principal */}
              <div className="p-4 lg:p-6 flex flex-col bg-gray-50">
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white h-[45vh] lg:h-[70vh] mb-4">
                  {auto.imagenes && auto.imagenes.length > 0 && auto.imagenes[selectedImageIndex]?.url ? (
                    <Image
                      src={getImageUrl(auto.imagenes[selectedImageIndex].url, 'medium')}
                      alt={`${auto.marca?.nombre} ${auto.modelo?.nombre} - Imagen ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain cursor-pointer"
                      onClick={() => { setIsFullscreen(true); setZoom(1); }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-500 font-medium text-lg">Sin imagen disponible</span>
                      </div>
                    </div>
                  )}

                  {/* Botón de zoom */}
                  {auto.imagenes && auto.imagenes.length > 0 && auto.imagenes[selectedImageIndex]?.url && (
                    <button
                      onClick={() => { setIsFullscreen(true); setZoom(1); }}
                      className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-20"
                      aria-label="Ampliar imagen"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  )}
                  {/* Controles de navegación invisibles */}
                  {auto.imagenes && auto.imagenes.length > 1 && (
                    <>
                      <div
                        className="absolute left-0 top-0 w-1/2 h-full cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        aria-label="Imagen anterior"
                      />
                      <div
                        className="absolute right-0 top-0 w-1/2 h-full cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        aria-label="Imagen siguiente"
                      />
                    </>
                  )}

                  {/* Indicador de imagen actual */}
                  {auto.imagenes && auto.imagenes.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {auto.imagenes.length}
                    </div>
                  )}
                </div>

                {/* Miniaturas - siempre horizontal, debajo de la imagen */}
                {auto.imagenes && auto.imagenes.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2 px-4 lg:px-6">
                    {auto.imagenes.map((imagen, index) => (
                      imagen.url && (
                        <button
                          key={imagen.id}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === selectedImageIndex
                              ? 'border-blue-500 shadow-lg scale-105'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <Image
                            src={getImageUrl(imagen.url, 'low')}
                            alt={`Miniatura ${index + 1}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del auto - al lado en desktop, abajo en móvil */}
            <div className="lg:w-1/3 bg-white p-4 lg:p-6 lg:border-l border-gray-200">
              {/* Precio Premium */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200 mb-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center space-x-4 mb-2">
                    <span className="text-4xl font-bold text-red-600">
                      ${auto.precio?.toLocaleString('es-ES')}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${(auto.precio * 1.1)?.toLocaleString('es-ES')}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                      10% OFF
                    </span>
                  </div>
                  <p className="text-sm text-red-600 font-medium">Precio exclusivo con todas las garantías incluidas</p>
                </div>
              </div>

              {/* Características del producto */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Características del Producto</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Año:</span> {auto.anio}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Tipo:</span> {auto.tipo}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Estado:</span> {auto.estado?.nombre}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Stock:</span> {auto.en_stock ? 'Disponible' : 'Agotado'}
                    </p>
                  </div>
                </div>
              </div>

              {auto.descripcion && (
                <div className="mb-6 bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Acerca de este Vehículo Premium</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">{auto.descripcion}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <button onClick={() => setShowQuotationModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center" aria-label="Solicitar cotización">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Solicitar Cotización
                </button>
                <button className="w-full border-2 border-gray-300 hover:border-red-600 text-gray-700 hover:text-red-600 px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center" aria-label="Agregar a favoritos">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Agregar a Favoritos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de pantalla completa */}
      {isFullscreen && auto.imagenes && auto.imagenes.length > 0 && auto.imagenes[selectedImageIndex]?.url && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(Math.max(0.5, Math.min(3, zoom + delta)));
          }} onClick={(e) => e.stopPropagation()}>
            <Image
              src={getImageUrl(auto.imagenes[selectedImageIndex].url, 'high')}
              alt={`${auto.marca?.nombre} ${auto.modelo?.nombre} - Imagen ${selectedImageIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-w-full max-h-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            />

            {/* Botón cerrar */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"
              aria-label="Cerrar imagen completa"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Controles de zoom */}
            <div className="absolute bottom-4 right-4 flex space-x-4">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Reducir zoom"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Aumentar zoom"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Controles en pantalla completa */}
            {auto.imagenes && auto.imagenes.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"
                  aria-label="Imagen siguiente"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Indicador */}
            {auto.imagenes && auto.imagenes.length > 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {auto.imagenes.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de cotización */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-700 to-gray-900 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Solicitar Cotización</h3>
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <form onSubmit={handleQuotationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={quotationForm.nombre_usuario}
                    onChange={(e) => setQuotationForm({...quotationForm, nombre_usuario: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={quotationForm.email}
                    onChange={(e) => setQuotationForm({...quotationForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={quotationForm.telefono}
                    onChange={(e) => setQuotationForm({...quotationForm, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={quotationForm.ciudad}
                    onChange={(e) => setQuotationForm({...quotationForm, ciudad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo nos conociste?</label>
                  <select
                    value={quotationForm.fuente}
                    onChange={(e) => setQuotationForm({...quotationForm, fuente: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="web">Sitio web</option>
                    <option value="recomendacion">Recomendación</option>
                    <option value="redes_sociales">Redes sociales</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferencia de contacto</label>
                  <select
                    value={quotationForm.preferencias_contacto}
                    onChange={(e) => setQuotationForm({...quotationForm, preferencias_contacto: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="telefono">Teléfono</option>
                    <option value="email,telefono">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    value={quotationForm.mensaje}
                    onChange={(e) => setQuotationForm({...quotationForm, mensaje: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalles adicionales sobre tu interés..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
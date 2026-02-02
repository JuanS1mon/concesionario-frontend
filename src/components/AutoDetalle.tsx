'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Auto, Imagen } from '@/types';

interface AutoDetalleProps {
  auto: Auto;
  onClose: () => void;
}

export default function AutoDetalle({ auto, onClose }: AutoDetalleProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === auto.imagenes.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? auto.imagenes.length - 1 : prev - 1
    );
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
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-blue-600/10"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {auto.marca?.nombre} {auto.modelo?.nombre}
              </h2>
              <div className="flex items-center space-x-4 text-gray-300 text-sm">
                <span>{auto.anio}</span>
                <span>•</span>
                <span>{auto.tipo}</span>
                <span>•</span>
                <span>{auto.estado?.nombre}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
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
                      onClick={() => setIsFullscreen(true)}
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
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 mb-6">
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium mb-2">Precio</p>
                  <p className="text-4xl font-bold text-green-700">
                    ${auto.precio?.toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              {/* Especificaciones en fila horizontal */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Especificaciones</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[120px] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-center">
                      <p className="text-sm text-blue-600 font-medium">Año</p>
                      <p className="text-2xl font-bold text-blue-700">{auto.anio}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[120px] bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                    <div className="text-center">
                      <p className="text-sm text-purple-600 font-medium">Tipo</p>
                      <p className="text-2xl font-bold text-purple-700">{auto.tipo}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[120px] bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                    <div className="text-center">
                      <p className="text-sm text-orange-600 font-medium">Estado</p>
                      <p className="text-2xl font-bold text-orange-700">{auto.estado?.nombre}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[120px] bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                    <div className="text-center">
                      <p className="text-sm text-emerald-600 font-medium">Stock</p>
                      <p className={`text-2xl font-bold ${auto.en_stock ? 'text-emerald-700' : 'text-red-600'}`}>
                        {auto.en_stock ? 'Disponible' : 'Agotado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {auto.descripcion && (
                <div className="mb-6 bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">{auto.descripcion}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg" aria-label="Solicitar cotización">
                  Solicitar Cotización
                </button>
                <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg" aria-label="Contactar vendedor">
                  Contactar Vendedor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de pantalla completa */}
      {isFullscreen && auto.imagenes && auto.imagenes.length > 0 && auto.imagenes[selectedImageIndex]?.url && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <Image
              src={getImageUrl(auto.imagenes[selectedImageIndex].url, 'high')}
              alt={`${auto.marca?.nombre} ${auto.modelo?.nombre} - Imagen ${selectedImageIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-w-full max-h-full"
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
    </div>
  );
}
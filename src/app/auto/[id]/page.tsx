'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import { Auto } from '@/types';
import { autosAPI } from '@/lib/api';

export default function AutoDetail() {
  const [auto, setAuto] = useState<Auto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    loadAuto();
  }, [id]);

  const loadAuto = async () => {
    try {
      setLoading(true);
      const response = await autosAPI.getById(parseInt(id));
      setAuto(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el auto');
      console.error('Error loading auto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="ml-4 text-gray-600 font-medium">Cargando vehículo...</p>
        </div>
      </div>
    );
  }

  if (error || !auto) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center bg-gray-50 rounded-2xl p-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.5-2.5m.5 5.5a9.963 9.963 0 006 0M12 4c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Vehículo no encontrado</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb moderno */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-600 hover:text-red-600 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">{auto.marca?.nombre} {auto.modelo?.nombre}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Imágenes */}
            <div className="relative">
              {auto.imagenes && auto.imagenes.length > 0 ? (
                <div className="aspect-square bg-gray-100">
                  <img
                    src={auto.imagenes[0].url}
                    alt={`${auto.marca?.nombre} ${auto.modelo?.nombre}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-500 font-medium">Sin imagen disponible</span>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col space-y-3">
                {auto.en_stock ? (
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ✓ Disponible
                  </span>
                ) : (
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ✗ Agotado
                  </span>
                )}
                <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                  {auto.estado?.nombre}
                </span>
              </div>

              {/* Miniaturas */}
              {auto.imagenes && auto.imagenes.length > 1 && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex space-x-2 overflow-x-auto">
                    {auto.imagenes.slice(1, 4).map((imagen, index) => (
                      <div key={index} className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                        <img
                          src={imagen.url}
                          alt={`Vista ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Información del auto */}
            <div className="p-8 lg:p-12">
              <div className="mb-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {auto.marca?.nombre} {auto.modelo?.nombre}
                </h1>
                <div className="flex items-center space-x-4 text-lg text-gray-600 mb-6">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {auto.anio}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {auto.tipo}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline space-x-4">
                  <span className="text-5xl font-bold text-red-600">
                    ${auto.precio.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ${(auto.precio * 1.1).toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                    10% OFF
                  </span>
                </div>
                <p className="text-gray-600 mt-2">Precio final, incluye todos los impuestos</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleContactClick}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contactar Vendedor
                </button>
                <button className="flex-1 border-2 border-gray-300 hover:border-red-600 text-gray-700 hover:text-red-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Agregar a Favoritos
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-xl p-4">
                  <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-semibold text-gray-900">Garantía</div>
                  <div className="text-xs text-gray-600">12 meses</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="text-sm font-semibold text-gray-900">Entrega</div>
                  <div className="text-xs text-gray-600">Rápida</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Especificaciones adicionales */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Especificaciones Técnicas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Marca</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{auto.marca?.nombre}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Modelo</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{auto.modelo?.nombre}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Año</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{auto.anio}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tipo</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{auto.tipo}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Estado</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{auto.estado?.nombre}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Stock</div>
              <div className={`text-xl font-bold mt-1 ${auto.en_stock ? 'text-green-600' : 'text-red-600'}`}>
                {auto.en_stock ? 'Disponible' : 'Agotado'}
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {auto.descripcion && (
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Descripción Detallada</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">{auto.descripcion}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de contacto premium */}
      <Modal isOpen={showContactModal} onClose={closeContactModal}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Contactar Vendedor</h2>
                <p className="text-red-100">Complete el formulario y nos pondremos en contacto</p>
              </div>
              <button
                onClick={closeContactModal}
                className="text-white hover:text-red-200 transition-colors p-2 rounded-full hover:bg-white/10"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Información del auto */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border-l-4 border-red-600">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Vehículo Seleccionado</h3>
                  <p className="text-gray-600">{auto.marca?.nombre} {auto.modelo?.nombre} {auto.anio}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                ${auto.precio.toLocaleString()}
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ingrese su nombre completo"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ingrese su email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="Ingrese su número de teléfono"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  placeholder="¿Tiene alguna pregunta específica sobre este vehículo?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeContactModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar Consulta
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Al enviar este formulario, acepta nuestros términos y condiciones.</p>
              <p className="mt-1">Nos pondremos en contacto dentro de 24 horas.</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
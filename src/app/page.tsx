'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import CarCard from '@/components/CarCard';
import FilterSidebar from '@/components/FilterSidebar';
import Modal from '@/components/Modal';
import Carousel from '@/components/Carousel';
import { Auto, FiltrosAutos } from '@/types';
import { autosAPI } from '@/lib/api';

export default function Home() {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [filtros, setFiltros] = useState<FiltrosAutos>({});
  const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAutos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await autosAPI.getAll(filtros);
      setAutos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los autos');
      console.error('Error loading autos:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    loadAutos();
  }, [filtros, loadAutos]);

  const handleAutoClick = (auto: Auto) => {
    setSelectedAuto(auto);
  };

  const closeModal = () => {
    setSelectedAuto(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Concesionario Premium
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubre la excelencia automotriz. Autos premium con garantía y el mejor servicio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Explorar Catálogo
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Contactar Vendedor
              </button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-blue-600 to-red-600"></div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </h2>
              <FilterSidebar filtros={filtros} onFiltrosChange={setFiltros} />
            </div>
          </div>

          {/* Lista de autos */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuestra Flota</h2>
              <p className="text-gray-600">Descubre autos excepcionales con las mejores condiciones</p>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Cargando vehículos premium...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6 mb-8">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
                <button
                  onClick={loadAutos}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && autos.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron vehículos</h3>
                <p className="text-gray-600">Prueba ajustando los filtros para ver más opciones.</p>
              </div>
            )}

            {!loading && !error && autos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {autos.map((auto) => (
                  <CarCard
                    key={auto.id}
                    auto={auto}
                    onClick={() => handleAutoClick(auto)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de detalles del auto */}
      <Modal
        isOpen={!!selectedAuto}
        onClose={closeModal}
        title=""
      >
        {selectedAuto && (
          <div className="max-w-4xl mx-auto">
            {/* Header con título premium */}
            <div className="text-center mb-8 pb-6 border-b border-gray-200">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {selectedAuto.marca?.nombre} {selectedAuto.modelo?.nombre}
              </h2>
              <div className="flex items-center justify-center space-x-4 text-lg">
                <span className="text-red-600 font-bold text-2xl">
                  ${selectedAuto.precio.toLocaleString()}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{selectedAuto.anio}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{selectedAuto.estado?.nombre}</span>
              </div>
            </div>

            {/* Carrusel de imágenes */}
            <div className="mb-8">
              <Carousel
                images={selectedAuto.imagenes}
                alt={`${selectedAuto.marca?.nombre} ${selectedAuto.modelo?.nombre}`}
              />
            </div>

            {/* Especificaciones en grid moderno */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedAuto.anio}</div>
                <div className="text-sm text-gray-600">Año</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedAuto.tipo}</div>
                <div className="text-sm text-gray-600">Tipo</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedAuto.estado?.nombre}</div>
                <div className="text-sm text-gray-600">Estado</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${selectedAuto.en_stock ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedAuto.en_stock ? 'Disponible' : 'Agotado'}
                </div>
                <div className="text-sm text-gray-600">Stock</div>
              </div>
            </div>

            {/* Descripción */}
            {selectedAuto.descripcion && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{selectedAuto.descripcion}</p>
              </div>
            )}

            {/* Botones de acción premium */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Solicitar Cotización
              </button>
              <button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contactar Vendedor
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


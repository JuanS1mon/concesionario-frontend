'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { PlusCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import CarCard from '@/components/CarCard';
import FilterSidebar from '@/components/FilterSidebar';
import AutoDetalle from '@/components/AutoDetalle';
import AdminHero from '@/components/AdminHero';
import AutoEditModal from '@/components/AutoEditModal';
import { Auto, FiltrosAutos, PaginatedAutos } from '@/types';
import { autosAPI } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';

export default function AdminAutos() {
  const [filtros, setFiltros] = useState<FiltrosAutos>({});
  const [debouncedFiltros, setDebouncedFiltros] = useState<FiltrosAutos>({});
  const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);
  const [editingAuto, setEditingAuto] = useState<Auto | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'precio' | 'anio'>('precio');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageSize = 12;
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFiltros(filtros);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [filtros]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFiltros]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  const autosKey = useMemo(() => ['admin-autos-all'], []);

  const { data: allAutos, error, isLoading, isValidating, mutate } = useSWR<Auto[]>(
    autosKey,
    () => autosAPI.getAll({}).then((response) => response.data),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const filteredAndSortedAutos = useMemo(() => {
    if (!allAutos) return [];

    let filtered = allAutos.filter((auto) => {
      if (debouncedFiltros.marca_id && auto.marca_id !== debouncedFiltros.marca_id) return false;
      if (debouncedFiltros.modelo_id && auto.modelo_id !== debouncedFiltros.modelo_id) return false;
      if (debouncedFiltros.anio_min && auto.anio < debouncedFiltros.anio_min) return false;
      if (debouncedFiltros.anio_max && auto.anio > debouncedFiltros.anio_max) return false;
      if (debouncedFiltros.tipo && auto.tipo !== debouncedFiltros.tipo) return false;
      if (debouncedFiltros.precio_min && auto.precio < debouncedFiltros.precio_min) return false;
      if (debouncedFiltros.precio_max && auto.precio > debouncedFiltros.precio_max) return false;
      if (debouncedFiltros.en_stock !== undefined && auto.en_stock !== debouncedFiltros.en_stock) return false;
      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'precio') {
        aVal = a.precio;
        bVal = b.precio;
      } else {
        aVal = a.anio;
        bVal = b.anio;
      }
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    return filtered;
  }, [allAutos, debouncedFiltros, sortBy, sortOrder]);

  const totalAutos = filteredAndSortedAutos.length;
  const totalPages = Math.max(1, Math.ceil(totalAutos / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const autosData = filteredAndSortedAutos.slice(startIndex, endIndex);

  const isInitialLoading = !allAutos && isLoading;
  const errorMessage = error ? 'Error al cargar los autos' : null;

  const handleAutoClick = (auto: Auto) => {
    setSelectedAuto(auto);
  };

  const closeModal = () => {
    setSelectedAuto(null);
  };

  const handleEdit = (auto: Auto) => {
    setEditingAuto(auto);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingAuto(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este auto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/autos/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        mutate((current) => {
          if (!current) {
            return current;
          }
          return current.filter((auto) => auto.id !== id);
        }, false);
      } else {
        alert('Error al eliminar el auto');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toggle Button for Hero */}
      <div className="fixed top-20 right-4 z-30">
        <button
          onClick={() => setHeroVisible(!heroVisible)}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200"
          title={heroVisible ? 'Ocultar encabezado' : 'Mostrar encabezado'}
        >
          {heroVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Hero Section */}
      {heroVisible && (
        <AdminHero
          title="Panel de Administración - Autos"
          description="Gestiona la flota de autos premium. Agrega, edita y administra todos los vehículos."
          buttonText="Agregar Nuevo Auto"
          buttonHref="/admin/autos/nuevo"
          buttonIcon={<PlusCircleIcon className="h-6 w-6" />}
        />
      )}

      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className={sidebarVisible ? "max-w-7xl mx-auto" : "w-full"}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de filtros */}
          {sidebarVisible ? (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-8">
                <FilterSidebar filtros={filtros} onFiltrosChange={setFiltros} onToggle={() => setSidebarVisible(false)} />
              </div>
            </div>
          ) : (
            <div className="lg:col-span-1">
              <button
                onClick={() => setSidebarVisible(true)}
                className="w-full bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 p-4 text-center transition-all hover:shadow-xl sticky top-8"
              >
                <svg className="w-6 h-6 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-xs font-medium text-gray-700">Mostrar Filtros</span>
              </button>
            </div>
          )}

          {/* Lista de autos */}
          <div className={sidebarVisible ? "lg:col-span-3" : "lg:col-span-4"}>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Autos</h2>
                <p className="text-gray-600">Administra todos los vehículos de la flota</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('_');
                    setSortBy(by as 'precio' | 'anio');
                    setSortOrder(order as 'asc' | 'desc');
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Ordenar autos"
                >
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                  <option value="anio_asc">Año: Menor a Mayor</option>
                  <option value="anio_desc">Año: Mayor a Menor</option>
                </select>
              </div>
            </div>

            {isInitialLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Cargando vehículos...</p>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6 mb-8">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800 font-medium">{errorMessage}</p>
                </div>
                <button
                  onClick={() => mutate()}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}

            {isValidating && !allAutos && autosData.length > 0 && (
              <div className="mb-6 text-sm text-gray-500">
                Cargando lista...
              </div>
            )}

            {!isInitialLoading && !errorMessage && autosData.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron vehículos</h3>
                <p className="text-gray-600">Prueba ajustando los filtros o agrega un nuevo auto.</p>
              </div>
            )}

            {!isInitialLoading && !errorMessage && autosData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {autosData.map((auto) => (
                  <CarCard
                    key={auto.id}
                    auto={auto}
                    onClick={() => handleAutoClick(auto)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {!isInitialLoading && !errorMessage && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>

      {/* Modal de detalles del auto */}
      {selectedAuto && (
        <AutoDetalle
          auto={selectedAuto}
          onClose={closeModal}
        />
      )}

      <AutoEditModal
        auto={editingAuto}
        isOpen={isEditOpen}
        onClose={closeEditModal}
        onSaved={() => {
          mutate();
          closeEditModal();
        }}
      />
    </div>
  );
}

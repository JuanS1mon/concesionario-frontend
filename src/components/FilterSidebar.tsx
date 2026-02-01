'use client';

import { useState, useEffect, memo } from 'react';
import { FiltrosAutos, Marca, Modelo } from '@/types';
import { marcasAPI, modelosAPI } from '@/lib/api';

interface FilterSidebarProps {
  filtros: FiltrosAutos;
  onFiltrosChange: (filtros: FiltrosAutos) => void;
  onToggle?: () => void;
}

const FilterSidebar = memo(function FilterSidebar({ filtros, onFiltrosChange, onToggle }: FilterSidebarProps) {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);

  useEffect(() => {
    // Cargar datos iniciales
    const loadData = async () => {
      try {
        const marcasRes = await marcasAPI.getAll();
        setMarcas(marcasRes.data);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };
    loadData();
  }, []);

  const handleMarcaChange = async (marcaId: string) => {
    const newFiltros = { ...filtros, marca_id: marcaId ? parseInt(marcaId) : undefined, modelo_id: undefined };
    onFiltrosChange(newFiltros);

    if (marcaId) {
      try {
        const modelosRes = await modelosAPI.getAll();
        const modelosFiltrados = modelosRes.data.filter((modelo: Modelo) => modelo.marca_id === parseInt(marcaId));
        setModelos(modelosFiltrados);
      } catch (error) {
        console.error('Error loading modelos:', error);
      }
    } else {
      setModelos([]);
    }
  };

  const updateFiltro = (key: keyof FiltrosAutos, value: string | number | boolean | undefined) => {
    const newFiltros = { ...filtros, [key]: value };
    onFiltrosChange(newFiltros);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ocultar filtros"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Marca */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Marca
        </label>
        <select
          value={filtros.marca_id || ''}
          onChange={(e) => handleMarcaChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          aria-label="Seleccionar marca"
        >
          <option value="">Todas las marcas</option>
          {marcas.map((marca) => (
            <option key={marca.id} value={marca.id}>
              {marca.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Modelo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modelo
        </label>
        <select
          value={filtros.modelo_id || ''}
          onChange={(e) => updateFiltro('modelo_id', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          disabled={!filtros.marca_id}
          aria-label="Seleccionar modelo"
        >
          <option value="">Todos los modelos</option>
          {modelos.map((modelo) => (
            <option key={modelo.id} value={modelo.id}>
              {modelo.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Año */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Año
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Desde"
            value={filtros.anio_min || ''}
            onChange={(e) => updateFiltro('anio_min', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Hasta"
            value={filtros.anio_max || ''}
            onChange={(e) => updateFiltro('anio_max', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tipo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo
        </label>
        <select
          value={filtros.tipo || ''}
          onChange={(e) => updateFiltro('tipo', e.target.value || undefined)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          aria-label="Seleccionar tipo de vehículo"
        >
          <option value="">Todos los tipos</option>
          <option value="Sedán">Sedán</option>
          <option value="SUV">SUV</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Pickup">Pickup</option>
          <option value="Coupe">Coupe</option>
          <option value="Convertible">Convertible</option>
        </select>
      </div>

      {/* Precio */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Mínimo"
            value={filtros.precio_min || ''}
            onChange={(e) => updateFiltro('precio_min', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Máximo"
            value={filtros.precio_max || ''}
            onChange={(e) => updateFiltro('precio_max', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stock */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filtros.en_stock ?? true}
            onChange={(e) => updateFiltro('en_stock', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Solo en stock</span>
        </label>
      </div>

      {/* Botón limpiar */}
      <button
        onClick={() => onFiltrosChange({})}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
      >
        Limpiar filtros
      </button>
    </div>
  );
});

export default FilterSidebar;

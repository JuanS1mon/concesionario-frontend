'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusCircleIcon,
  TruckIcon,
  TagIcon,
  CubeIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/solid';
import { API_BASE_URL } from '@/lib/constants';
import { Auto, Marca, Modelo, Estado } from '@/types';
import AdminHero from '@/components/AdminHero';

interface InventarioStats {
  totalAutos: number;
  autosEnStock: number;
  autosFueraStock: number;
  totalMarcas: number;
  totalModelos: number;
  totalEstados: number;
  precioPromedio: number;
  precioMax: number;
  precioMin: number;
  valorInventario: number;
}

export default function InventarioDashboard() {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const [autosRes, marcasRes, modelosRes, estadosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/autos/`, { headers }),
        fetch(`${API_BASE_URL}/marcas/`, { headers }),
        fetch(`${API_BASE_URL}/modelos/`, { headers }),
        fetch(`${API_BASE_URL}/estados/`, { headers }),
      ]);

      if (autosRes.ok) setAutos(await autosRes.json());
      if (marcasRes.ok) setMarcas(await marcasRes.json());
      if (modelosRes.ok) setModelos(await modelosRes.json());
      if (estadosRes.ok) setEstados(await estadosRes.json());
    } catch (err) {
      console.error('Error loading inventario data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats: InventarioStats = useMemo(() => {
    const precios = autos.map(a => a.precio).filter(p => p > 0);
    return {
      totalAutos: autos.length,
      autosEnStock: autos.filter(a => a.en_stock).length,
      autosFueraStock: autos.filter(a => !a.en_stock).length,
      totalMarcas: marcas.length,
      totalModelos: modelos.length,
      totalEstados: estados.length,
      precioPromedio: precios.length > 0 ? Math.round(precios.reduce((a, b) => a + b, 0) / precios.length) : 0,
      precioMax: precios.length > 0 ? Math.max(...precios) : 0,
      precioMin: precios.length > 0 ? Math.min(...precios) : 0,
      valorInventario: precios.reduce((a, b) => a + b, 0),
    };
  }, [autos, marcas, modelos, estados]);

  const autosPorMarca = useMemo(() => {
    const map: Record<string, number> = {};
    autos.forEach(a => {
      const nombre = a.marca?.nombre || 'Sin marca';
      map[nombre] = (map[nombre] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [autos]);

  const autosPorEstado = useMemo(() => {
    const map: Record<string, number> = {};
    autos.forEach(a => {
      const nombre = a.estado?.nombre || 'Sin estado';
      map[nombre] = (map[nombre] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [autos]);

  const autosRecientes = useMemo(() => {
    return [...autos].sort((a, b) => b.id - a.id).slice(0, 5);
  }, [autos]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHero
        title="Inventario"
        description="Gestión de vehículos, marcas, modelos y estados"
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/admin/autos/nuevo" className="block group">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <PlusCircleIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Nuevo Auto</h3>
              <p className="text-xs text-gray-500">Agregar vehículo</p>
            </div>
          </Link>
          <Link href="/admin/autos" className="block group">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Autos</h3>
              <p className="text-xs text-gray-500">{stats.totalAutos} vehículos</p>
            </div>
          </Link>
          <Link href="/admin/marcas" className="block group">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Marcas</h3>
              <p className="text-xs text-gray-500">{stats.totalMarcas} marcas</p>
            </div>
          </Link>
          <Link href="/admin/modelos" className="block group">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <CubeIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Modelos</h3>
              <p className="text-xs text-gray-500">{stats.totalModelos} modelos</p>
            </div>
          </Link>
          <Link href="/admin/estados" className="block group">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Estados</h3>
              <p className="text-xs text-gray-500">{stats.totalEstados} estados</p>
            </div>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Autos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAutos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">En Stock</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.autosEnStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArchiveBoxIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.autosFueraStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900">${stats.precioPromedio.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">${stats.valorInventario.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Autos por Marca */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Marca</h3>
            {autosPorMarca.length > 0 ? (
              <div className="space-y-3">
                {autosPorMarca.map(([marca, cantidad]) => {
                  const pct = stats.totalAutos > 0 ? (cantidad / stats.totalAutos) * 100 : 0;
                  return (
                    <div key={marca}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{marca}</span>
                        <span className="text-gray-500">{cantidad} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de marcas</p>
            )}
          </div>

          {/* Autos por Estado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Estado</h3>
            {autosPorEstado.length > 0 ? (
              <div className="space-y-3">
                {autosPorEstado.map(([estado, cantidad]) => {
                  const pct = stats.totalAutos > 0 ? (cantidad / stats.totalAutos) * 100 : 0;
                  const colors: Record<string, string> = {
                    'Nuevo': 'from-emerald-500 to-green-500',
                    'Usado': 'from-blue-500 to-indigo-500',
                    'Reservado': 'from-yellow-500 to-orange-500',
                    'Vendido': 'from-red-500 to-pink-500',
                  };
                  const colorClass = colors[estado] || 'from-gray-500 to-gray-600';
                  return (
                    <div key={estado}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{estado}</span>
                        <span className="text-gray-500">{cantidad} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`bg-gradient-to-r ${colorClass} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de estados</p>
            )}
          </div>
        </div>

        {/* Rango de Precios */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rango de Precios del Inventario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Precio Mínimo</p>
              <p className="text-2xl font-bold text-green-600">${stats.precioMin.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Precio Promedio</p>
              <p className="text-2xl font-bold text-blue-600">${stats.precioPromedio.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Precio Máximo</p>
              <p className="text-2xl font-bold text-purple-600">${stats.precioMax.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Autos Recientes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Últimos Vehículos Agregados</h3>
            <Link href="/admin/autos" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          {autosRecientes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">ID</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Marca</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Modelo</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Año</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Tipo</th>
                    <th className="text-right py-3 px-2 text-gray-500 font-medium">Precio</th>
                    <th className="text-center py-3 px-2 text-gray-500 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {autosRecientes.map(auto => (
                    <tr key={auto.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-900 font-medium">#{auto.id}</td>
                      <td className="py-3 px-2 text-gray-700">{auto.marca?.nombre || '-'}</td>
                      <td className="py-3 px-2 text-gray-700">{auto.modelo?.nombre || '-'}</td>
                      <td className="py-3 px-2 text-gray-700">{auto.anio}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {auto.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-900">
                        ${auto.precio.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {auto.en_stock ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            En stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Sin stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay vehículos en el inventario</p>
          )}
        </div>
      </div>
    </div>
  );
}

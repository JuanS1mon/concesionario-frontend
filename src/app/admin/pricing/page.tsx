'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PrecioSugerido, EstadisticasPricing, Marca, Modelo } from '@/types';
import { pricingAPI, marcasAPI, modelosAPI } from '@/lib/api';
import AdminHero from '@/components/AdminHero';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  QuestionMarkCircleIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/solid';

const competitividadConfig: Record<string, { label: string; color: string; bg: string }> = {
  muy_competitivo: { label: 'Muy Competitivo', color: 'text-green-700', bg: 'bg-green-100' },
  competitivo: { label: 'Competitivo', color: 'text-blue-700', bg: 'bg-blue-100' },
  caro: { label: 'Caro', color: 'text-red-700', bg: 'bg-red-100' },
  sin_datos: { label: 'Sin datos', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function PricingDashboard() {
  const [analisis, setAnalisis] = useState<PrecioSugerido[]>([]);
  const [stats, setStats] = useState<EstadisticasPricing | null>(null);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [compFilter, setCompFilter] = useState('all');
  const [scraping, setScraping] = useState(false);
  const [normalizing, setNormalizing] = useState(false);
  const [scrapingMsg, setScrapingMsg] = useState('');
  const [sortField, setSortField] = useState<string>('competitividad');
  const [sortAsc, setSortAsc] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [savingPrice, setSavingPrice] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ id: number; msg: string; ok: boolean } | null>(null);
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
      const [analisisRes, statsRes, marcasRes, modelosRes] = await Promise.all([
        pricingAPI.getAnalisis(),
        pricingAPI.getEstadisticas(),
        marcasAPI.getAll(),
        modelosAPI.getAll(),
      ]);
      setAnalisis(analisisRes.data);
      setStats(statsRes.data);
      setMarcas(marcasRes.data);
      setModelos(modelosRes.data);
    } catch (error: any) {
      console.error('Error al cargar datos de pricing:', error);
      if (error.response?.status === 401) {
        console.log('Token expirado, redirigiendo al login...');
        router.push('/admin');
      } else {
        // Mostrar mensaje de error al usuario
        setScrapingMsg('Error al cargar datos. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScraping = async () => {
    setScraping(true);
    setScrapingMsg('');
    try {
      const res = await pricingAPI.ejecutarScraping('all');
      setScrapingMsg(`Scraping: ${res.data.nuevos} nuevos, ${res.data.duplicados} duplicados, ${res.data.errores} errores`);
      loadData();
    } catch (error: any) {
      console.error('Error al ejecutar scraping:', error);
      if (error.response?.status === 401) {
        setScrapingMsg('Sesión expirada. Redirigiendo al login...');
        setTimeout(() => router.push('/admin'), 2000);
      } else {
        setScrapingMsg('Error al ejecutar scraping');
      }
    } finally {
      setScraping(false);
    }
  };

  const handleNormalizacion = async () => {
    setNormalizing(true);
    setScrapingMsg('');
    try {
      const res = await pricingAPI.ejecutarNormalizacion();
      setScrapingMsg(`Normalización: ${res.data.normalizados} normalizados, ${res.data.sin_match} sin match, ${res.data.outliers_filtrados} outliers filtrados`);
      loadData();
    } catch (error: any) {
      console.error('Error al normalizar:', error);
      if (error.response?.status === 401) {
        setScrapingMsg('Sesión expirada. Redirigiendo al login...');
        setTimeout(() => router.push('/admin'), 2000);
      } else {
        setScrapingMsg('Error al normalizar');
      }
    } finally {
      setNormalizing(false);
    }
  };

  const startEditing = useCallback((item: PrecioSugerido) => {
    setEditingId(item.auto_id);
    setEditPrice(item.precio_actual);
    setSaveMsg(null);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditPrice(0);
  }, []);

  const applyPrecioSugerido = useCallback((item: PrecioSugerido) => {
    if (item.precio_sugerido) {
      setEditingId(item.auto_id);
      setEditPrice(Math.round(item.precio_sugerido));
    }
  }, []);

  const handleSavePrice = useCallback(async (autoId: number) => {
    setSavingPrice(true);
    try {
      await pricingAPI.actualizarPrecio(autoId, editPrice);
      setSaveMsg({ id: autoId, msg: 'Precio guardado', ok: true });
      setAnalisis((prev) =>
        prev.map((item) =>
          item.auto_id === autoId ? { ...item, precio_actual: editPrice } : item,
        ),
      );
      setEditingId(null);
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (error: any) {
      console.error('Error al guardar precio:', error);
      if (error.response?.status === 401) {
        setSaveMsg({ id: autoId, msg: 'Sesión expirada', ok: false });
        setTimeout(() => router.push('/admin'), 2000);
      } else {
        setSaveMsg({ id: autoId, msg: 'Error al guardar', ok: false });
      }
    } finally {
      setSavingPrice(false);
    }
  }, [editPrice]);

  const filteredAnalisis = useMemo(() => {
    return analisis.filter((item) => {
      if (compFilter !== 'all' && item.competitividad !== compFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return [item.marca, item.modelo, item.anio?.toString()].filter(Boolean).join(' ').toLowerCase().includes(term);
    });
  }, [analisis, compFilter, searchTerm]);

  const sortedAnalisis = useMemo(() => {
    const sorted = [...filteredAnalisis];
    sorted.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortField) {
        case 'marca': va = a.marca || ''; vb = b.marca || ''; break;
        case 'precio_actual': va = a.precio_actual; vb = b.precio_actual; break;
        case 'precio_sugerido': va = a.precio_sugerido || 0; vb = b.precio_sugerido || 0; break;
        case 'competitividad':
          const order: Record<string, number> = { caro: 3, competitivo: 2, muy_competitivo: 1, sin_datos: 0 };
          va = order[a.competitividad || 'sin_datos'] ?? 0;
          vb = order[b.competitividad || 'sin_datos'] ?? 0;
          break;
        case 'comparables': va = a.comparables_count || 0; vb = b.comparables_count || 0; break;
        default: va = a.precio_actual; vb = b.precio_actual;
      }
      if (typeof va === 'string' && typeof vb === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return sorted;
  }, [filteredAnalisis, sortField, sortAsc]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const fmt = (n?: number | null) => n != null ? '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 }) : '—';

  const SortIcon = ({ field }: { field: string }) => (
    sortField === field ? (sortAsc ? <ChevronUpIcon className="w-3 h-3 inline ml-1" /> : <ChevronDownIcon className="w-3 h-3 inline ml-1" />) : null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          title="Pricing Inteligente"
          description="Análisis de precios de mercado, competitividad y precios sugeridos para tu inventario"
        />
      )}

      <div className="p-2 md:p-6">

        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-black p-4 rounded-xl text-center text-white shadow" title="Total de autos en stock analizados">
              <div className="text-2xl font-bold">{stats.total_analizados}</div>
              <div className="text-xs text-white/80 mt-1">Analizados</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 via-green-600 to-black p-4 rounded-xl text-center text-white shadow" title="Autos con suficientes datos de mercado para calcular competitividad">
              <div className="text-2xl font-bold">{stats.con_datos_mercado}</div>
              <div className="text-xs text-white/80 mt-1">Con Datos</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-black p-4 rounded-xl text-center text-white shadow" title={`Muy Competitivo: Precio < 95% de la mediana del mercado. Venden muy rápido pero con menor margen. (${stats.muy_competitivos} autos)`}>
              <div className="text-2xl font-bold">{stats.muy_competitivos}</div>
              <div className="text-xs text-white/80 mt-1">Muy Competitivos</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-black p-4 rounded-xl text-center text-white shadow" title={`Competitivo: Precio entre 95%-105% de la mediana del mercado. Balance óptimo entre velocidad de venta y margen. (${stats.competitivos} autos)`}>
              <div className="text-2xl font-bold">{stats.competitivos}</div>
              <div className="text-xs text-white/80 mt-1">Competitivos</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 via-red-600 to-black p-4 rounded-xl text-center text-white shadow" title={`Caro: Precio > 105% de la mediana del mercado. Mayor margen pero venden más lento. (${stats.caros} autos)`}>
              <div className="text-2xl font-bold">{stats.caros}</div>
              <div className="text-xs text-white/80 mt-1">Caros</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-black p-4 rounded-xl text-center text-white shadow" title={`Total de publicaciones de mercado procesadas y normalizadas (${stats.total_listings_mercado})`}>
              <div className="text-2xl font-bold">{stats.total_listings_mercado}</div>
              <div className="text-xs text-white/80 mt-1">Listings Mercado</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-black p-4 rounded-xl text-center text-white shadow" title={`Fuentes de datos activas: ${stats.fuentes_activas.join(', ') || 'Ninguna'}`}>
              <div className="text-lg font-bold">{stats.fuentes_activas.length > 0 ? stats.fuentes_activas.join(', ') : '—'}</div>
              <div className="text-xs text-white/80 mt-1">Fuentes Activas</div>
            </div>
            {stats.margen_promedio && (
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-black p-4 rounded-xl text-center text-white shadow" title={`Margen promedio estimado: ${fmt(stats.margen_promedio)} (calculado como 15% sobre precio de compra estimado)`}>
                <div className="text-lg font-bold">{fmt(stats.margen_promedio)}</div>
                <div className="text-xs text-white/80 mt-1">Margen Promedio</div>
              </div>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, año..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            title="Filtrar por competitividad"
            className="border rounded-lg px-3 py-2 text-sm text-gray-700"
            value={compFilter}
            onChange={(e) => setCompFilter(e.target.value)}
          >
            <option value="all">Toda competitividad</option>
            <option value="muy_competitivo">🟢 Muy Competitivo</option>
            <option value="competitivo">🔵 Competitivo</option>
            <option value="caro">🔴 Caro</option>
            <option value="sin_datos">⚪ Sin datos</option>
          </select>
          <button
            onClick={handleScraping}
            disabled={scraping}
            className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
            {scraping ? 'Scraping...' : 'Scraping'}
          </button>
          <button
            onClick={handleNormalizacion}
            disabled={normalizing}
            className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${normalizing ? 'animate-spin' : ''}`} />
            {normalizing ? 'Normalizando...' : 'Normalizar'}
          </button>
          <button
            onClick={() => router.push('/admin/pricing/simulador')}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Simulador →
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition ${showHelp ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            title="¿Cómo funciona?"
          >
            <QuestionMarkCircleIcon className="w-4 h-4" />
            Ayuda
          </button>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <QuestionMarkCircleIcon className="w-5 h-5" />
                ¿Cómo funciona el Pricing Inteligente?
              </h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600" title="Cerrar ayuda">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Paso 1 */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-bold">1</span>
                  <span className="font-semibold text-gray-900">Scraping</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Obtiene publicaciones reales de <strong>MercadoLibre</strong> y <strong>Kavak</strong> y las guarda como datos crudos.
                  Son precios del mercado que aún no están vinculados a tus marcas/modelos.
                </p>
              </div>
              {/* Paso 2 */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-sm font-bold">2</span>
                  <span className="font-semibold text-gray-900">Normalización</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Vincula los datos crudos con tus marcas y modelos internos, filtra precios absurdos (outliers)
                  y genera datos limpios. <strong>No modifica tus precios.</strong>
                </p>
              </div>
              {/* Paso 3 */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold">3</span>
                  <span className="font-semibold text-gray-900">Análisis</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Compara cada auto de tu inventario contra la <strong>mediana del mercado</strong> de autos similares.
                  Genera un precio sugerido y clasifica la competitividad. Usá el slider para ajustar.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-500 mt-0.5">💡</span>
              <p className="text-sm text-amber-800">
                <strong>Flujo recomendado:</strong> Ejecutá <em>Scraping</em> → luego <em>Normalizar</em> → y la tabla se actualiza automáticamente con el análisis.
                Podés usar el botón <strong>$</strong> en cada fila para ajustar el precio con un slider y guardarlo.
              </p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {scrapingMsg && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            {scrapingMsg}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('marca')}>
                    Auto <SortIcon field="marca" />
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('precio_actual')}>
                    Precio Actual <SortIcon field="precio_actual" />
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('precio_sugerido')}>
                    Precio Sugerido <SortIcon field="precio_sugerido" />
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Mediana Mercado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('competitividad')}>
                    Competitividad <SortIcon field="competitividad" />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('comparables')}>
                    Comp. <SortIcon field="comparables" />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Ajustar Precio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedAnalisis.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {analisis.length === 0
                        ? 'No hay autos en stock para analizar. Ejecutá el scraping primero.'
                        : 'No se encontraron resultados con los filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  sortedAnalisis.map((item) => {
                    const comp = competitividadConfig[item.competitividad || 'sin_datos'];
                    const diff = item.precio_sugerido && item.precio_actual
                      ? ((item.precio_sugerido - item.precio_actual) / item.precio_actual) * 100
                      : null;
                    const isEditing = editingId === item.auto_id;
                    const sliderMin = Math.round((item.precio_mercado_mediana || item.precio_actual) * 0.7);
                    const sliderMax = Math.round((item.precio_mercado_mediana || item.precio_actual) * 1.3);
                    const editDiff = isEditing && item.precio_actual
                      ? ((editPrice - item.precio_actual) / item.precio_actual) * 100
                      : null;
                    const isSaved = saveMsg?.id === item.auto_id;
                    return (
                      <tr key={item.auto_id} className={`hover:bg-gray-50 transition ${isEditing ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">{item.marca} {item.modelo}</div>
                          <div className="text-xs text-gray-500">{item.anio} · ID #{item.auto_id}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{fmt(item.precio_actual)}</td>
                        <td className="px-4 py-3 text-right text-sm">
                          <span className="font-semibold text-gray-900">{fmt(item.precio_sugerido)}</span>
                          {diff !== null && (
                            <span className={`ml-1 text-xs ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              ({diff > 0 ? '+' : ''}{diff.toFixed(1)}%)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{fmt(item.precio_mercado_mediana)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${comp.bg} ${comp.color}`} title={
                            item.competitividad === 'muy_competitivo' ? 'Precio < 95% de la mediana del mercado. Vende rápido pero con menor margen.' :
                            item.competitividad === 'competitivo' ? 'Precio entre 95%-105% de la mediana del mercado. Balance óptimo entre velocidad y margen.' :
                            item.competitividad === 'caro' ? 'Precio > 105% de la mediana del mercado. Mayor margen pero vende más lento.' :
                            'No hay suficientes datos de mercado para calcular competitividad.'
                          }>
                            {comp.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{item.comparables_count ?? 0}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="min-w-[220px] space-y-2">
                              {/* Slider */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min={sliderMin}
                                  max={sliderMax}
                                  step={10000}
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                  title="Ajustar precio"
                                />
                              </div>
                              {/* Price display + input */}
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400">$</span>
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-28 text-sm border border-gray-300 rounded px-2 py-1 text-right text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  title="Precio"
                                  placeholder="Precio"
                                />
                                {editDiff !== null && (
                                  <span className={`text-xs font-medium ${editDiff > 0 ? 'text-green-600' : editDiff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                    {editDiff > 0 ? '+' : ''}{editDiff.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              {/* Quick actions */}
                              <div className="flex items-center gap-1">
                                {item.precio_sugerido && (
                                  <button
                                    onClick={() => applyPrecioSugerido(item)}
                                    className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                                    title="Usar precio sugerido"
                                  >
                                    Sugerido
                                  </button>
                                )}
                                {item.precio_mercado_mediana && (
                                  <button
                                    onClick={() => setEditPrice(Math.round(item.precio_mercado_mediana!))}
                                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                                    title="Usar mediana del mercado"
                                  >
                                    Mediana
                                  </button>
                                )}
                                <div className="flex-1" />
                                <button
                                  onClick={() => handleSavePrice(item.auto_id)}
                                  disabled={savingPrice || editPrice === item.precio_actual}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-40 transition"
                                  title="Guardar precio"
                                >
                                  <CheckIcon className="w-3 h-3" />
                                  Guardar
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition"
                                  title="Cancelar"
                                >
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {isSaved && (
                                <span className={`text-xs mr-1 ${saveMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                                  {saveMsg.msg}
                                </span>
                              )}
                              <button
                                onClick={() => startEditing(item)}
                                className="text-amber-600 hover:text-amber-800 p-1 hover:bg-amber-50 rounded transition"
                                title="Ajustar precio"
                              >
                                <CurrencyDollarIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/pricing/simulador?auto_id=${item.auto_id}`)}
                                className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                                title="Simular precio"
                              >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen inferior */}
        <div className="mt-4 text-sm text-gray-500 text-right">
          Mostrando {sortedAnalisis.length} de {analisis.length} autos · {stats?.total_listings_mercado || 0} listings de mercado
        </div>

      </div>
    </div>
  );
}

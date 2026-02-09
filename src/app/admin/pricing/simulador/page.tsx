'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Auto, Marca, Modelo, SimulacionPrecio, PrecioSugerido } from '@/types';
import { pricingAPI, autosAPI, marcasAPI, modelosAPI } from '@/lib/api';
import AdminHero from '@/components/AdminHero';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';

const compColors: Record<string, string> = {
  muy_competitivo: 'text-green-600',
  competitivo: 'text-blue-600',
  caro: 'text-red-600',
  sin_datos: 'text-gray-400',
};

const compLabels: Record<string, string> = {
  muy_competitivo: 'Muy Competitivo',
  competitivo: 'Competitivo',
  caro: 'Caro',
  sin_datos: 'Sin datos',
};

export default function PricingSimulador() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoIdParam = searchParams.get('auto_id');

  const [autos, setAutos] = useState<Auto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [selectedAutoId, setSelectedAutoId] = useState<number | null>(autoIdParam ? parseInt(autoIdParam) : null);
  const [analisis, setAnalisis] = useState<PrecioSugerido | null>(null);
  const [simulaciones, setSimulaciones] = useState<SimulacionPrecio[]>([]);
  const [precioSlider, setPrecioSlider] = useState<number>(0);
  const [simulacionActual, setSimulacionActual] = useState<SimulacionPrecio | null>(null);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/admin');
    loadBase();
  }, []);

  useEffect(() => {
    if (selectedAutoId) loadAutoAnalisis(selectedAutoId);
  }, [selectedAutoId]);

  const loadBase = async () => {
    try {
      const [autosRes, marcasRes, modelosRes] = await Promise.all([
        autosAPI.getAll({ en_stock: true }),
        marcasAPI.getAll(),
        modelosAPI.getAll(),
      ]);
      setAutos(autosRes.data);
      setMarcas(marcasRes.data);
      setModelos(modelosRes.data);
    } catch {
      console.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const loadAutoAnalisis = async (autoId: number) => {
    setSimLoading(true);
    try {
      const [analisisRes] = await Promise.all([
        pricingAPI.getAnalisisAuto(autoId),
      ]);
      const data = analisisRes.data;
      setAnalisis(data);

      // Calcular rango del slider: 70% - 130% de la mediana (o precio actual)
      const base = data.precio_mercado_mediana || data.precio_actual;
      const min = Math.round(base * 0.7);
      const max = Math.round(base * 1.3);
      setPrecioSlider(data.precio_actual);

      // Cargar simulaciones del rango
      const rangeRes = await pricingAPI.simularRango(autoId, min, max, 15);
      setSimulaciones(rangeRes.data);

      // Simular precio actual
      const simRes = await pricingAPI.simular(autoId, data.precio_actual);
      setSimulacionActual(simRes.data);
    } catch {
      console.error('Error cargando análisis');
    } finally {
      setSimLoading(false);
    }
  };

  const handleSliderChange = useCallback(async (value: number) => {
    setPrecioSlider(value);
    if (!selectedAutoId) return;
    try {
      const res = await pricingAPI.simular(selectedAutoId, value);
      setSimulacionActual(res.data);
    } catch {
      console.error('Error simulando');
    }
  }, [selectedAutoId]);

  const selectedAuto = useMemo(() => autos.find(a => a.id === selectedAutoId), [autos, selectedAutoId]);

  const getMarcaNombre = (id: number) => marcas.find(m => m.id === id)?.nombre || '';
  const getModeloNombre = (id: number) => modelos.find(m => m.id === id)?.nombre || '';
  const fmt = (n?: number | null) => n != null ? '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 }) : '—';

  const sliderMin = analisis ? Math.round((analisis.precio_mercado_mediana || analisis.precio_actual) * 0.7) : 0;
  const sliderMax = analisis ? Math.round((analisis.precio_mercado_mediana || analisis.precio_actual) * 1.3) : 100;

  // Bar chart: height based on probability
  const maxDias = simulaciones.length > 0 ? Math.max(...simulaciones.map(s => s.dias_estimados)) : 100;

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
          title="Simulador de Precios"
          description="Simulá el impacto de diferentes precios en el tiempo de venta estimado"
        />
      )}

      <div className="p-2 md:p-6">
        {/* Back + Auto Selector */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <button
            onClick={() => router.push('/admin/pricing')}
            className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Volver al Dashboard
          </button>
          <select
            title="Seleccionar auto"
            className="flex-1 max-w-md border rounded-lg px-3 py-2 text-sm text-gray-700"
            value={selectedAutoId || ''}
            onChange={(e) => setSelectedAutoId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Seleccionar un auto...</option>
            {autos.map((auto) => (
              <option key={auto.id} value={auto.id}>
                {getMarcaNombre(auto.marca_id)} {getModeloNombre(auto.modelo_id)} {auto.anio} — {fmt(auto.precio)}
              </option>
            ))}
          </select>
        </div>

        {!selectedAutoId && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            <p className="text-lg">Seleccioná un auto del inventario para comenzar la simulación</p>
          </div>
        )}

        {selectedAutoId && simLoading && (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {selectedAutoId && !simLoading && analisis && (
          <div className="space-y-6">
            {/* Auto Info + Market Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Auto Info Card */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Auto</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Marca:</span> <span className="font-medium text-gray-900">{analisis.marca}</span></div>
                  <div><span className="text-gray-500">Modelo:</span> <span className="font-medium text-gray-900">{analisis.modelo}</span></div>
                  <div><span className="text-gray-500">Año:</span> <span className="font-medium text-gray-900">{analisis.anio}</span></div>
                  <div><span className="text-gray-500">Precio actual:</span> <span className="font-bold text-gray-900">{fmt(analisis.precio_actual)}</span></div>
                  <div><span className="text-gray-500">Comparables:</span> <span className="font-medium text-gray-900">{analisis.comparables_count || 0}</span></div>
                  <div>
                    <span className="text-gray-500">Competitividad:</span>{' '}
                    <span className={`font-medium ${compColors[analisis.competitividad || 'sin_datos']}`}>
                      {compLabels[analisis.competitividad || 'sin_datos']}
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Data Card */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Datos del Mercado</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Promedio:</span> <span className="font-medium text-gray-900">{fmt(analisis.precio_mercado_promedio)}</span></div>
                  <div><span className="text-gray-500">Mediana:</span> <span className="font-bold text-blue-700">{fmt(analisis.precio_mercado_mediana)}</span></div>
                  <div><span className="text-gray-500">Precio sugerido:</span> <span className="font-bold text-green-700">{fmt(analisis.precio_sugerido)}</span></div>
                  <div><span className="text-gray-500">Margen actual:</span> <span className="font-medium text-gray-900">{fmt(analisis.margen_actual)}</span></div>
                  <div><span className="text-gray-500">Margen sugerido:</span> <span className="font-medium text-emerald-700">{fmt(analisis.margen_sugerido)}</span></div>
                  <div><span className="text-gray-500">Ajuste km:</span> <span className="font-medium text-gray-900">{fmt(analisis.ajuste_km)}</span></div>
                </div>
              </div>
            </div>

            {/* Slider + Simulación en tiempo real */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Simulador de Precio</h3>

              {/* Precio slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Precio propuesto</span>
                  <span className="text-2xl font-bold text-blue-700">{fmt(precioSlider)}</span>
                </div>
                <input
                  type="range"
                  title="Ajustar precio propuesto"
                  min={sliderMin}
                  max={sliderMax}
                  step={Math.max(1, Math.round((sliderMax - sliderMin) / 100))}
                  value={precioSlider}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{fmt(sliderMin)}</span>
                  <span className="text-blue-500 font-medium">Mediana: {fmt(analisis.precio_mercado_mediana)}</span>
                  <span>{fmt(sliderMax)}</span>
                </div>
              </div>

              {/* Resultado de simulación */}
              {simulacionActual && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-black p-4 rounded-xl text-center text-white shadow">
                    <div className="text-2xl font-bold">{simulacionActual.dias_estimados.toFixed(0)}</div>
                    <div className="text-xs text-white/80 mt-1">Días Estimados</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 via-green-600 to-black p-4 rounded-xl text-center text-white shadow">
                    <div className="text-2xl font-bold">{simulacionActual.probabilidad_venta_30dias}%</div>
                    <div className="text-xs text-white/80 mt-1">Prob. Venta 30 días</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-black p-4 rounded-xl text-center text-white shadow">
                    <div className="text-lg font-bold">{fmt(simulacionActual.margen_estimado)}</div>
                    <div className="text-xs text-white/80 mt-1">Margen Estimado</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-black p-4 rounded-xl text-center text-white shadow">
                    <div className={`text-lg font-bold`}>
                      {compLabels[simulacionActual.competitividad] || simulacionActual.competitividad}
                    </div>
                    <div className="text-xs text-white/80 mt-1">Competitividad</div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart: simulación rango como barras */}
            {simulaciones.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Curva Precio vs Tiempo de Venta</h3>
                <div className="flex items-end gap-1 h-48">
                  {simulaciones.map((sim, idx) => {
                    const barHeight = maxDias > 0 ? (sim.dias_estimados / maxDias) * 100 : 10;
                    const isActive = Math.abs(sim.precio_propuesto - precioSlider) < (sliderMax - sliderMin) / 15;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="text-[10px] text-gray-500 mb-1">{sim.dias_estimados.toFixed(0)}d</div>
                        <div
                          className={`w-full rounded-t transition-all duration-200 ${
                            isActive ? 'bg-blue-600' : sim.competitividad === 'caro' ? 'bg-red-400' : sim.competitividad === 'muy_competitivo' ? 'bg-green-400' : 'bg-blue-400'
                          }`}
                          style={{ height: `${Math.max(barHeight, 4)}%` }}
                          title={`${fmt(sim.precio_propuesto)} → ${sim.dias_estimados.toFixed(0)} días (${sim.probabilidad_venta_30dias}%)`}
                        />
                        <div className="text-[8px] text-gray-400 mt-1 rotate-[-45deg] origin-left whitespace-nowrap">
                          {(sim.precio_propuesto / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-3 border-t pt-2">
                  <span>← Más barato (vende rápido)</span>
                  <span>Más caro (vende lento) →</span>
                </div>
              </div>
            )}

            {/* Botón aplicar precio sugerido */}
            {analisis.precio_sugerido && analisis.precio_sugerido !== analisis.precio_actual && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-800">
                    El precio sugerido es <strong>{fmt(analisis.precio_sugerido)}</strong> (mediana de {analisis.comparables_count} comparables)
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Diferencia: {fmt(analisis.precio_sugerido - analisis.precio_actual)} ({(((analisis.precio_sugerido - analisis.precio_actual) / analisis.precio_actual) * 100).toFixed(1)}%)
                  </p>
                </div>
                <button
                  onClick={() => setPrecioSlider(analisis.precio_sugerido!)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 whitespace-nowrap"
                >
                  Usar Precio Sugerido
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState, useMemo, useRef } from "react";
// Función para convertir URLs en texto a enlaces HTML
function linkify(text: string): string {
  if (!text) return '';
  return text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    // Mostrar solo el dominio si es muy largo
    let display = url;
    try {
      const u = new URL(url);
      display = u.hostname.replace('www.', '') + u.pathname + (u.hash || '');
    } catch {}
    return `<a href="${url}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline;">${display}</a>`;
  });
}
import useSWR from "swr";
import Link from "next/link";
import CarCard from "@/components/CarCard";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import { MarketListing, FiltrosAutos } from "@/types";


export default function ComparaPreciosPage() {
  const [filtros, setFiltros] = useState<FiltrosAutos>({});
  const [aplicarFiltros, setAplicarFiltros] = useState<FiltrosAutos>({});
  const [usarIA, setUsarIA] = useState(false);

  // Construir query params para el endpoint de mercado
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (aplicarFiltros.marca_id) p.append('marca_id', String(aplicarFiltros.marca_id));
    if (aplicarFiltros.modelo_id) p.append('modelo_id', String(aplicarFiltros.modelo_id));
    if (aplicarFiltros.anio_min) p.append('anio_min', String(aplicarFiltros.anio_min));
    if (aplicarFiltros.anio_max) p.append('anio_max', String(aplicarFiltros.anio_max));
    if (aplicarFiltros.tipo) p.append('tipo', aplicarFiltros.tipo);
    if (aplicarFiltros.precio_min) p.append('precio_min', String(aplicarFiltros.precio_min));
    if (aplicarFiltros.precio_max) p.append('precio_max', String(aplicarFiltros.precio_max));
    p.append('limit', '50');
    return p.toString();
  }, [aplicarFiltros]);

  const endpoint = usarIA ? `/api/market/ai_sugerir?${params}` : `/api/market/search?${params}`;
  const { data: marketData, error, isLoading, mutate } = useSWR<MarketListing[]>(
    aplicarFiltros && Object.keys(aplicarFiltros).length > 0 ? endpoint : null,
    (url: string) => fetch(url).then(r => r.json()),
    { revalidateOnFocus: false }
  );

  // Adaptar respuesta según si es IA o búsqueda manual
  // Estado para limpiar sugerencia IA al buscar de nuevo
  const [showSugerencia, setShowSugerencia] = useState(false);
  const prevEndpoint = useRef<string | null>(null);
  let sugerenciaIA: string | null = null;
  let autosData: any[] = [];
  if (usarIA && marketData && typeof marketData === 'object' && 'candidates' in marketData) {
    sugerenciaIA = marketData.sugerencia || null;
    autosData = Array.isArray(marketData.candidates) ? marketData.candidates : [];
    if (!showSugerencia) setShowSugerencia(true);
  } else if (Array.isArray(marketData)) {
    autosData = marketData;
    if (showSugerencia) setShowSugerencia(false);
  }

  // Limpiar sugerencia IA al cambiar endpoint (nueva búsqueda)
  if (endpoint !== prevEndpoint.current) {
    prevEndpoint.current = endpoint;
    if (usarIA) setShowSugerencia(false);
  }
  // Adaptar MarketListing a Auto para la Card
  const adaptMarketToAuto = (m: MarketListing): any => ({
    ...m,
    tipo: '',
    en_stock: false,
    estado_id: 0,
    imagenes: m.url ? [{ id: 0, url: m.url }] : [],
    marca: m.marca_id ? { id: m.marca_id, nombre: m.fuente || '' } : undefined,
    modelo: m.modelo_id ? { id: m.modelo_id, nombre: '' } : undefined,
    estado: { id: 0, nombre: '' },
    descripcion: '',
  });
  const ordenados = autosData.length > 0 ? [...autosData].sort((a, b) => a.precio - b.precio).map(adaptMarketToAuto) : [];
  const n = ordenados.length;
  const mas_baratos = ordenados.slice(0, 5);
  const mas_caros = ordenados.slice(-5).reverse();
  const medios = n > 10 ? ordenados.slice(Math.floor(n/2)-2, Math.floor(n/2)+3) : ordenados.slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Comparador de Precios de Mercado
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Compara precios de autos en el mercado y accede a análisis inteligente.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center mt-6">
              <button
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg"
                onClick={() => {
                  setShowSugerencia(false);
                  setAplicarFiltros(filtros);
                }}
                style={{ minWidth: 220 }}
              >
                Buscar Comparación
              </button>
              <label className="flex items-center gap-2 text-lg bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                <input
                  type="checkbox"
                  checked={usarIA}
                  onChange={e => {
                    setShowSugerencia(false);
                    setUsarIA(e.target.checked);
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                Buscar con IA
              </label>
              <button 
                onClick={() => document.getElementById('comparador-lista')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ minWidth: 180 }}
              >
                Ver Resultados
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600"></div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-8 flex flex-col gap-6">
              <FilterSidebar filtros={filtros} onFiltrosChange={setFiltros} />
              <div className="flex flex-col gap-4">
                <button
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 shadow"
                  onClick={() => {
                    setShowSugerencia(false);
                    setAplicarFiltros(filtros);
                  }}
                >
                  Buscar Comparación
                </button>
                <label className="flex items-center gap-2 text-base bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                  <input
                    type="checkbox"
                    checked={usarIA}
                    onChange={e => {
                      setShowSugerencia(false);
                      setUsarIA(e.target.checked);
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  Buscar con IA
                </label>
              </div>
            </div>
          </div>
          {/* Lista de autos comparados */}
          <div className="lg:col-span-3">
            <div id="comparador-lista" className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados de Mercado</h2>
                <p className="text-gray-600">Los 5 más baratos, 5 medios y 5 más caros</p>
              </div>
            </div>
            {isLoading && usarIA ? (
              <div className="flex flex-col items-center justify-center py-16">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="text-lg text-blue-700 font-semibold">Generando nuevo análisis, por favor aguarde…</span>
              </div>
            ) : (
              <>
                {usarIA && sugerenciaIA && showSugerencia && (
                  <div className="mb-6">
                    <div className="flex flex-col gap-3">
                      {/* Avatar y burbuja principal */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-300 shadow-sm">🤖</div>
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-blue-900 max-w-2xl shadow">
                          <strong>Análisis IA:</strong>
                        </div>
                      </div>
                      {/* Mensajes individuales */}
                      {sugerenciaIA.split(/(?=\d+\))/g).map((msg, idx) => (
                        msg.trim() && (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10"></div>
                            <div className="bg-white border border-blue-100 rounded-2xl px-5 py-3 text-gray-900 max-w-2xl shadow" style={{marginLeft:0}}>
                              <span dangerouslySetInnerHTML={{ __html: linkify(msg.trim()) }} />
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {(['mas_baratos','medios','mas_caros'] as const).map(tipo => (
                    (tipo === 'mas_baratos' ? mas_baratos : tipo === 'medios' ? medios : mas_caros).map((auto: any, idx: number) => (
                      <CarCard
                        key={tipo+idx}
                        auto={auto}
                        onClick={() => auto.url && window.open(auto.url, '_blank')}
                      />
                    ))
                  ))}
                  {ordenados.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">No se encontraron resultados para estos filtros.</div>
                  )}
                </div>
              </>
            )}
            {/* Sin análisis IA */}
          </div>
        </div>
      </main>
    </div>
  );
}

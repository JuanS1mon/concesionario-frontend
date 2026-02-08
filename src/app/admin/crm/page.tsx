'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EstadisticasClientes, EstadisticasOportunidades, Cliente, Oportunidad, Cotizacion } from '@/types';
import { clientesAPI, oportunidadesAPI, cotizacionesAPI } from '@/lib/api';
import AdminHero from '@/components/AdminHero';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/solid';

export default function DashboardCRM() {
  const [statsClientes, setStatsClientes] = useState<EstadisticasClientes | null>(null);
  const [statsOportunidades, setStatsOportunidades] = useState<EstadisticasOportunidades | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/admin');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scRes, soRes, clRes, opRes, cotRes] = await Promise.all([
        clientesAPI.getEstadisticas(),
        oportunidadesAPI.getEstadisticas(),
        clientesAPI.getAll(),
        oportunidadesAPI.getAll(),
        cotizacionesAPI.getAll(),
      ]);
      setStatsClientes(scRes.data);
      setStatsOportunidades(soRes.data);
      setClientes(clRes.data);
      setOportunidades(opRes.data);
      setCotizaciones(cotRes.data);
    } catch (err) {
      console.error('Error cargando datos CRM', err);
    } finally {
      setLoading(false);
    }
  };

  // Cotizaciones recientes (últimas 5)
  const cotizacionesRecientes = useMemo(() =>
    [...cotizaciones].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()).slice(0, 5)
    , [cotizaciones]);

  // Clientes recientes (últimos 5)
  const clientesRecientes = useMemo(() =>
    [...clientes].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()).slice(0, 5)
    , [clientes]);

  // Oportunidades calientes (alta prioridad, no cerradas)
  const oportunidadesCalientes = useMemo(() =>
    oportunidades
      .filter(o => !['ganada', 'perdida'].includes(o.etapa))
      .sort((a, b) => b.probabilidad - a.probabilidad)
      .slice(0, 5)
    , [oportunidades]);

  // Oportunidades con acción próxima
  const oportunidadesProximas = useMemo(() =>
    oportunidades
      .filter(o => o.fecha_proxima_accion && !['ganada', 'perdida'].includes(o.etapa))
      .sort((a, b) => new Date(a.fecha_proxima_accion!).getTime() - new Date(b.fecha_proxima_accion!).getTime())
      .slice(0, 5)
    , [oportunidades]);

  const colorCalif: Record<string, string> = { frio: 'bg-blue-500', tibio: 'bg-yellow-500', caliente: 'bg-red-500' };
  const colorEtapa: Record<string, string> = {
    prospecto: 'bg-gray-400', contacto: 'bg-blue-400', evaluacion: 'bg-indigo-400',
    negociacion: 'bg-yellow-400', cierre: 'bg-orange-400', ganada: 'bg-green-500', perdida: 'bg-red-500',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <AdminHero
        title="Dashboard CRM"
        description="Visión general de clientes, oportunidades y rendimiento de ventas"
      />

      {/* Navegación CRM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/cotizaciones" className="group block">
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Cotizaciones</h3>
                <p className="text-sm text-gray-500">{cotizaciones.length} solicitudes</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/admin/clientes" className="group block">
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Clientes</h3>
                <p className="text-sm text-gray-500">{clientes.length} registrados</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/admin/oportunidades" className="group block">
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <RocketLaunchIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Oportunidades</h3>
                <p className="text-sm text-gray-500">{oportunidades.length} en seguimiento</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm opacity-90">Cotizaciones</div>
              <div className="text-3xl font-bold mt-1">{cotizaciones.length}</div>
            </div>
            <DocumentTextIcon className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-xs opacity-75 mt-2">Solicitudes recibidas</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm opacity-90">Total Clientes</div>
              <div className="text-3xl font-bold mt-1">{statsClientes?.total || 0}</div>
            </div>
            <UserGroupIcon className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-xs opacity-75 mt-2">Score promedio: {statsClientes?.score_promedio || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm opacity-90">Valor en Proceso</div>
              <div className="text-3xl font-bold mt-1">${(statsOportunidades?.valor_pipeline || 0).toLocaleString()}</div>
            </div>
            <CurrencyDollarIcon className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-xs opacity-75 mt-2">{statsOportunidades?.total || 0} oportunidades activas</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm opacity-90">Ventas Ganadas</div>
              <div className="text-3xl font-bold mt-1">${(statsOportunidades?.valor_ganado || 0).toLocaleString()}</div>
            </div>
            <CheckCircleIcon className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-xs opacity-75 mt-2">{statsOportunidades?.por_etapa.ganada || 0} oportunidades cerradas</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm opacity-90">Tasa Conversión</div>
              <div className="text-3xl font-bold mt-1">{statsOportunidades?.tasa_conversion || 0}%</div>
            </div>
            <ArrowTrendingUpIcon className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-xs opacity-75 mt-2">De oportunidades cerradas</div>
        </div>
      </div>

      {/* Fila 2: Funnel + Calificación de Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Funnel de Ventas */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-500" /> Funnel de Ventas
          </h3>
          <div className="space-y-3">
            {['prospecto', 'contacto', 'evaluacion', 'negociacion', 'cierre', 'ganada', 'perdida'].map((etapa) => {
              const count = statsOportunidades?.por_etapa[etapa as keyof typeof statsOportunidades.por_etapa] || 0;
              const total = statsOportunidades?.total || 1;
              const pct = Math.round((count / total) * 100);
              const labels: Record<string, string> = {
                prospecto: '🎯 Prospecto', contacto: '📞 Contacto', evaluacion: '🔍 Evaluación',
                negociacion: '🤝 Negociación', cierre: '📝 Cierre', ganada: '✅ Ganada', perdida: '❌ Perdida',
              };
              return (
                <div key={etapa} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 truncate">{labels[etapa]}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div className={`h-full rounded-full ${colorEtapa[etapa]} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 2)}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                      {count} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calificación de Leads */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-red-500" /> Calificación de Leads
          </h3>

          {/* Indicadores de calificación */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { key: 'caliente', icon: '🔥', label: 'Calientes', color: 'bg-red-50 text-red-700 border-red-200' },
              { key: 'tibio', icon: '🌤️', label: 'Tibios', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
              { key: 'frio', icon: '❄️', label: 'Fríos', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            ].map(({ key, icon, label, color }) => (
              <div key={key} className={`${color} border rounded-xl p-4 text-center`}>
                <div className="text-2xl">{icon}</div>
                <div className="text-2xl font-bold mt-1">
                  {statsClientes?.por_calificacion[key as keyof typeof statsClientes.por_calificacion] || 0}
                </div>
                <div className="text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Estado de clientes */}
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Embudo de Ventas</h4>
          <div className="space-y-2">
            {['nuevo', 'contactado', 'calificado', 'cliente', 'perdido'].map((estado) => {
              const count = statsClientes?.por_estado[estado as keyof typeof statsClientes.por_estado] || 0;
              const total = statsClientes?.total || 1;
              const pct = Math.round((count / total) * 100);
              const colors: Record<string, string> = {
                nuevo: 'bg-gray-400', contactado: 'bg-blue-400', calificado: 'bg-purple-400',
                cliente: 'bg-green-500', perdido: 'bg-red-400',
              };
              return (
                <div key={estado} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600 capitalize">{estado}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                    <div className={`h-full rounded-full ${colors[estado]} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fila 3: Cotizaciones recientes */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-amber-500" /> Cotizaciones Recientes
          </h3>
          <Link href="/admin/cotizaciones" className="text-sm text-blue-600 hover:underline">Ver todas →</Link>
        </div>
        {cotizacionesRecientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Cliente', 'Email', 'Vehículo', 'Estado', 'Fecha'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cotizacionesRecientes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500 font-mono">#{c.id}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{c.nombre_usuario}</td>
                    <td className="px-4 py-2 text-gray-600">{c.email}</td>
                    <td className="px-4 py-2 text-gray-600">{c.auto?.marca?.nombre || ''} {c.auto?.modelo?.nombre || ''}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.estado_oportunidad === 'Nuevo' ? 'bg-gray-100 text-gray-700' :
                        c.estado_oportunidad?.includes('Contactado') ? 'bg-blue-100 text-blue-700' :
                        c.estado_oportunidad?.includes('Interesado') ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{c.estado_oportunidad || 'Nuevo'}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{new Date(c.fecha_creacion).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4 text-sm">Sin cotizaciones aún</div>
        )}
      </div>

      {/* Fila 4: Tablas rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Clientes recientes */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Clientes Recientes</h3>
            <Link href="/admin/clientes" className="text-sm text-blue-600 hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {clientesRecientes.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  c.calificacion === 'caliente' ? 'bg-red-500' : c.calificacion === 'tibio' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}>
                  {c.nombre[0]}{c.apellido[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{c.nombre} {c.apellido}</div>
                  <div className="text-xs text-gray-500 truncate">{c.email}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(c.fecha_creacion).toLocaleDateString()}</div>
              </div>
            ))}
            {clientesRecientes.length === 0 && <div className="text-center text-gray-400 py-4 text-sm">Sin clientes aún</div>}
          </div>
        </div>

        {/* Oportunidades más calientes */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Top Oportunidades</h3>
            <Link href="/admin/oportunidades" className="text-sm text-blue-600 hover:underline">Ver todas →</Link>
          </div>
          <div className="space-y-3">
            {oportunidadesCalientes.map((o) => (
              <div key={o.id} className="p-3 rounded-lg border hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium text-gray-900 truncate flex-1">{o.titulo}</div>
                  <span className="text-xs text-green-600 font-bold ml-2">{o.probabilidad}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{o.cliente?.nombre} {o.cliente?.apellido}</div>
                <div className="flex justify-between items-center mt-2">
                  {o.valor_estimado && <span className="text-xs font-bold text-green-600">${o.valor_estimado.toLocaleString()}</span>}
                  <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                    o.etapa === 'negociacion' ? 'bg-yellow-100 text-yellow-800' :
                    o.etapa === 'cierre' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>{o.etapa}</span>
                </div>
              </div>
            ))}
            {oportunidadesCalientes.length === 0 && <div className="text-center text-gray-400 py-4 text-sm">Sin oportunidades</div>}
          </div>
        </div>

        {/* Próximas acciones */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-orange-500" /> Próximas Acciones
            </h3>
          </div>
          <div className="space-y-3">
            {oportunidadesProximas.map((o) => {
              const fecha = new Date(o.fecha_proxima_accion!);
              const hoy = new Date();
              const diff = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              const esUrgente = diff <= 1;
              return (
                <div key={o.id} className={`p-3 rounded-lg border ${esUrgente ? 'border-red-200 bg-red-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-gray-900 truncate flex-1">{o.proxima_accion}</div>
                    {esUrgente && <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{o.titulo} — {o.cliente?.nombre} {o.cliente?.apellido}</div>
                  <div className="text-xs mt-1 font-medium" style={{ color: esUrgente ? '#dc2626' : '#6b7280' }}>
                    📅 {fecha.toLocaleDateString()} {diff === 0 ? '(Hoy)' : diff === 1 ? '(Mañana)' : diff < 0 ? '(Vencida)' : `(en ${diff} días)`}
                  </div>
                </div>
              );
            })}
            {oportunidadesProximas.length === 0 && <div className="text-center text-gray-400 py-4 text-sm">Sin acciones programadas</div>}
          </div>
        </div>
      </div>

      {/* Fila 4: Prioridad de oportunidades */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Prioridad</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { key: 'urgente', icon: '🚨', label: 'Urgente', color: 'border-red-300 bg-red-50' },
            { key: 'alta', icon: '🔴', label: 'Alta', color: 'border-orange-300 bg-orange-50' },
            { key: 'media', icon: '🟡', label: 'Media', color: 'border-yellow-300 bg-yellow-50' },
            { key: 'baja', icon: '🟢', label: 'Baja', color: 'border-green-300 bg-green-50' },
          ].map(({ key, icon, label, color }) => (
            <div key={key} className={`border-2 ${color} rounded-xl p-4 text-center`}>
              <div className="text-2xl">{icon}</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {statsOportunidades?.por_prioridad[key as keyof typeof statsOportunidades.por_prioridad] || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

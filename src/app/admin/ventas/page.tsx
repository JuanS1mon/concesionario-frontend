'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Venta, Cliente, Auto, Marca, Modelo, Cotizacion, Oportunidad, EstadisticasVentas } from '@/types';
import { ventasAPI, clientesAPI, autosAPI, marcasAPI, modelosAPI, cotizacionesAPI, oportunidadesAPI } from '@/lib/api';
import AdminHero from '@/components/AdminHero';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/solid';

const ESTADOS_VENTA = ['pendiente', 'completada', 'cancelada'];
const TIPOS_VEHICULO = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Coupé', 'Convertible', 'Van', 'Otro'];

const colorEstado: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};

const iconEstado: Record<string, string> = {
  pendiente: '⏳',
  completada: '✅',
  cancelada: '❌',
};

export default function AdminVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [autos, setAutos] = useState<Auto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [stats, setStats] = useState<EstadisticasVentas | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [incluyeAutoTomado, setIncluyeAutoTomado] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    auto_vendido_id: '',
    precio_venta: '',
    precio_toma: '',
    es_parte_pago: false,
    ganancia_estimada: '',
    cotizacion_id: '',
    oportunidad_id: '',
    estado: 'completada',
    notas: '',
    fecha_venta: '',
    // Auto tomado inline
    tomado_marca_id: '',
    tomado_modelo_id: '',
    tomado_anio: '',
    tomado_tipo: '',
    tomado_precio: '',
    tomado_descripcion: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/admin');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ventasRes, clientesRes, autosRes, marcasRes, modelosRes, cotRes, opRes, statsRes] = await Promise.all([
        ventasAPI.getAll(),
        clientesAPI.getAll(),
        autosAPI.getAll(),
        marcasAPI.getAll(),
        modelosAPI.getAll(),
        cotizacionesAPI.getAll(),
        oportunidadesAPI.getAll(),
        ventasAPI.getEstadisticas(),
      ]);
      setVentas(ventasRes.data);
      setClientes(clientesRes.data);
      setAutos(autosRes.data);
      setMarcas(marcasRes.data);
      setModelos(modelosRes.data);
      setCotizaciones(cotRes.data);
      setOportunidades(opRes.data);
      setStats(statsRes.data);
    } catch {
      console.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVentas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ventas.filter((v) => {
      if (estadoFilter !== 'all' && v.estado !== estadoFilter) return false;
      if (!term) return true;
      return [
        v.cliente?.nombre, v.cliente?.apellido, v.cliente?.email,
        v.auto_vendido?.marca?.nombre, v.auto_vendido?.modelo?.nombre,
        v.auto_tomado?.marca?.nombre, v.auto_tomado?.modelo?.nombre,
        v.notas,
      ].filter(Boolean).join(' ').toLowerCase().includes(term);
    });
  }, [ventas, searchTerm, estadoFilter]);

  const autosDisponibles = useMemo(() => {
    return autos.filter(a => a.en_stock);
  }, [autos]);

  const modelosFiltrados = useMemo(() => {
    if (!formData.tomado_marca_id) return modelos;
    return modelos.filter(m => m.marca_id === parseInt(formData.tomado_marca_id));
  }, [modelos, formData.tomado_marca_id]);

  // Cálculo en vivo de diferencia
  const diferenciaEnVivo = useMemo(() => {
    const pv = parseFloat(formData.precio_venta);
    const pt = parseFloat(formData.precio_toma || formData.tomado_precio);
    if (!isNaN(pv) && !isNaN(pt)) return pv - pt;
    return null;
  }, [formData.precio_venta, formData.precio_toma, formData.tomado_precio]);

  const openCreateModal = () => {
    setEditingVenta(null);
    setIncluyeAutoTomado(false);
    setFormData({
      cliente_id: '', auto_vendido_id: '', precio_venta: '', precio_toma: '',
      es_parte_pago: false, ganancia_estimada: '', cotizacion_id: '', oportunidad_id: '',
      estado: 'completada', notas: '', fecha_venta: '',
      tomado_marca_id: '', tomado_modelo_id: '', tomado_anio: '', tomado_tipo: '',
      tomado_precio: '', tomado_descripcion: '',
    });
    setShowModal(true);
  };

  const openEditModal = (venta: Venta) => {
    setEditingVenta(venta);
    setIncluyeAutoTomado(!!venta.auto_tomado_id);
    setFormData({
      cliente_id: venta.cliente_id.toString(),
      auto_vendido_id: venta.auto_vendido_id.toString(),
      precio_venta: venta.precio_venta.toString(),
      precio_toma: venta.precio_toma?.toString() || '',
      es_parte_pago: venta.es_parte_pago,
      ganancia_estimada: venta.ganancia_estimada?.toString() || '',
      cotizacion_id: venta.cotizacion_id?.toString() || '',
      oportunidad_id: venta.oportunidad_id?.toString() || '',
      estado: venta.estado,
      notas: venta.notas || '',
      fecha_venta: venta.fecha_venta ? venta.fecha_venta.slice(0, 16) : '',
      tomado_marca_id: '', tomado_modelo_id: '', tomado_anio: '', tomado_tipo: '',
      tomado_precio: '', tomado_descripcion: '',
    });
    setShowModal(true);
  };

  const openDetailModal = (venta: Venta) => {
    setSelectedVenta(venta);
    setShowDetailModal(true);
  };

  const handleAutoVendidoChange = (autoId: string) => {
    const auto = autos.find(a => a.id === parseInt(autoId));
    setFormData({
      ...formData,
      auto_vendido_id: autoId,
      precio_venta: auto ? auto.precio.toString() : formData.precio_venta,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVenta) {
        // Actualizar — solo campos editables (no crear auto tomado en edit)
        const payload: Record<string, unknown> = {
          cliente_id: parseInt(formData.cliente_id),
          auto_vendido_id: parseInt(formData.auto_vendido_id),
          precio_venta: parseFloat(formData.precio_venta),
          precio_toma: formData.precio_toma ? parseFloat(formData.precio_toma) : undefined,
          es_parte_pago: formData.es_parte_pago,
          ganancia_estimada: formData.ganancia_estimada ? parseFloat(formData.ganancia_estimada) : undefined,
          cotizacion_id: formData.cotizacion_id ? parseInt(formData.cotizacion_id) : undefined,
          oportunidad_id: formData.oportunidad_id ? parseInt(formData.oportunidad_id) : undefined,
          estado: formData.estado,
          notas: formData.notas || undefined,
          fecha_venta: formData.fecha_venta || undefined,
        };
        await ventasAPI.update(editingVenta.id, payload);
      } else {
        // Crear
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
          cliente_id: parseInt(formData.cliente_id),
          auto_vendido_id: parseInt(formData.auto_vendido_id),
          precio_venta: parseFloat(formData.precio_venta),
          es_parte_pago: formData.es_parte_pago,
          estado: formData.estado,
          notas: formData.notas || undefined,
          fecha_venta: formData.fecha_venta || undefined,
        };
        if (formData.cotizacion_id) payload.cotizacion_id = parseInt(formData.cotizacion_id);
        if (formData.oportunidad_id) payload.oportunidad_id = parseInt(formData.oportunidad_id);
        if (formData.ganancia_estimada) payload.ganancia_estimada = parseFloat(formData.ganancia_estimada);
        if (formData.precio_toma) payload.precio_toma = parseFloat(formData.precio_toma);

        if (incluyeAutoTomado && formData.tomado_marca_id && formData.tomado_modelo_id && formData.tomado_anio) {
          payload.auto_tomado_data = {
            marca_id: parseInt(formData.tomado_marca_id),
            modelo_id: parseInt(formData.tomado_modelo_id),
            anio: parseInt(formData.tomado_anio),
            tipo: formData.tomado_tipo || 'Sedán',
            precio: parseFloat(formData.tomado_precio) || 0,
            descripcion: formData.tomado_descripcion || undefined,
          };
          // Si no se puso precio_toma explícito, usar el precio del auto tomado
          if (!payload.precio_toma && formData.tomado_precio) {
            payload.precio_toma = parseFloat(formData.tomado_precio);
          }
        }

        await ventasAPI.create(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      alert(error.response?.data?.detail || 'Error al guardar la venta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta venta? El auto vendido volverá a estar disponible.')) return;
    try {
      await ventasAPI.delete(id);
      loadData();
    } catch {
      alert('Error al eliminar');
    }
  };

  const exportToXls = () => {
    let html =
      '<table><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Auto Vendido</th><th>Precio Venta</th><th>Auto Tomado</th><th>Precio Toma</th><th>Diferencia</th><th>Parte de Pago</th><th>Estado</th></tr>';
    filteredVentas.forEach((v) => {
      const autoVendido = v.auto_vendido ? `${v.auto_vendido.marca?.nombre || ''} ${v.auto_vendido.modelo?.nombre || ''} ${v.auto_vendido.anio || ''}` : '—';
      const autoTomado = v.auto_tomado ? `${v.auto_tomado.marca?.nombre || ''} ${v.auto_tomado.modelo?.nombre || ''} ${v.auto_tomado.anio || ''}` : '—';
      html += `<tr><td>${v.id}</td><td>${new Date(v.fecha_venta).toLocaleDateString()}</td><td>${v.cliente?.nombre || ''} ${v.cliente?.apellido || ''}</td><td>${autoVendido}</td><td>$${v.precio_venta.toLocaleString()}</td><td>${autoTomado}</td><td>${v.precio_toma ? '$' + v.precio_toma.toLocaleString() : '—'}</td><td>${v.diferencia != null ? '$' + v.diferencia.toLocaleString() : '—'}</td><td>${v.es_parte_pago ? 'Sí' : 'No'}</td><td>${v.estado}</td></tr>`;
    });
    html += '</table>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ventas.xls'; a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (n?: number | null) => n != null ? '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 }) : '—';

  return (
    <div className="p-2 md:p-6">
      <AdminHero
        title="Registro de Ventas"
        description="Gestiona operaciones de venta, tomas de autos y márgenes de ganancia"
      />

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-xs text-blue-600 mt-1">Total Ventas</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-700">{stats.por_estado.completada}</div>
            <div className="text-xs text-green-600 mt-1">Completadas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.por_estado.pendiente}</div>
            <div className="text-xs text-yellow-600 mt-1">Pendientes</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-center">
            <div className="text-lg font-bold text-emerald-700">{fmt(stats.total_vendido)}</div>
            <div className="text-xs text-emerald-600 mt-1">Total Vendido</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl text-center">
            <div className="text-lg font-bold text-orange-700">{fmt(stats.total_tomado)}</div>
            <div className="text-xs text-orange-600 mt-1">Total Tomas</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl text-center">
            <div className="text-lg font-bold text-purple-700">{fmt(stats.total_diferencia)}</div>
            <div className="text-xs text-purple-600 mt-1">Diferencia Total</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-indigo-700">{stats.ventas_con_toma}</div>
            <div className="text-xs text-indigo-600 mt-1">Con Toma</div>
          </div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar ventas por cliente, auto..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-gray-900"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select title="Filtrar por estado" className="border rounded-lg px-3 py-2 text-sm text-gray-700"
          value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          {ESTADOS_VENTA.map((e) => <option key={e} value={e}>{iconEstado[e]} {e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
        <button onClick={exportToXls} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
          <ArrowDownTrayIcon className="w-4 h-4" /> Exportar
        </button>
        <button onClick={openCreateModal} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <PlusIcon className="w-4 h-4" /> Nueva Venta
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Fecha', 'Cliente', 'Auto Vendido', 'Precio Venta', 'Auto Tomado', 'Precio Toma', 'Diferencia', 'Parte Pago', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVentas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500 font-mono">#{v.id}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(v.fecha_venta).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{v.cliente?.nombre} {v.cliente?.apellido}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.auto_vendido ? `${v.auto_vendido.marca?.nombre || ''} ${v.auto_vendido.modelo?.nombre || ''} ${v.auto_vendido.anio || ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-600">{fmt(v.precio_venta)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.auto_tomado ? `${v.auto_tomado.marca?.nombre || ''} ${v.auto_tomado.modelo?.nombre || ''} ${v.auto_tomado.anio || ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-orange-600">{fmt(v.precio_toma)}</td>
                  <td className="px-4 py-3 font-bold text-purple-600">{fmt(v.diferencia)}</td>
                  <td className="px-4 py-3">
                    {v.es_parte_pago ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Sí</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado[v.estado]}`}>
                      {iconEstado[v.estado]} {v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button title="Ver detalle" onClick={() => openDetailModal(v)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><EyeIcon className="w-4 h-4" /></button>
                      <button title="Editar" onClick={() => openEditModal(v)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><PencilIcon className="w-4 h-4" /></button>
                      <button title="Eliminar" onClick={() => handleDelete(v.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVentas.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400">No se encontraron ventas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedVenta && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Detalle de Venta #{selectedVenta.id}</h2>
              <button title="Cerrar" onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Estado y fecha */}
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${colorEstado[selectedVenta.estado]}`}>
                  {iconEstado[selectedVenta.estado]} {selectedVenta.estado.charAt(0).toUpperCase() + selectedVenta.estado.slice(1)}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(selectedVenta.fecha_venta).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Cliente */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">Cliente</h3>
                <p className="text-gray-900">{selectedVenta.cliente?.nombre} {selectedVenta.cliente?.apellido}</p>
                <p className="text-gray-500 text-sm">{selectedVenta.cliente?.email}</p>
                {selectedVenta.cliente?.telefono && <p className="text-gray-500 text-sm">{selectedVenta.cliente.telefono}</p>}
              </div>

              {/* Autos y precios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auto vendido */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Auto Vendido</h3>
                  {selectedVenta.auto_vendido && (
                    <>
                      <p className="text-gray-900 font-medium">
                        {selectedVenta.auto_vendido.marca?.nombre} {selectedVenta.auto_vendido.modelo?.nombre}
                      </p>
                      <p className="text-gray-600 text-sm">Año: {selectedVenta.auto_vendido.anio} — {selectedVenta.auto_vendido.tipo}</p>
                    </>
                  )}
                  <p className="text-2xl font-bold text-green-700 mt-2">{fmt(selectedVenta.precio_venta)}</p>
                </div>

                {/* Auto tomado */}
                <div className={`p-4 rounded-xl border ${selectedVenta.auto_tomado ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-2 ${selectedVenta.auto_tomado ? 'text-orange-800' : 'text-gray-500'}`}>Auto Tomado</h3>
                  {selectedVenta.auto_tomado ? (
                    <>
                      <p className="text-gray-900 font-medium">
                        {selectedVenta.auto_tomado.marca?.nombre} {selectedVenta.auto_tomado.modelo?.nombre}
                      </p>
                      <p className="text-gray-600 text-sm">Año: {selectedVenta.auto_tomado.anio} — {selectedVenta.auto_tomado.tipo}</p>
                      <p className="text-2xl font-bold text-orange-700 mt-2">{fmt(selectedVenta.precio_toma)}</p>
                      {selectedVenta.es_parte_pago && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Parte de pago</span>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">Sin auto tomado</p>
                  )}
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3">Resumen Financiero</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-purple-600">Precio Venta</p>
                    <p className="text-lg font-bold text-green-700">{fmt(selectedVenta.precio_venta)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Precio Toma</p>
                    <p className="text-lg font-bold text-orange-700">{fmt(selectedVenta.precio_toma)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Diferencia</p>
                    <p className={`text-lg font-bold ${(selectedVenta.diferencia || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {fmt(selectedVenta.diferencia)}
                    </p>
                  </div>
                </div>
                {selectedVenta.ganancia_estimada != null && (
                  <div className="mt-3 pt-3 border-t border-purple-200 text-center">
                    <p className="text-xs text-purple-600">Ganancia Estimada</p>
                    <p className="text-xl font-bold text-emerald-700">{fmt(selectedVenta.ganancia_estimada)}</p>
                  </div>
                )}
              </div>

              {/* Vínculos */}
              {(selectedVenta.cotizacion || selectedVenta.oportunidad) && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-blue-800 mb-2">Vínculos</h3>
                  {selectedVenta.cotizacion && (
                    <p className="text-sm text-gray-700">Cotización #{selectedVenta.cotizacion.id} — {selectedVenta.cotizacion.nombre_usuario} ({selectedVenta.cotizacion.estado})</p>
                  )}
                  {selectedVenta.oportunidad && (
                    <p className="text-sm text-gray-700">Oportunidad #{selectedVenta.oportunidad.id} — {selectedVenta.oportunidad.titulo} ({selectedVenta.oportunidad.etapa})</p>
                  )}
                </div>
              )}

              {/* Notas */}
              {selectedVenta.notas && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Notas</h3>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedVenta.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingVenta ? 'Editar Venta' : 'Registrar Nueva Venta'}</h2>
              <button title="Cerrar" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select required title="Seleccionar cliente" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={formData.cliente_id} onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}>
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido} — {c.email}</option>)}
                </select>
              </div>

              {/* Auto vendido y precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auto que se Vende *</label>
                  <select required title="Seleccionar auto" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.auto_vendido_id} onChange={(e) => handleAutoVendidoChange(e.target.value)}>
                    <option value="">Seleccionar auto...</option>
                    {autosDisponibles.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.marca?.nombre} {a.modelo?.nombre} {a.anio} — {fmt(a.precio)}
                      </option>
                    ))}
                    {/* Si se está editando y el auto ya no está disponible, mostrarlo igual */}
                    {editingVenta && !autosDisponibles.find(a => a.id === editingVenta.auto_vendido_id) && editingVenta.auto_vendido && (
                      <option value={editingVenta.auto_vendido_id}>
                        {editingVenta.auto_vendido.marca?.nombre} {editingVenta.auto_vendido.modelo?.nombre} {editingVenta.auto_vendido.anio} — {fmt(editingVenta.auto_vendido.precio)} (vendido)
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta *</label>
                  <input required type="number" step="0.01" placeholder="Precio final de venta"
                    className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.precio_venta} onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })} />
                </div>
              </div>

              {/* Toggle auto tomado */}
              {!editingVenta && (
                <div className="border rounded-xl p-4 bg-gray-50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded text-blue-600"
                      checked={incluyeAutoTomado} onChange={(e) => setIncluyeAutoTomado(e.target.checked)} />
                    <div>
                      <span className="font-medium text-gray-900">El cliente entrega un auto</span>
                      <p className="text-xs text-gray-500">Se creará una ficha del auto tomado con estado &quot;No Disponible&quot;</p>
                    </div>
                  </label>

                  {incluyeAutoTomado && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Marca *</label>
                          <select required={incluyeAutoTomado} title="Marca del auto tomado" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            value={formData.tomado_marca_id} onChange={(e) => setFormData({ ...formData, tomado_marca_id: e.target.value, tomado_modelo_id: '' })}>
                            <option value="">Seleccionar...</option>
                            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Modelo *</label>
                          <select required={incluyeAutoTomado} title="Modelo del auto tomado" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            value={formData.tomado_modelo_id} onChange={(e) => setFormData({ ...formData, tomado_modelo_id: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {modelosFiltrados.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Año *</label>
                          <input required={incluyeAutoTomado} type="number" min="1950" max="2030" placeholder="Ej: 2020"
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            value={formData.tomado_anio} onChange={(e) => setFormData({ ...formData, tomado_anio: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                          <select title="Tipo de vehículo" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            value={formData.tomado_tipo} onChange={(e) => setFormData({ ...formData, tomado_tipo: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {TIPOS_VEHICULO.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Precio de Toma *</label>
                          <input required={incluyeAutoTomado} type="number" step="0.01" placeholder="Valor al que se toma"
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            value={formData.tomado_precio}
                            onChange={(e) => setFormData({ ...formData, tomado_precio: e.target.value, precio_toma: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                          <input type="text" placeholder="Estado, km, extras..."
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            value={formData.tomado_descripcion} onChange={(e) => setFormData({ ...formData, tomado_descripcion: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Precio toma manual (si edita o no tiene auto tomado data) */}
              {editingVenta && editingVenta.auto_tomado_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Toma</label>
                  <input type="number" step="0.01" placeholder="Valor al que se tomó"
                    className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.precio_toma} onChange={(e) => setFormData({ ...formData, precio_toma: e.target.value })} />
                </div>
              )}

              {/* Es parte de pago + ganancia estimada */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 border rounded-lg px-4 py-3">
                  <input type="checkbox" id="es_parte_pago" className="w-5 h-5 rounded text-blue-600"
                    checked={formData.es_parte_pago} onChange={(e) => setFormData({ ...formData, es_parte_pago: e.target.checked })} />
                  <label htmlFor="es_parte_pago" className="text-sm font-medium text-gray-700 cursor-pointer">Es parte de pago</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ganancia Estimada ($)</label>
                  <input type="number" step="0.01" placeholder="Ganancia estimada"
                    className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.ganancia_estimada} onChange={(e) => setFormData({ ...formData, ganancia_estimada: e.target.value })} />
                </div>
              </div>

              {/* Diferencia en vivo */}
              {diferenciaEnVivo !== null && (
                <div className={`p-3 rounded-lg text-center font-bold text-lg ${diferenciaEnVivo >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  Diferencia: {fmt(diferenciaEnVivo)}
                </div>
              )}

              {/* Vínculos opcionales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cotización (opcional)</label>
                  <select title="Vincular cotización" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.cotizacion_id} onChange={(e) => setFormData({ ...formData, cotizacion_id: e.target.value })}>
                    <option value="">Sin vincular</option>
                    {cotizaciones.map(c => <option key={c.id} value={c.id}>#{c.id} — {c.nombre_usuario} ({c.estado})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oportunidad (opcional)</label>
                  <select title="Vincular oportunidad" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.oportunidad_id} onChange={(e) => setFormData({ ...formData, oportunidad_id: e.target.value })}>
                    <option value="">Sin vincular</option>
                    {oportunidades.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.titulo} ({o.etapa})</option>)}
                  </select>
                </div>
              </div>

              {/* Estado y fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select title="Estado de la venta" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                    {ESTADOS_VENTA.map(e => <option key={e} value={e}>{iconEstado[e]} {e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Venta</label>
                  <input type="datetime-local" title="Fecha de venta" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.fecha_venta} onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })} />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea rows={3} placeholder="Notas sobre la operación, condiciones, financiación, etc."
                  className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  {editingVenta ? 'Guardar Cambios' : 'Registrar Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

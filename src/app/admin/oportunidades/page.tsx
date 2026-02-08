'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Oportunidad, Cliente, Auto } from '@/types';
import { oportunidadesAPI, clientesAPI, autosAPI } from '@/lib/api';
import AdminHero from '@/components/AdminHero';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';

const ETAPAS = ['prospecto', 'contacto', 'evaluacion', 'negociacion', 'cierre', 'ganada', 'perdida'];
const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];

const colorEtapa: Record<string, string> = {
  prospecto: 'bg-gray-100 text-gray-800',
  contacto: 'bg-blue-100 text-blue-800',
  evaluacion: 'bg-indigo-100 text-indigo-800',
  negociacion: 'bg-yellow-100 text-yellow-800',
  cierre: 'bg-orange-100 text-orange-800',
  ganada: 'bg-green-100 text-green-800',
  perdida: 'bg-red-100 text-red-800',
};

const colorPrioridad: Record<string, string> = {
  baja: 'bg-gray-100 text-gray-700',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const iconEtapa: Record<string, string> = {
  prospecto: '🎯',
  contacto: '📞',
  evaluacion: '🔍',
  negociacion: '🤝',
  cierre: '📝',
  ganada: '✅',
  perdida: '❌',
};

export default function AdminOportunidades() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [etapaFilter, setEtapaFilter] = useState('all');
  const [prioridadFilter, setPrioridadFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'tabla' | 'kanban'>('kanban');
  const [showModal, setShowModal] = useState(false);
  const [editingOportunidad, setEditingOportunidad] = useState<Oportunidad | null>(null);
  const [formData, setFormData] = useState({
    cliente_id: '', auto_id: '', titulo: '', descripcion: '',
    etapa: 'prospecto', probabilidad: '10', valor_estimado: '',
    prioridad: 'media', notas: '', proxima_accion: '', fecha_proxima_accion: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/admin');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [opRes, clRes, auRes] = await Promise.all([
        oportunidadesAPI.getAll(),
        clientesAPI.getAll(),
        autosAPI.getAll(),
      ]);
      setOportunidades(opRes.data);
      setClientes(clRes.data);
      setAutos(auRes.data);
    } catch {
      console.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredOportunidades = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return oportunidades.filter((o) => {
      if (etapaFilter !== 'all' && o.etapa !== etapaFilter) return false;
      if (prioridadFilter !== 'all' && o.prioridad !== prioridadFilter) return false;
      if (!term) return true;
      return [o.titulo, o.descripcion, o.cliente?.nombre, o.cliente?.apellido, o.cliente?.email, o.auto?.marca?.nombre, o.auto?.modelo?.nombre]
        .filter(Boolean).join(' ').toLowerCase().includes(term);
    });
  }, [oportunidades, searchTerm, etapaFilter, prioridadFilter]);

  const oportunidadesPorEtapa = useMemo(() => {
    const map: Record<string, Oportunidad[]> = {};
    ETAPAS.forEach(e => { map[e] = []; });
    filteredOportunidades.forEach(o => {
      if (map[o.etapa]) map[o.etapa].push(o);
    });
    return map;
  }, [filteredOportunidades]);

  const openCreateModal = () => {
    setEditingOportunidad(null);
    setFormData({
      cliente_id: '', auto_id: '', titulo: '', descripcion: '',
      etapa: 'prospecto', probabilidad: '10', valor_estimado: '',
      prioridad: 'media', notas: '', proxima_accion: '', fecha_proxima_accion: '',
    });
    setShowModal(true);
  };

  const openEditModal = (op: Oportunidad) => {
    setEditingOportunidad(op);
    setFormData({
      cliente_id: op.cliente_id.toString(),
      auto_id: op.auto_id?.toString() || '',
      titulo: op.titulo,
      descripcion: op.descripcion || '',
      etapa: op.etapa,
      probabilidad: op.probabilidad.toString(),
      valor_estimado: op.valor_estimado?.toString() || '',
      prioridad: op.prioridad,
      notas: op.notas || '',
      proxima_accion: op.proxima_accion || '',
      fecha_proxima_accion: op.fecha_proxima_accion ? op.fecha_proxima_accion.slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      cliente_id: parseInt(formData.cliente_id),
      auto_id: formData.auto_id ? parseInt(formData.auto_id) : undefined,
      probabilidad: parseInt(formData.probabilidad),
      valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : undefined,
      fecha_proxima_accion: formData.fecha_proxima_accion || undefined,
    };
    try {
      if (editingOportunidad) {
        await oportunidadesAPI.update(editingOportunidad.id, payload);
      } else {
        await oportunidadesAPI.create(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta oportunidad?')) return;
    try {
      await oportunidadesAPI.delete(id);
      loadData();
    } catch {
      alert('Error al eliminar');
    }
  };

  const handleMoveEtapa = async (op: Oportunidad, nuevaEtapa: string) => {
    try {
      await oportunidadesAPI.update(op.id, { etapa: nuevaEtapa });
      loadData();
    } catch {
      alert('Error al mover');
    }
  };

  const totalPipeline = useMemo(() =>
    oportunidades.filter(o => !['ganada', 'perdida'].includes(o.etapa))
      .reduce((sum, o) => sum + (o.valor_estimado || 0), 0)
    , [oportunidades]);

  const exportToXls = () => {
    let html = '<table><tr><th>ID</th><th>Título</th><th>Cliente</th><th>Vehículo</th><th>Etapa</th><th>Probabilidad</th><th>Valor</th><th>Prioridad</th><th>Fecha</th></tr>';
    filteredOportunidades.forEach((o) => {
      html += `<tr><td>${o.id}</td><td>${o.titulo}</td><td>${o.cliente?.nombre || ''} ${o.cliente?.apellido || ''}</td><td>${o.auto?.marca?.nombre || ''} ${o.auto?.modelo?.nombre || ''}</td><td>${o.etapa}</td><td>${o.probabilidad}%</td><td>${o.valor_estimado || ''}</td><td>${o.prioridad}</td><td>${new Date(o.fecha_creacion).toLocaleDateString()}</td></tr>`;
    });
    html += '</table>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'oportunidades.xls'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-2 md:p-6">
      <AdminHero
        title="Oportunidades de Venta"
        description="Pipeline y seguimiento de oportunidades comerciales"
      />

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-700">{oportunidades.length}</div>
          <div className="text-xs text-blue-600 mt-1">Total Oportunidades</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-700">${totalPipeline.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">Valor Pipeline</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-emerald-700">{oportunidades.filter(o => o.etapa === 'ganada').length}</div>
          <div className="text-xs text-emerald-600 mt-1">Ganadas</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-700">{oportunidades.filter(o => o.etapa === 'perdida').length}</div>
          <div className="text-xs text-red-600 mt-1">Perdidas</div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar oportunidades..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-gray-900"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select title="Filtrar por etapa" className="border rounded-lg px-3 py-2 text-sm text-gray-700"
          value={etapaFilter} onChange={(e) => setEtapaFilter(e.target.value)}>
          <option value="all">Todas las etapas</option>
          {ETAPAS.map((e) => <option key={e} value={e}>{iconEtapa[e]} {e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
        <select title="Filtrar por prioridad" className="border rounded-lg px-3 py-2 text-sm text-gray-700"
          value={prioridadFilter} onChange={(e) => setPrioridadFilter(e.target.value)}>
          <option value="all">Todas las prioridades</option>
          {PRIORIDADES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            Kanban
          </button>
          <button onClick={() => setViewMode('tabla')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${viewMode === 'tabla' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            Tabla
          </button>
        </div>
        <button onClick={exportToXls} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
          <ArrowDownTrayIcon className="w-4 h-4" /> Exportar
        </button>
        <button onClick={openCreateModal} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <PlusIcon className="w-4 h-4" /> Nueva Oportunidad
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : viewMode === 'kanban' ? (
        /* Vista Kanban */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPAS.map((etapa) => (
            <div key={etapa} className="flex-shrink-0 w-72">
              <div className={`rounded-t-xl px-4 py-2 flex justify-between items-center ${colorEtapa[etapa]}`}>
                <span className="font-semibold text-sm">{iconEtapa[etapa]} {etapa.charAt(0).toUpperCase() + etapa.slice(1)}</span>
                <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">{oportunidadesPorEtapa[etapa]?.length || 0}</span>
              </div>
              <div className="bg-gray-50 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                {(oportunidadesPorEtapa[etapa] || []).map((op) => (
                  <div key={op.id} className="bg-white p-3 rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer" onClick={() => openEditModal(op)}>
                    <div className="font-medium text-sm text-gray-900 mb-1">{op.titulo}</div>
                    <div className="text-xs text-gray-500 mb-2">{op.cliente?.nombre} {op.cliente?.apellido}</div>
                    {op.auto && <div className="text-xs text-blue-600 mb-2">{op.auto.marca?.nombre} {op.auto.modelo?.nombre}</div>}
                    <div className="flex justify-between items-center">
                      {op.valor_estimado && <span className="text-xs font-bold text-green-600">${op.valor_estimado.toLocaleString()}</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${colorPrioridad[op.prioridad]}`}>{op.prioridad}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${op.probabilidad}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{op.probabilidad}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista Tabla */
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Título', 'Cliente', 'Vehículo', 'Etapa', 'Prob.', 'Valor', 'Prioridad', 'Próx. Acción', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOportunidades.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500 font-mono">#{o.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.titulo}</td>
                  <td className="px-4 py-3 text-gray-600">{o.cliente?.nombre} {o.cliente?.apellido}</td>
                  <td className="px-4 py-3 text-gray-600">{o.auto ? `${o.auto.marca?.nombre || ''} ${o.auto.modelo?.nombre || ''}` : '—'}</td>
                  <td className="px-4 py-3">
                    <select title="Cambiar etapa" className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${colorEtapa[o.etapa]}`}
                      value={o.etapa} onChange={(e) => handleMoveEtapa(o, e.target.value)}>
                      {ETAPAS.map(et => <option key={et} value={et}>{iconEtapa[et]} {et.charAt(0).toUpperCase() + et.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.probabilidad}%</td>
                  <td className="px-4 py-3 font-medium text-green-600">{o.valor_estimado ? `$${o.valor_estimado.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorPrioridad[o.prioridad]}`}>{o.prioridad}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{o.proxima_accion || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button title="Editar" onClick={() => openEditModal(o)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><PencilIcon className="w-4 h-4" /></button>
                      <button title="Eliminar" onClick={() => handleDelete(o.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOportunidades.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">No se encontraron oportunidades</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingOportunidad ? 'Editar Oportunidad' : 'Nueva Oportunidad'}</h2>
              <button title="Cerrar" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input required type="text" placeholder="Ej: Interés en Toyota Corolla" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select required title="Seleccionar cliente" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.cliente_id} onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido} — {c.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo (opcional)</label>
                  <select title="Seleccionar vehículo" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.auto_id} onChange={(e) => setFormData({ ...formData, auto_id: e.target.value })}>
                    <option value="">Sin vehículo específico</option>
                    {autos.map(a => <option key={a.id} value={a.id}>{a.marca?.nombre} {a.modelo?.nombre} {a.anio} — ${a.precio?.toLocaleString()}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea placeholder="Detalles de la oportunidad..." rows={2} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
                  <select title="Etapa" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.etapa} onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}>
                    {ETAPAS.map(et => <option key={et} value={et}>{iconEtapa[et]} {et.charAt(0).toUpperCase() + et.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probabilidad (%)</label>
                  <input type="number" min="0" max="100" placeholder="0-100" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.probabilidad} onChange={(e) => setFormData({ ...formData, probabilidad: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Estimado ($)</label>
                  <input type="number" placeholder="Monto" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.valor_estimado} onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select title="Prioridad" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.prioridad} onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}>
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Acción</label>
                  <input type="text" placeholder="Ej: Llamar para seguimiento" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={formData.proxima_accion} onChange={(e) => setFormData({ ...formData, proxima_accion: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Próxima Acción</label>
                <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={formData.fecha_proxima_accion} onChange={(e) => setFormData({ ...formData, fecha_proxima_accion: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea rows={2} placeholder="Notas adicionales..." className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  {editingOportunidad ? 'Guardar Cambios' : 'Crear Oportunidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

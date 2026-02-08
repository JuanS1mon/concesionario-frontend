'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Cliente } from '@/types';
import { clientesAPI } from '@/lib/api';
import AdminHero from '@/components/AdminHero';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  FireIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';

const ESTADOS_CLIENTE = ['nuevo', 'contactado', 'calificado', 'cliente', 'perdido'];
const CALIFICACIONES = ['frio', 'tibio', 'caliente'];
const FUENTES = ['web', 'cotizacion', 'referido', 'publicidad', 'telefono', 'presencial', 'otro'];

const colorCalificacion: Record<string, string> = {
  frio: 'bg-blue-100 text-blue-800',
  tibio: 'bg-yellow-100 text-yellow-800',
  caliente: 'bg-red-100 text-red-800',
};

const colorEstado: Record<string, string> = {
  nuevo: 'bg-gray-100 text-gray-800',
  contactado: 'bg-blue-100 text-blue-800',
  calificado: 'bg-purple-100 text-purple-800',
  cliente: 'bg-green-100 text-green-800',
  perdido: 'bg-red-100 text-red-700',
};

const iconCalificacion: Record<string, string> = {
  frio: '❄️',
  tibio: '🌤️',
  caliente: '🔥',
};

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [calificacionFilter, setCalificacionFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', telefono: '', ciudad: '',
    direccion: '', fuente: '', preferencias_contacto: '',
    presupuesto_min: '', presupuesto_max: '', tipo_vehiculo_interes: '', notas: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/admin');
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const { data } = await clientesAPI.getAll();
      setClientes(data);
    } catch {
      console.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return clientes.filter((c) => {
      if (estadoFilter !== 'all' && c.estado !== estadoFilter) return false;
      if (calificacionFilter !== 'all' && c.calificacion !== calificacionFilter) return false;
      if (!term) return true;
      return [c.nombre, c.apellido, c.email, c.telefono, c.ciudad, c.fuente]
        .filter(Boolean).join(' ').toLowerCase().includes(term);
    });
  }, [clientes, searchTerm, estadoFilter, calificacionFilter]);

  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData({
      nombre: '', apellido: '', email: '', telefono: '', ciudad: '',
      direccion: '', fuente: '', preferencias_contacto: '',
      presupuesto_min: '', presupuesto_max: '', tipo_vehiculo_interes: '', notas: '',
    });
    setShowModal(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre, apellido: cliente.apellido, email: cliente.email,
      telefono: cliente.telefono || '', ciudad: cliente.ciudad || '',
      direccion: cliente.direccion || '', fuente: cliente.fuente || '',
      preferencias_contacto: cliente.preferencias_contacto || '',
      presupuesto_min: cliente.presupuesto_min?.toString() || '',
      presupuesto_max: cliente.presupuesto_max?.toString() || '',
      tipo_vehiculo_interes: cliente.tipo_vehiculo_interes || '',
      notas: cliente.notas || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      presupuesto_min: formData.presupuesto_min ? parseInt(formData.presupuesto_min) : undefined,
      presupuesto_max: formData.presupuesto_max ? parseInt(formData.presupuesto_max) : undefined,
    };
    try {
      if (editingCliente) {
        await clientesAPI.update(editingCliente.id, payload);
      } else {
        await clientesAPI.create(payload);
      }
      setShowModal(false);
      loadClientes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al guardar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      await clientesAPI.delete(id);
      loadClientes();
    } catch {
      alert('Error al eliminar');
    }
  };

  const handleUpdateEstado = async (cliente: Cliente, nuevoEstado: string) => {
    try {
      await clientesAPI.update(cliente.id, { estado: nuevoEstado });
      loadClientes();
    } catch {
      alert('Error al actualizar estado');
    }
  };

  const exportToXls = () => {
    let html = '<table><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Ciudad</th><th>Fuente</th><th>Score</th><th>Calificación</th><th>Estado</th><th>Fecha</th></tr>';
    filteredClientes.forEach((c) => {
      html += `<tr><td>${c.id}</td><td>${c.nombre} ${c.apellido}</td><td>${c.email}</td><td>${c.telefono || ''}</td><td>${c.ciudad || ''}</td><td>${c.fuente || ''}</td><td>${c.score}</td><td>${c.calificacion}</td><td>${c.estado}</td><td>${new Date(c.fecha_creacion).toLocaleDateString()}</td></tr>`;
    });
    html += '</table>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clientes.xls'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-2 md:p-6">
      <AdminHero
        title="Gestión de Clientes"
        description="Captura, seguimiento y calificación de clientes potenciales"
      />

      {/* Barra de acciones */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Buscar por nombre, email, teléfono..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-gray-900"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="border rounded-lg px-3 py-2 text-sm text-gray-700"
          value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          {ESTADOS_CLIENTE.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-2 text-sm text-gray-700"
          value={calificacionFilter} onChange={(e) => setCalificacionFilter(e.target.value)}>
          <option value="all">Todas las calificaciones</option>
          {CALIFICACIONES.map((c) => <option key={c} value={c}>{iconCalificacion[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <button onClick={exportToXls} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
          <ArrowDownTrayIcon className="w-4 h-4" /> Exportar
        </button>
        <button onClick={openCreateModal} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <PlusIcon className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: clientes.length, color: 'bg-gray-50' },
          { label: '🔥 Calientes', value: clientes.filter(c => c.calificacion === 'caliente').length, color: 'bg-red-50' },
          { label: '🌤️ Tibios', value: clientes.filter(c => c.calificacion === 'tibio').length, color: 'bg-yellow-50' },
          { label: '❄️ Fríos', value: clientes.filter(c => c.calificacion === 'frio').length, color: 'bg-blue-50' },
          { label: '✅ Clientes', value: clientes.filter(c => c.estado === 'cliente').length, color: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} p-4 rounded-xl text-center`}>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Cliente', 'Email', 'Teléfono', 'Ciudad', 'Score', 'Calificación', 'Estado', 'Oport.', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500 font-mono">#{c.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.nombre} {c.apellido}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.telefono || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.ciudad || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${c.score}%` }} />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{c.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorCalificacion[c.calificacion] || ''}`}>
                      {iconCalificacion[c.calificacion]} {c.calificacion}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${colorEstado[c.estado] || ''}`}
                      value={c.estado} onChange={(e) => handleUpdateEstado(c, e.target.value)}>
                      {ESTADOS_CLIENTE.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center">{c.total_oportunidades || 0}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.fecha_creacion).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400">No se encontraron clientes</td></tr>
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
              <h2 className="text-xl font-bold text-gray-900">{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.fuente} onChange={(e) => setFormData({ ...formData, fuente: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {FUENTES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Mín.</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.presupuesto_min} onChange={(e) => setFormData({ ...formData, presupuesto_min: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Máx.</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.presupuesto_max} onChange={(e) => setFormData({ ...formData, presupuesto_max: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Vehículo</label>
                  <input type="text" placeholder="SUV, Sedán..." className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.tipo_vehiculo_interes} onChange={(e) => setFormData({ ...formData, tipo_vehiculo_interes: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferencia de contacto</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.preferencias_contacto} onChange={(e) => setFormData({ ...formData, preferencias_contacto: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  <option value="email">Email</option>
                  <option value="telefono">Teléfono</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{editingCliente ? 'Guardar Cambios' : 'Crear Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

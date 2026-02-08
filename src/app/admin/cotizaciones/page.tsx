'use client';

import { useMemo, useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ChatBubbleLeftRightIcon, EyeIcon, EyeSlashIcon, PhoneIcon, HeartIcon, CurrencyDollarIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { Cotizacion } from '@/types';
import { API_BASE_URL } from '@/lib/constants';
import { clientesAPI } from '@/lib/api';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import AdminHero from '@/components/AdminHero';
import AutoDetalle from '@/components/AutoDetalle';
import Image from 'next/image';

export default function AdminCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroVisible, setHeroVisible] = useState(true);
  const [selectedAuto, setSelectedAuto] = useState<any | null>(null);
  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);
  const [notas, setNotas] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [convirtiendo, setConvirtiendo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadCotizaciones();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  };

  const loadCotizaciones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizaciones/`);
      if (response.ok) {
        const data = await response.json();
        setCotizaciones(data);
      } else {
        setError('Error al cargar las cotizaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin');
  };

  const handleAutoClick = (auto: any) => {
    setSelectedAuto(auto);
  };

  const handleCotizacionClick = (cotizacion: Cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setNotas(cotizacion.notas_admin || '');
  };

  const closeCotizacionModal = () => {
    setSelectedCotizacion(null);
    setNotas('');
  };

  const saveNotas = async () => {
    if (!selectedCotizacion) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cotizaciones/${selectedCotizacion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notas_admin: notas }),
      });
      if (response.ok) {
        setCotizaciones(cotizaciones.map(c => c.id === selectedCotizacion.id ? { ...c, notas_admin: notas } : c));
        alert('Notas guardadas');
      } else {
        alert('Error al guardar notas');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const parseEstadoOportunidad = (valor?: string | null) => {
    if (!valor) return [] as string[];
    if (valor.trim().toLowerCase() === 'nuevo') return [] as string[];
    return valor
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const formatEstadoOportunidad = (estados: string[]) => {
    if (estados.length === 0) return 'Nuevo';
    return estados.join(', ');
  };

  const toggleEstadoOportunidad = async (estado: string) => {
    if (!selectedCotizacion) return;
    try {
      const actuales = parseEstadoOportunidad(selectedCotizacion.estado_oportunidad);
      const existe = actuales.includes(estado);
      const actualizados = existe
        ? actuales.filter((item) => item !== estado)
        : [...actuales, estado];
      const nuevoEstado = formatEstadoOportunidad(actualizados);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cotizaciones/${selectedCotizacion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado_oportunidad: nuevoEstado }),
      });
      if (response.ok) {
        setCotizaciones((prev) =>
          prev.map((c) =>
            c.id === selectedCotizacion.id ? { ...c, estado_oportunidad: nuevoEstado } : c
          )
        );
        setSelectedCotizacion({ ...selectedCotizacion, estado_oportunidad: nuevoEstado });
      } else {
        alert('Error al actualizar el estado de oportunidad');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const convertirACliente = async () => {
    if (!selectedCotizacion) return;
    setConvirtiendo(true);
    try {
      const nombreCompleto = selectedCotizacion.nombre_usuario.trim();
      const partes = nombreCompleto.split(' ');
      const nombre = partes[0] || nombreCompleto;
      const apellido = partes.slice(1).join(' ') || '-';

      const autoInfo = selectedCotizacion.auto
        ? `${selectedCotizacion.auto.marca?.nombre || ''} ${selectedCotizacion.auto.modelo?.nombre || ''}`.trim()
        : undefined;

      const clienteData: Partial<import('@/types').Cliente> = {
        nombre,
        apellido,
        email: selectedCotizacion.email,
        telefono: selectedCotizacion.telefono || undefined,
        ciudad: selectedCotizacion.ciudad || undefined,
        fuente: 'cotizacion',
        tipo_vehiculo_interes: autoInfo || undefined,
        notas: `Convertido desde cotización #${selectedCotizacion.id}. Mensaje original: ${selectedCotizacion.mensaje}`,
        ip_registro: selectedCotizacion.ip || undefined,
        ubicacion_geo: selectedCotizacion.ubicacion || undefined,
      };

      await clientesAPI.create(clienteData);
      alert(`Cliente "${nombre} ${apellido}" creado exitosamente. Puedes verlo en el CRM.`);
    } catch (err: any) {
      if (err?.response?.status === 400 || err?.response?.status === 422) {
        alert('Error: Verifica que los datos del cliente sean válidos. Es posible que ya exista un cliente con ese email.');
      } else {
        alert('Error al crear el cliente');
      }
    } finally {
      setConvirtiendo(false);
    }
  };

  const closeModal = () => {
    setSelectedAuto(null);
  };

  const estadosDisponibles = useMemo(() => {
    const estados = new Set<string>();
    cotizaciones.forEach((cotizacion) => {
      if (cotizacion.estado) {
        estados.add(cotizacion.estado);
      }
    });
    return Array.from(estados).sort((a, b) => a.localeCompare(b));
  }, [cotizaciones]);

  const filteredCotizaciones = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return cotizaciones.filter((cotizacion) => {
      if (estadoFilter !== 'all' && (cotizacion.estado || '').toLowerCase() !== estadoFilter.toLowerCase()) {
        return false;
      }

      if (!term) return true;

      const autoMarca = cotizacion.auto?.marca?.nombre || '';
      const autoModelo = cotizacion.auto?.modelo?.nombre || '';
      const autoAnio = cotizacion.auto?.anio?.toString() || '';
      const values = [
        cotizacion.id?.toString(),
        cotizacion.nombre_usuario,
        cotizacion.email,
        cotizacion.telefono,
        cotizacion.mensaje,
        cotizacion.ciudad,
        cotizacion.ip,
        cotizacion.ubicacion,
        cotizacion.estado,
        cotizacion.estado_oportunidad,
        autoMarca,
        autoModelo,
        autoAnio,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return values.includes(term);
    });
  }, [cotizaciones, searchTerm, estadoFilter]);

  const exportCotizacionesToXls = () => {
    if (filteredCotizaciones.length === 0) {
      alert('No hay cotizaciones para exportar con los filtros actuales.');
      return;
    }

    const headers = [
      'ID',
      'Cliente',
      'Email',
      'Telefono',
      'Estado',
      'Estado oportunidad',
      'Auto',
      'Ano',
      'Fecha',
      'IP',
      'Ubicacion',
      'Mensaje',
    ];

    const rows = filteredCotizaciones.map((cotizacion) => [
      cotizacion.id,
      cotizacion.nombre_usuario,
      cotizacion.email,
      cotizacion.telefono || '',
      cotizacion.estado || '',
      cotizacion.estado_oportunidad || '',
      `${cotizacion.auto?.marca?.nombre || ''} ${cotizacion.auto?.modelo?.nombre || ''}`.trim(),
      cotizacion.auto?.anio?.toString() || '',
      new Date(cotizacion.fecha_creacion).toLocaleDateString(),
      cotizacion.ip || '',
      cotizacion.ubicacion || '',
      cotizacion.mensaje || '',
    ]);

    const escapeHtml = (value: string | number) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r?\n/g, ' ');

    const tableRows = [headers, ...rows]
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
      .join('');

    const tableHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <table>${tableRows}</table>
  </body>
</html>`;

    const blob = new Blob([tableHtml], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cotizaciones_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cargando cotizaciones...</p>
      </div>
    );
  }

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
          title="Panel de Administración - Cotizaciones"
          description="Revisa y gestiona todas las cotizaciones de clientes interesados en los vehículos."
        />
      )}

      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Cotizaciones</h2>
            <p className="text-gray-600">Administra todas las solicitudes de cotización de clientes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Buscar</label>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, email, telefono, auto, mensaje, ciudad..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              <div className="w-full lg:w-60">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="all">Todos</option>
                  {estadosDisponibles.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full lg:w-auto lg:ml-auto flex flex-col items-start lg:items-end gap-2">
                <button
                  onClick={exportCotizacionesToXls}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  title="Exportar a XLS"
                  aria-label="Exportar a XLS"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <p className="text-xs text-gray-500">
                  Mostrando {filteredCotizaciones.length} de {cotizaciones.length}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6 mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Auto</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Oportunidad</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">IP</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mensaje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredCotizaciones.map((cotizacion) => (
                    <tr key={cotizacion.id} className="hover:bg-gray-50 transition-all cursor-pointer" onClick={() => handleCotizacionClick(cotizacion)}>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">{cotizacion.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{cotizacion.nombre_usuario}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 flex items-center gap-3">
                        {cotizacion.auto?.imagenes?.[0] && (
                          <Image
                            src={cotizacion.auto.imagenes[0].url}
                            alt={`${cotizacion.auto.marca?.nombre} ${cotizacion.auto.modelo?.nombre}`}
                            width={50}
                            height={30}
                            className="rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{cotizacion.auto?.marca?.nombre} {cotizacion.auto?.modelo?.nombre}</div>
                          <div className="text-sm text-gray-500">{cotizacion.auto?.anio}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{cotizacion.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{cotizacion.telefono}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{cotizacion.estado || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{cotizacion.estado_oportunidad || 'Nuevo'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{new Date(cotizacion.fecha_creacion).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{cotizacion.ip || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{cotizacion.ubicacion || 'N/A'}</td>
                      <td className="px-6 py-4 text-base text-gray-500 max-w-xs truncate">{cotizacion.mensaje || 'Sin mensaje'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {cotizaciones.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay cotizaciones registradas</h3>
              <p className="text-gray-600">Las cotizaciones aparecerán aquí cuando los clientes soliciten información sobre los autos.</p>
            </div>
          )}

          {cotizaciones.length > 0 && filteredCotizaciones.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-2xl mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay resultados con estos filtros</h3>
              <p className="text-gray-600">Ajusta la búsqueda o selecciona otro estado.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de detalles del auto */}
      {selectedAuto && (
        <AutoDetalle
          auto={selectedAuto}
          onClose={closeModal}
        />
      )}

      {/* Modal de detalle de cotización */}
      {selectedCotizacion && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeCotizacionModal}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-700 to-gray-900 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Detalle de Cotización #{selectedCotizacion.id}</h3>
                <button
                  onClick={closeCotizacionModal}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Info del cliente */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-black">Información del Cliente</h4>
                  <div className="space-y-2 text-black">
                    <p><strong>Nombre:</strong> {selectedCotizacion.nombre_usuario}</p>
                    <p><strong>Email:</strong> {selectedCotizacion.email}</p>
                    <p><strong>Teléfono:</strong> {selectedCotizacion.telefono || 'No proporcionado'}</p>
                    <p><strong>Ciudad:</strong> {selectedCotizacion.ciudad || 'No proporcionada'}</p>
                    <p><strong>Fecha:</strong> {new Date(selectedCotizacion.fecha_creacion).toLocaleString()}</p>
                    <p><strong>IP:</strong> {selectedCotizacion.ip || 'N/A'}</p>
                    <p><strong>Ubicación:</strong> {selectedCotizacion.ubicacion || 'N/A'}</p>
                  </div>
                  <div className="text-black">
                    <strong>Mensaje:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg text-black">{selectedCotizacion.mensaje}</p>
                  </div>
                </div>

                {/* Detalle del auto */}
                <div>
                  <h4 className="text-lg font-semibold text-black mb-4">Vehículo Cotizado</h4>
                  {selectedCotizacion.auto ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        {selectedCotizacion.auto.imagenes?.[0] && (
                          <Image
                            src={selectedCotizacion.auto.imagenes[0].url}
                            alt={`${selectedCotizacion.auto.marca?.nombre} ${selectedCotizacion.auto.modelo?.nombre}`}
                            width={80}
                            height={60}
                            className="rounded object-cover"
                          />
                        )}
                        <div className="text-black">
                          <h5 className="font-medium">{selectedCotizacion.auto.marca?.nombre} {selectedCotizacion.auto.modelo?.nombre}</h5>
                          <p className="text-sm text-gray-600">Año: {selectedCotizacion.auto.anio} | Precio: ${selectedCotizacion.auto.precio.toLocaleString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAuto(selectedCotizacion.auto);
                          closeCotizacionModal();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Abrir detalles completos del vehículo"
                      >
                        Ver Detalles Completos del Auto
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay vehículo asociado a esta cotización. Auto ID: {selectedCotizacion.auto_id}</p>
                  )}
                </div>
              </div>

              {/* Área de notas/chat */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-black mb-2">Notas del Administrador</h4>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Agregar notas sobre esta cotización, conversaciones, análisis..."
                />
                <button
                  onClick={saveNotas}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded font-medium transition-colors"
                  title="Guardar las notas escritas en la base de datos"
                  aria-label="Guardar notas"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Opciones de análisis */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-black mb-2">Opciones de Análisis</h4>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleEstadoOportunidad('Contactado')}
                    className={`text-white p-2 rounded transition-colors ${
                      parseEstadoOportunidad(selectedCotizacion.estado_oportunidad).includes('Contactado')
                        ? 'bg-yellow-900'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                    title="Marcar esta cotización como contactada"
                    aria-label="Marcar como contactado"
                  >
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleEstadoOportunidad('Interesado')}
                    className={`text-white p-2 rounded transition-colors ${
                      parseEstadoOportunidad(selectedCotizacion.estado_oportunidad).includes('Interesado')
                        ? 'bg-blue-900'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    title="Marcar como cliente interesado"
                    aria-label="Marcar como interesado"
                  >
                    <HeartIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleEstadoOportunidad('Venta potencial')}
                    className={`text-white p-2 rounded transition-colors ${
                      parseEstadoOportunidad(selectedCotizacion.estado_oportunidad).includes('Venta potencial')
                        ? 'bg-green-900'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    title="Marcar como venta potencial"
                    aria-label="Marcar como venta potencial"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleEstadoOportunidad('Descartado')}
                    className={`text-white p-2 rounded transition-colors ${
                      parseEstadoOportunidad(selectedCotizacion.estado_oportunidad).includes('Descartado')
                        ? 'bg-red-900'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                    title="Marcar como descartada"
                    aria-label="Marcar como descartado"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Botón Convertir a Cliente */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={convertirACliente}
                    disabled={convirtiendo}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    title="Crear un registro de cliente en el CRM con los datos de esta cotización"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                    {convirtiendo ? 'Creando cliente...' : 'Convertir a Cliente (CRM)'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Crea un cliente en el CRM con: {selectedCotizacion.nombre_usuario} / {selectedCotizacion.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

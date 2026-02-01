'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  TruckIcon,
  TagIcon,
  CubeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    title: 'Dashboard',
    description: 'Panel principal de administración',
    action: 'Inicio',
    icon: HomeIcon
  },
  {
    href: '/admin/autos/nuevo',
    title: 'Nuevo Auto',
    description: 'Agregar un vehículo al inventario',
    action: 'Crear',
    icon: PlusCircleIcon
  },
  {
    href: '/admin/autos',
    title: 'Gestionar Autos',
    description: 'Ver y editar el inventario completo',
    action: 'Ver todos',
    icon: TruckIcon
  },
  {
    href: '/admin/marcas',
    title: 'Gestionar Marcas',
    description: 'Administrar las marcas disponibles',
    action: 'Ver todas',
    icon: TagIcon
  },
  {
    href: '/admin/modelos',
    title: 'Gestionar Modelos',
    description: 'Administrar los modelos de cada marca',
    action: 'Ver todos',
    icon: CubeIcon
  },
  {
    href: '/admin/cotizaciones',
    title: 'Cotizaciones',
    description: 'Ver y gestionar las cotizaciones de clientes',
    action: 'Ver todas',
    icon: DocumentTextIcon
  },
  {
    href: '/admin/estados',
    title: 'Gestionar Estados',
    description: 'Administrar los estados de los vehículos',
    action: 'Ver todos',
    icon: CheckCircleIcon
  },
  {
    href: '/admin/configuracion-cloudinary',
    title: 'Configuración',
    description: 'Configurar servicios de imágenes',
    action: 'Configurar',
    icon: Cog6ToothIcon
  }
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Open sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update body class when sidebar state changes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('admin-sidebar-open');
    } else {
      document.body.classList.remove('admin-sidebar-open');
    }
    return () => {
      document.body.classList.remove('admin-sidebar-open');
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin');
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
        aria-label="Toggle navigation"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-2xl border-r border-gray-200 z-40 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Panel de Administración</h2>
                <p className="text-sm text-gray-600 mt-1">Acciones Rápidas</p>
              </div>
              {/* Close button (visible on all screens) */}
              <button
                onClick={() => setIsOpen(false)}
                className="ml-2 p-2 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                aria-label="Cerrar sidebar"
              >
                <XMarkIcon className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-start p-4 rounded-xl transition-all duration-200 hover:shadow-md border
                      ${isActive
                        ? 'bg-blue-50 border-blue-200 shadow-md'
                        : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mr-4 transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`
                          font-semibold text-sm transition-colors duration-200
                          ${isActive ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'}
                        `}>
                          {item.title}
                        </h3>
                        <span className={`
                          text-xs font-medium px-2 py-1 rounded-full transition-colors duration-200
                          ${isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                          }
                        `}>
                          {item.action}
                        </span>
                      </div>
                      <p className={`
                        text-xs text-gray-600 transition-colors duration-200
                        ${isActive ? 'text-blue-700' : 'group-hover:text-blue-700'}
                      `}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Cerrar Sesión
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Concesionarios.Cloud Admin
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
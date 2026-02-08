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
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ChartBarSquareIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface SubItem {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubItem[];
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
    href: '/admin/inventario',
    title: 'Inventario',
    description: 'Autos, marcas, modelos y estados',
    action: 'Ver panel',
    icon: TruckIcon,
    children: [
      { href: '/admin/autos/nuevo', title: 'Nuevo Auto', icon: PlusCircleIcon },
      { href: '/admin/autos', title: 'Gestionar Autos', icon: TruckIcon },
      { href: '/admin/marcas', title: 'Marcas', icon: TagIcon },
      { href: '/admin/modelos', title: 'Modelos', icon: CubeIcon },
      { href: '/admin/estados', title: 'Estados', icon: CheckCircleIcon },
    ]
  },
  {
    href: '/admin/crm',
    title: 'CRM',
    description: 'Cotizaciones, clientes y oportunidades',
    action: 'Ver panel',
    icon: ChartBarSquareIcon,
    children: [
      { href: '/admin/cotizaciones', title: 'Cotizaciones', icon: DocumentTextIcon },
      { href: '/admin/clientes', title: 'Clientes', icon: UserGroupIcon },
      { href: '/admin/oportunidades', title: 'Oportunidades', icon: RocketLaunchIcon },
    ]
  },
  {
    href: '/admin/ventas',
    title: 'Ventas',
    description: 'Registro de ventas, tomas y márgenes',
    action: 'Ver ventas',
    icon: BanknotesIcon
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();

  // Auto-expand section if a child route is active
  useEffect(() => {
    const expanded: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => pathname === child.href);
        if (isChildActive || pathname === item.href) {
          expanded[item.href] = true;
        }
      }
    });
    setExpandedSections((prev) => ({ ...prev, ...expanded }));
  }, [pathname]);

  const toggleSection = (href: string) => {
    setExpandedSections((prev) => ({ ...prev, [href]: !prev[href] }));
  };

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
          <div className="p-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Panel de Administración</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-2 p-2 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                aria-label="Cerrar sidebar"
              >
                <XMarkIcon className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            {/* Quick nav icons */}
            <div className="flex items-center gap-2 mt-3">
                <Link
                href="/"
                className="p-2 bg-white hover:bg-blue-200 rounded-lg transition-colors duration-200 shadow-sm border border-gray-200"
                aria-label="Ir al inicio"
                title="Ir al inicio"
              >
                <HomeIcon className="h-4 w-4 text-gray-600" />
              </Link>
              <button
                onClick={() => router.back()}
                className="p-2 bg-white hover:bg-blue-200 rounded-lg transition-colors duration-200 shadow-sm border border-gray-200"
                aria-label="Volver atrás"
                title="Volver atrás"
              >
                <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => router.forward()}
                className="p-2 bg-white hover:bg-blue-200 rounded-lg transition-colors duration-200 shadow-sm border border-gray-200"
                aria-label="Ir adelante"
                title="Ir adelante"
              >
                <ArrowRightIcon className="h-4 w-4 text-gray-600" />
              </button>
            
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedSections[item.href];
                const isChildActive = hasChildren && item.children!.some((child) => pathname === child.href);

                return (
                  <div key={item.href}>
                    {/* Main nav item */}
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 768) setIsOpen(false);
                        }}
                        className={`
                          group flex items-start p-4 rounded-xl transition-all duration-200 hover:shadow-md border flex-1 min-w-0
                          ${isActive || isChildActive
                            ? 'bg-blue-50 border-blue-200 shadow-md'
                            : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                          }
                          ${hasChildren ? 'rounded-r-none border-r-0' : ''}
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg mr-4 transition-colors duration-200
                          ${isActive || isChildActive
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
                              ${isActive || isChildActive ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'}
                            `}>
                              {item.title}
                            </h3>
                            {!hasChildren && (
                              <span className={`
                                text-xs font-medium px-2 py-1 rounded-full transition-colors duration-200
                                ${isActive
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                                }
                              `}>
                                {item.action}
                              </span>
                            )}
                          </div>
                          <p className={`
                            text-xs text-gray-600 transition-colors duration-200
                            ${isActive || isChildActive ? 'text-blue-700' : 'group-hover:text-blue-700'}
                          `}>
                            {item.description}
                          </p>
                        </div>
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => toggleSection(item.href)}
                          className={`
                            p-4 rounded-xl rounded-l-none border border-l-0 transition-all duration-200 hover:shadow-md self-stretch flex items-center
                            ${isActive || isChildActive
                              ? 'bg-blue-50 border-blue-200 shadow-md'
                              : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                            }
                          `}
                          aria-label={`Expandir ${item.title}`}
                        >
                          <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Sub-items */}
                    {hasChildren && (
                      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-6 pl-4 border-l-2 border-blue-100 space-y-1">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const isSubActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => {
                                  if (window.innerWidth < 768) setIsOpen(false);
                                }}
                                className={`
                                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                                  ${isSubActive
                                    ? 'bg-blue-100 text-blue-800 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                  }
                                `}
                              >
                                <ChildIcon className={`h-4 w-4 ${isSubActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                {child.title}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
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
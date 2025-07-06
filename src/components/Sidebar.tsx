
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CheckSquare, 
  Settings, 
  FileText, 
  CreditCard, 
  MapPin, 
  Calendar,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Shield,
  Cog
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['master-data']);

  useEffect(() => {
    // Auto-expand menu that contains current route
    const currentPath = location.pathname;
    if (currentPath.includes('/karyawan') || 
        currentPath.includes('/approval') || 
        currentPath.includes('/user-management') ||
        currentPath.includes('/role-management') ||
        currentPath.includes('/app-settings')) {
      setExpandedMenus(prev => prev.includes('master-data') ? prev : [...prev, 'master-data']);
    }
  }, [location.pathname]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      path: '/',
      isActive: location.pathname === '/'
    },
    {
      id: 'master-data',
      title: 'Master Data',
      icon: FileText,
      hasSubmenu: true,
      isExpanded: expandedMenus.includes('master-data'),
      submenu: [
        {
          title: 'Karyawan',
          icon: Users,
          path: '/karyawan',
          isActive: location.pathname === '/karyawan'
        },
        {
          title: 'Line Approval',
          icon: CheckSquare,
          path: '/approval',
          isActive: location.pathname === '/approval'
        },
        {
          title: 'Manajemen User',
          icon: UserPlus,
          path: '/user-management',
          isActive: location.pathname === '/user-management'
        },
        {
          title: 'Role Manajemen',
          icon: Shield,
          path: '/role-management',
          isActive: location.pathname === '/role-management'
        },
        {
          title: 'Pengaturan Aplikasi',
          icon: Cog,
          path: '/app-settings',
          isActive: location.pathname === '/app-settings'
        }
      ]
    },
    {
      id: 'perjalanan-dinas',
      title: 'Perjalanan Dinas',
      icon: MapPin,
      path: '/perjalanan-dinas',
      isActive: location.pathname === '/perjalanan-dinas'
    },
    {
      id: 'keuangan',
      title: 'Keuangan',
      icon: CreditCard,
      path: '/keuangan',
      isActive: location.pathname === '/keuangan'
    },
    {
      id: 'laporan',
      title: 'Laporan',
      icon: FileText,
      path: '/laporan',
      isActive: location.pathname === '/laporan'
    },
    {
      id: 'kalender',
      title: 'Kalender',
      icon: Calendar,
      path: '/kalender',
      isActive: location.pathname === '/kalender'
    },
    {
      id: 'pengaturan',
      title: 'Pengaturan',
      icon: Settings,
      path: '/pengaturan',
      isActive: location.pathname === '/pengaturan'
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Travel Pro</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Perjalanan Dinas</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${item.isExpanded 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    {item.isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {item.isExpanded && item.submenu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors
                            ${subItem.isActive 
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                          `}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${item.isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

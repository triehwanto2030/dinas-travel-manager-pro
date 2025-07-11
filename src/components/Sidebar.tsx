
import React from 'react';
import { Home, Plane, Users, Building, ChevronDown, ChevronRight, FileText, UserCheck, Settings, Circle, CheckSquare, Receipt, ChevronLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const [isDinasOpen, setIsDinasOpen] = useState(true);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      isActive: location.pathname === '/'
    }
  ];

  const dinasSubmenu = [
    {
      icon: Plane,
      label: 'Perjalanan Dinas',
      path: '/perjalanan-dinas',
      isActive: location.pathname === '/perjalanan-dinas'
    },
    {
      icon: CheckSquare,
      label: 'Approval Perjalanan Dinas',
      path: '/approval-perjalanan-dinas',
      isActive: location.pathname === '/approval-perjalanan-dinas'
    },
    {
      icon: Receipt,
      label: 'Claim Dinas',
      path: '/claim-dinas',
      isActive: location.pathname === '/claim-dinas'
    },
    {
      icon: UserCheck,
      label: 'Approval Claim Dinas',
      path: '/approval-claim-dinas',
      isActive: location.pathname === '/approval-claim-dinas'
    }
  ];

  const masterDataSubmenu = [
    {
      icon: Users,
      label: 'Karyawan',
      path: '/karyawan',
      isActive: location.pathname === '/karyawan'
    },
    {
      icon: FileText,
      label: 'Line Approval',
      path: '/approval',
      isActive: location.pathname === '/approval'
    },
    {
      icon: UserCheck,
      label: 'Manajemen User',
      path: '/manajemen-user',
      isActive: location.pathname === '/manajemen-user'
    },
    {
      icon: Settings,
      label: 'Role Manajemen',
      path: '/role-manajemen',
      isActive: location.pathname === '/role-manajemen'
    }
  ];

  const pengaturanSubmenu = [
    {
      icon: Settings,
      label: 'Pengaturan Aplikasi',
      path: '/pengaturan-aplikasi',
      isActive: location.pathname === '/pengaturan-aplikasi'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 
        transform transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Travel Pro</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Perjalanan Dinas</p>
                </div>
              )}
            </div>
            {!isCollapsed && onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="hidden lg:flex rounded-full p-1 h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {/* Dashboard */}
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    onClick={() => window.innerWidth < 1024 && onToggle()}
                    title={isCollapsed ? item.label : ''}
                  >
                    <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && item.label}
                  </Link>
                </li>
              ))}

              {/* Dinas */}
              <li>
                <Collapsible open={isDinasOpen && !isCollapsed} onOpenChange={setIsDinasOpen}>
                  <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="flex items-center">
                      <Plane className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && 'Dinas'}
                    </div>
                    {!isCollapsed && (
                      isDinasOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent className="ml-8 mt-2 space-y-2">
                      {dinasSubmenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                            subItem.isActive
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => window.innerWidth < 1024 && onToggle()}
                        >
                          <subItem.icon className="w-4 h-4 mr-3" />
                          {subItem.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>

                {/* Collapsed menu items */}
                {isCollapsed && (
                  <div className="mt-2 space-y-1">
                    {dinasSubmenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          subItem.isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        title={subItem.label}
                        onClick={() => window.innerWidth < 1024 && onToggle()}
                      >
                        <subItem.icon className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                )}
              </li>

              {/* Master Data */}
              <li>
                <Collapsible open={isMasterDataOpen && !isCollapsed} onOpenChange={setIsMasterDataOpen}>
                  <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="flex items-center">
                      <Building className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && 'Master Data'}
                    </div>
                    {!isCollapsed && (
                      isMasterDataOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent className="ml-8 mt-2 space-y-2">
                      {masterDataSubmenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                            subItem.isActive
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => window.innerWidth < 1024 && onToggle()}
                        >
                          <subItem.icon className="w-4 h-4 mr-3" />
                          {subItem.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>

                {/* Collapsed menu items */}
                {isCollapsed && (
                  <div className="mt-2 space-y-1">
                    {masterDataSubmenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          subItem.isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        title={subItem.label}
                        onClick={() => window.innerWidth < 1024 && onToggle()}
                      >
                        <subItem.icon className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                )}
              </li>

              {/* Pengaturan */}
              <li>
                <Collapsible>
                  <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="flex items-center">
                      <Settings className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && 'Pengaturan'}
                    </div>
                    {!isCollapsed && <ChevronRight className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent className="ml-8 mt-2 space-y-2">
                      {pengaturanSubmenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                            subItem.isActive
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => window.innerWidth < 1024 && onToggle()}
                        >
                          <subItem.icon className="w-4 h-4 mr-3" />
                          {subItem.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>

                {/* Collapsed menu items */}
                {isCollapsed && (
                  <div className="mt-2 space-y-1">
                    {pengaturanSubmenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          subItem.isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        title={subItem.label}
                        onClick={() => window.innerWidth < 1024 && onToggle()}
                      >
                        <subItem.icon className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* Collapse toggle for desktop */}
          {isCollapsed && onToggleCollapse && (
            <div className="hidden lg:block p-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="w-full rounded-full p-2"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

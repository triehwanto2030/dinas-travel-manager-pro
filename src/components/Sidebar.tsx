
import React from 'react';
import { Home, Plane, Users, Building, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [isDinasOpen, setIsDinasOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);

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
      label: 'Perjalanan Dinas',
      path: '/perjalanan-dinas',
      isActive: location.pathname === '/perjalanan-dinas'
    },
    {
      label: 'Claim Perjalanan Dinas',
      path: '/claim-dinas',
      isActive: location.pathname === '/claim-dinas'
    }
  ];

  const masterDataSubmenu = [
    {
      label: 'Karyawan',
      path: '/karyawan',
      isActive: location.pathname === '/karyawan'
    },
    {
      label: 'Line Approval',
      path: '/approval',
      isActive: location.pathname === '/approval'
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
        fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 
        transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Perjalanan Dinas</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {/* Dashboard */}
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => window.innerWidth < 1024 && onToggle()}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* Dinas */}
              <li>
                <Collapsible open={isDinasOpen} onOpenChange={setIsDinasOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center">
                      <Plane className="w-5 h-5 mr-3" />
                      Dinas
                    </div>
                    {isDinasOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-8 mt-2 space-y-2">
                    {dinasSubmenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                          subItem.isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => window.innerWidth < 1024 && onToggle()}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </li>

              {/* Master Data */}
              <li>
                <Collapsible open={isMasterDataOpen} onOpenChange={setIsMasterDataOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-3" />
                      Master Data
                    </div>
                    {isMasterDataOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-8 mt-2 space-y-2">
                    {masterDataSubmenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                          subItem.isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => window.innerWidth < 1024 && onToggle()}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

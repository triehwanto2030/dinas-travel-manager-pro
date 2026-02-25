
import React from 'react';
import { Home, Plane, Users, Building, ChevronDown, ChevronRight, FileText, UserCheck, Settings, CheckSquare, Receipt } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { usePageAccess } from '@/hooks/usePageAccess';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [isDinasOpen, setIsDinasOpen] = useState(true);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const { hasAccess } = usePageAccess();

  const menuItems = [
    {icon: Home, label: 'Dashboard', path: '/', pageKey: 'dashboard' }
  ].filter(item => hasAccess(item.pageKey));

  const dinasSubmenu = [
    { icon: Plane, label: 'Perjalanan Dinas', path: '/perjalanan-dinas', pageKey: 'perjalanan-dinas' },
    { icon: CheckSquare, label: 'Approval Perjalanan Dinas', path: '/approval-perjalanan-dinas', pageKey: 'approval-perjalanan-dinas' },
    { icon: Receipt, label: 'Claim Dinas', path: '/claim-dinas', pageKey: 'claim-dinas' },
    { icon: UserCheck, label: 'Approval Claim Dinas', path: '/approval-claim-dinas', pageKey: 'approval-claim-dinas'}
  ].filter(item => hasAccess(item.pageKey));

  const masterDataSubmenu = [
    { icon: Users, label: 'Karyawan', path: '/karyawan', pageKey: 'karyawan' },
    { icon: Building, label: 'Manajemen Karyawan', path: '/manajemen-karyawan', pageKey: 'manajemen-karyawan' },
    { icon: FileText, label: 'Line Approval', path: '/approval', pageKey: 'approval' },
    { icon: UserCheck, label: 'Manajemen User', path: '/manajemen-user', pageKey: 'manajemen-user' },
    { icon: Settings, label: 'Role Manajemen', path: '/role-manajemen', pageKey: 'role-manajemen' }
  ].filter(item => hasAccess(item.pageKey));

  const pengaturanSubmenu = [
    { icon: Settings, label: 'Pengaturan Aplikasi', path: '/pengaturan-aplikasi', pageKey: 'pengaturan-aplikasi' }
  ].filter(item => hasAccess(item.pageKey));
  
  const renderLink = (item: { icon: any; label: string; path: string }, isSubmenu = false) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center ${isSubmenu ? 'px-4 py-2 text-sm' : 'px-4 py-3 text-sm font-medium'} rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            : `${isSubmenu ? 'text-gray-600 dark:text-gray-300' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700`
        }`}
        onClick={() => window.innerWidth < 1024 && onToggle()}
      >
        <item.icon className={`${isSubmenu ? 'w-4 h-4' : 'w-5 h-5'} mr-3`} />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={onToggle} />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 
        transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {/* Dashboard */}
              {menuItems.map((item) => (
                <li key={item.path}>{renderLink(item)}</li>
              ))}

              {/* Dinas */}
              {dinasSubmenu.length > 0 && (
                <li>
                  <Collapsible open={isDinasOpen} onOpenChange={setIsDinasOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center">
                        <Plane className="w-5 h-5 mr-3" />
                        Dinas
                      </div>
                      {isDinasOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-8 mt-2 space-y-2">
                      {dinasSubmenu.map(item => renderLink(item, true))}
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              )}

              {/* Master Data */}
              {masterDataSubmenu.length > 0 && (
                <li>
                  <Collapsible open={isMasterDataOpen} onOpenChange={setIsMasterDataOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 mr-3" />
                        Master Data
                      </div>
                      {isMasterDataOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-8 mt-2 space-y-2">
                      {masterDataSubmenu.map(item => renderLink(item, true))}
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              )}

              {/* Pengaturan */}
              {pengaturanSubmenu.length > 0 && (
                <li>
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center">
                        <Settings className="w-5 h-5 mr-3" />
                        Pengaturan
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-8 mt-2 space-y-2">
                      {pengaturanSubmenu.map(item => renderLink(item, true))}
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

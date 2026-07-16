import React, { useState } from 'react';
import { Home, Plane, Users, Building, ChevronDown, ChevronRight, FileText, UserCheck, Settings, CheckSquare, Receipt, X, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePageAccess } from '@/hooks/usePageAccess';
import pjmLogo from '@/assets/pjm-logo.png';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [isDinasOpen, setIsDinasOpen] = useState(true);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(false);
  const { hasAccess } = usePageAccess();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', pageKey: 'dashboard' }
  ].filter(item => hasAccess(item.pageKey));

  const dinasSubmenu = [
    { icon: Plane, label: 'Perjalanan Dinas', path: '/perjalanan-dinas', pageKey: 'perjalanan-dinas' },
    { icon: CheckSquare, label: 'Approval Perjalanan', path: '/approval-perjalanan-dinas', pageKey: 'approval-perjalanan-dinas' },
    { icon: Receipt, label: 'Claim Dinas', path: '/claim-dinas', pageKey: 'claim-dinas' },
    { icon: UserCheck, label: 'Approval Claim', path: '/approval-claim-dinas', pageKey: 'approval-claim-dinas' }
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

  const isPathActive = (path: string) => location.pathname === path;
  const isGroupActive = (items: { path: string }[]) => items.some(item => location.pathname === item.path);

  const renderLink = (item: { icon: any; label: string; path: string }, isSubmenu = false) => {
    const isActive = isPathActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-lg shadow-[hsl(var(--sidebar-primary))/20]'
            : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'
        }`}
        onClick={() => window.innerWidth < 1024 && onToggle()}
      >
        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`} />
        <span className="truncate">{item.label}</span>
        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      </Link>
    );
  };

  const renderCollapsibleGroup = (
    label: string,
    icon: any,
    items: any[],
    isOpen: boolean,
    setIsOpen: (v: boolean) => void
  ) => {
    if (items.length === 0) return null;
    const Icon = icon;
    const groupActive = isGroupActive(items);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
          groupActive
            ? 'text-[hsl(var(--sidebar-primary))]'
            : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
        }`}>
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 opacity-70" />
            <span>{label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 ml-4 pl-3 border-l-2 border-[hsl(var(--sidebar-border))] space-y-1">
          {items.map(item => renderLink(item, true))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-[270px] flex flex-col
        bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg p-1.5">
              <img src={pjmLogo} alt="PJM Group" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[hsl(var(--sidebar-primary-foreground))]">PJM GROUP</h1>
              <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-60">Perjalanan Dinas</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {/* Main */}
          <div className="space-y-1">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))] opacity-40">
              Menu Utama
            </p>
            {menuItems.map(item => renderLink(item))}
          </div>

          {/* Dinas */}
          {dinasSubmenu.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))] opacity-40">
                Dinas
              </p>
              {renderCollapsibleGroup('Perjalanan & Claim', Plane, dinasSubmenu, isDinasOpen, setIsDinasOpen)}
            </div>
          )}

          {/* Master Data */}
          {masterDataSubmenu.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))] opacity-40">
                Master Data
              </p>
              {renderCollapsibleGroup('Data & Pengguna', Building, masterDataSubmenu, isMasterDataOpen, setIsMasterDataOpen)}
            </div>
          )}

          {/* Pengaturan */}
          {pengaturanSubmenu.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))] opacity-40">
                Sistem
              </p>
              {renderCollapsibleGroup('Pengaturan', Settings, pengaturanSubmenu, isPengaturanOpen, setIsPengaturanOpen)}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[hsl(var(--sidebar-border))]">
          <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-40 text-center">
            © 2024 PJM GROUP v2.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

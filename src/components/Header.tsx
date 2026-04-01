import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, LogOut, Menu, User, ChevronDown } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/perjalanan-dinas': 'Perjalanan Dinas',
  '/approval-perjalanan-dinas': 'Approval Perjalanan Dinas',
  '/claim-dinas': 'Claim Dinas',
  '/approval-claim-dinas': 'Approval Claim Dinas',
  '/karyawan': 'Data Karyawan',
  '/manajemen-karyawan': 'Manajemen Karyawan',
  '/approval': 'Line Approval',
  '/manajemen-user': 'Manajemen User',
  '/role-manajemen': 'Role Manajemen',
  '/pengaturan-aplikasi': 'Pengaturan Aplikasi',
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = employee?.name || user?.username || user?.email || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="glass border-b border-border/60 px-4 md:px-6 h-16 flex items-center sticky top-0 z-30">
      <div className="flex items-center justify-between w-full">
        {/* Left */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="lg:hidden h-9 w-9 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">{pageTitle}</h1>
          </div>
        </div>

        {/* Center - Search (desktop) */}
        <div className="hidden md:block flex-1 max-w-sm mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari..."
              className="pl-10 h-9 bg-muted/50 border-border/50 rounded-xl text-sm focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <NotificationBell />

          {/* Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                {employee?.photo_url ? (
                  <img src={employee.photo_url} alt={displayName} className="w-8 h-8 object-cover" />
                ) : (
                  <span className="text-primary-foreground text-xs font-bold">{initials}</span>
                )}
              </div>
              <span className="hidden md:inline text-sm font-medium text-foreground max-w-[120px] truncate">{displayName}</span>
              <ChevronDown className="hidden md:block w-3 h-3 text-muted-foreground" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-60 glass rounded-xl shadow-xl border border-border/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-border/60 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      {employee?.photo_url ? (
                        <img src={employee.photo_url} alt={displayName} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <span className="text-primary-foreground text-sm font-bold">{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

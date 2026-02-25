import { useAuth } from '@/contexts/AuthContext';
import { useRoles } from '@/hooks/useRoles';

export const ALL_PAGES = [
  { key: 'dashboard', label: 'Dashboard', path: '/' },
  { key: 'perjalanan-dinas', label: 'Perjalanan Dinas', path: '/perjalanan-dinas' },
  { key: 'approval-perjalanan-dinas', label: 'Approval Perjalanan Dinas', path: '/approval-perjalanan-dinas' },
  { key: 'claim-dinas', label: 'Claim Dinas', path: '/claim-dinas' },
  { key: 'approval-claim-dinas', label: 'Approval Claim Dinas', path: '/approval-claim-dinas' },
  { key: 'karyawan', label: 'Karyawan', path: '/karyawan' },
  { key: 'manajemen-karyawan', label: 'Manajemen Karyawan', path: '/manajemen-karyawan' },
  { key: 'approval', label: 'Line Approval', path: '/approval' },
  { key: 'manajemen-user', label: 'Manajemen User', path: '/manajemen-user' },
  { key: 'role-manajemen', label: 'Role Manajemen', path: '/role-manajemen' },
  { key: 'pengaturan-aplikasi', label: 'Pengaturan Aplikasi', path: '/pengaturan-aplikasi' },
] as const;

export type PageKey = typeof ALL_PAGES[number]['key'];

export function usePageAccess() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles();

  const userRole = roles.find(r => r.name.toLowerCase() === (user?.role || '').toLowerCase());
  const pageAccess: string[] = Array.isArray(userRole?.page_access) ? (userRole.page_access as string[]) : [];

  const hasAccess = (pageKey: string) => pageAccess.includes(pageKey);

  const hasPathAccess = (path: string) => {
    const page = ALL_PAGES.find(p => p.path === path);
    if (!page) return false;
    return hasAccess(page.key);
  };

  return { pageAccess, hasAccess, hasPathAccess, isLoaded: roles.length > 0 };
}
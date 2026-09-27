import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  List,
  LogOut,
  Fish,
  Building2,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageId } from '../types';
import { ROLE_LABELS } from '../utils/labels';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

interface MenuItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

// Every logged-in user gets these; managers and admins additionally get MANAGER_ONLY_ITEMS.
const BASE_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'report-issue', label: 'تقرير مشكلة', icon: PlusCircle },
  { id: 'my-issues', label: 'مشاكلي', icon: List },
];

const MANAGER_ONLY_ITEMS: MenuItem[] = [
  { id: 'all-issues', label: 'جميع المشاكل', icon: List },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'branches', label: 'الفروع', icon: Building2 },
  { id: 'staff', label: 'الموظفين', icon: Users },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { currentUser, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isManager = currentUser?.role === 'quality_manager' || currentUser?.role === 'admin';
  const menu = isManager ? [...BASE_MENU, ...MANAGER_ONLY_ITEMS] : BASE_MENU;
  const currentPageLabel = menu.find((item) => item.id === currentPage)?.label ?? '';

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setIsDrawerOpen(false); // auto-close the drawer on mobile after picking a page
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex" dir="rtl">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-blue-900 text-white px-4 py-3 shadow-md">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 -mr-2 rounded-lg hover:bg-white/10"
          aria-label="فتح القائمة"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-medium">{currentPageLabel}</span>
        <div className="w-9 h-9 bg-cyan-400/20 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-cyan-300">{currentUser?.name.charAt(0)}</span>
        </div>
      </header>

      {/* Backdrop, mobile only, shown while the drawer is open */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: static on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed md:static inset-y-0 right-0 z-40 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl transform transition-transform duration-200 md:translate-x-0 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-blue-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400/20 rounded-lg flex items-center justify-center">
              <Fish className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h1 className="font-bold text-lg">سي فود QMS</h1>
              <p className="text-xs text-blue-300">نظام إدارة الجودة</p>
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-white/10"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 bg-cyan-400/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-cyan-300">
                {currentUser?.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-blue-300">
                {currentUser ? ROLE_LABELS[currentUser.role] : ''}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:overflow-auto min-w-0">{children}</main>
    </div>
  );
};

export default Layout;

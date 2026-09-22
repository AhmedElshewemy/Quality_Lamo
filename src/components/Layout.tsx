import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, List, LogOut, Fish, Building2, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { currentUser, logout } = useAuth();

  const menu = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'report-issue', label: 'تقرير مشكلة', icon: PlusCircle },
    { id: 'my-issues', label: 'مشاكلي', icon: List },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'branches', label: 'الفروع', icon: Building2 },
    { id: 'staff', label: 'الموظفين', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400/20 rounded-lg flex items-center justify-center">
              <Fish className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h1 className="font-bold text-lg">سي فود QMS</h1>
              <p className="text-xs text-blue-300">نظام إدارة الجودة</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
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
                {currentUser?.role === 'quality_manager' ? 'مدير الجودة' : 
                 currentUser?.role === 'admin' ? 'مدير النظام' : 'مهندس جودة'}
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

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;

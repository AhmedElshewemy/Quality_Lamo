import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { branches } from '../data/branches';
import { users } from '../data/users';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Thermometer,
  Bug,
  Droplets,
  Trash2,
  FileWarning,
  Wrench,
  Users,
  Package,
  Utensils,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { ComplianceStatus, IssueCategory } from '../types';

const categoryLabels: Record<IssueCategory, string> = {
  food_safety: 'سلامة الغذاء',
  hygiene: 'النظافة',
  equipment: 'المعدات',
  storage: 'التخزين',
  staff: 'الموظفين',
  documentation: 'المستندات',
  temperature: 'درجة الحرارة',
  pest_control: 'مكافحة الآفات',
  water_quality: 'جودة المياه',
  waste_management: 'إدارة النفايات',
};

const categoryIcons: Record<IssueCategory, React.ElementType> = {
  food_safety: Shield,
  hygiene: Droplets,
  equipment: Wrench,
  storage: Package,
  staff: Users,
  documentation: FileWarning,
  temperature: Thermometer,
  pest_control: Bug,
  water_quality: Droplets,
  waste_management: Trash2,
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const priorityLabels = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  critical: 'حرج',
};

const statusLabels = {
  open: 'مفتوح',
  in_progress: 'قيد المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلق',
};

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

const complianceLabels: Record<ComplianceStatus, string> = {
  compliant: 'مطابق',
  partially_compliant: 'مطابق جزئياً',
  non_compliant: 'غير مطابق',
};

const complianceColors: Record<ComplianceStatus, string> = {
  compliant: 'bg-green-100 text-green-700',
  partially_compliant: 'bg-yellow-100 text-yellow-700',
  non_compliant: 'bg-red-100 text-red-700',
};

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { issues } = useData();
  const isManager = currentUser?.role === 'quality_manager' || currentUser?.role === 'admin';

  const stats = useMemo(() => {
    const filteredIssues = isManager ? issues : issues.filter(i => i.reportedBy === currentUser?.id);
    
    const total = filteredIssues.length;
    const open = filteredIssues.filter(i => i.status === 'open').length;
    const inProgress = filteredIssues.filter(i => i.status === 'in_progress').length;
    const resolved = filteredIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    const critical = filteredIssues.filter(i => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length;
    
    const compliant = filteredIssues.filter(i => i.complianceStatus === 'compliant').length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

    return { total, open, inProgress, resolved, critical, complianceRate };
  }, [issues, currentUser, isManager]);

  // بيانات المقارنة مع الأسبوع الماضي
  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    const thisWeekIssues = issues.filter(i => new Date(i.reportedAt) >= thisWeekStart).length;
    const lastWeekIssues = issues.filter(i => {
      const d = new Date(i.reportedAt);
      return d >= lastWeekStart && d < lastWeekEnd;
    }).length;

    const change = lastWeekIssues > 0 
      ? Math.round(((thisWeekIssues - lastWeekIssues) / lastWeekIssues) * 100)
      : thisWeekIssues > 0 ? 100 : 0;

    return { thisWeek: thisWeekIssues, lastWeek: lastWeekIssues, change };
  }, [issues]);

  // بيانات المقارنة مع الشهر الماضي
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(-1);

    const thisMonthIssues = issues.filter(i => new Date(i.reportedAt) >= thisMonthStart).length;
    const lastMonthIssues = issues.filter(i => {
      const d = new Date(i.reportedAt);
      return d >= lastMonthStart && d < lastMonthEnd;
    }).length;

    const change = lastMonthIssues > 0 
      ? Math.round(((thisMonthIssues - lastMonthIssues) / lastMonthIssues) * 100)
      : thisMonthIssues > 0 ? 100 : 0;

    return { thisMonth: thisMonthIssues, lastMonth: lastMonthIssues, change };
  }, [issues]);

  // بيانات الرسم البياني بالفروع
  const branchData = useMemo(() => {
    return branches.map(branch => {
      const branchIssues = issues.filter(i => i.branchId === branch.id);
      const resolved = branchIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
      const compliant = branchIssues.filter(i => i.complianceStatus === 'compliant').length;
      return {
        name: branch.name.replace('فرع ', ''),
        total: branchIssues.length,
        resolved,
        complianceRate: branchIssues.length > 0 ? Math.round((compliant / branchIssues.length) * 100) : 100,
      };
    });
  }, [issues]);

  // بيانات الفئات
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    issues.forEach(issue => {
      categories[issue.category] = (categories[issue.category] || 0) + 1;
    });
    return Object.entries(categories).map(([key, value]) => ({
      name: categoryLabels[key as IssueCategory],
      value,
    })).sort((a, b) => b.value - a.value);
  }, [issues]);

  // بيانات الاتجاه الشهري
  const trendData = useMemo(() => {
    const months: { name: string; issues: number; resolved: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthIssues = issues.filter(issue => {
        const d = new Date(issue.reportedAt);
        return d >= monthStart && d <= monthEnd;
      });
      
      const monthResolved = monthIssues.filter(i => i.status === 'resolved' || i.status === 'closed');
      
      months.push({
        name: date.toLocaleDateString('ar-EG', { month: 'short' }),
        issues: monthIssues.length,
        resolved: monthResolved.length,
      });
    }
    return months;
  }, [issues]);

  // بيانات المطابقة
  const complianceData = useMemo(() => {
    const compliant = issues.filter(i => i.complianceStatus === 'compliant').length;
    const partial = issues.filter(i => i.complianceStatus === 'partially_compliant').length;
    const nonCompliant = issues.filter(i => i.complianceStatus === 'non_compliant').length;
    return [
      { name: 'مطابق', value: compliant, color: '#10b981' },
      { name: 'مطابق جزئياً', value: partial, color: '#f59e0b' },
      { name: 'غير مطابق', value: nonCompliant, color: '#ef4444' },
    ];
  }, [issues]);

  const recentIssues = useMemo(() => {
    return [...issues]
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, 5);
  }, [issues]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">
            مرحباً {currentUser?.name} - نظرة عامة على حالة الجودة
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              weeklyComparison.change <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {weeklyComparison.change > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
              {' '}{Math.abs(weeklyComparison.change)}% عن الأسبوع الماضي
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500 mt-1">إجمالي المشاكل ({weeklyComparison.thisWeek} هذا الأسبوع)</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              monthlyComparison.change <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {monthlyComparison.change > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
              {' '}{Math.abs(monthlyComparison.change)}% عن الشهر الماضي
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.resolved}</p>
          <p className="text-sm text-gray-500 mt-1">مشاكل تم حلها</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.open + stats.inProgress}</p>
          <p className="text-sm text-gray-500 mt-1">مشاكل مفتوحة / قيد المعالجة</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.complianceRate}%</p>
          <p className="text-sm text-gray-500 mt-1">نسبة المطابقة</p>
        </div>
      </div>

      {/* Critical Alert */}
      {stats.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">تنبيه: {stats.critical} مشكلة حرجة تحتاج اهتمام فوري</p>
            <p className="text-sm text-red-600">يجب التعامل مع هذه المشاكل في أقرب وقت ممكن</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">اتجاه المشاكل - آخر 6 أشهر</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="issues" name="مشاكل جديدة" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="resolved" name="تم حلها" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">حالة المطابقة</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={complianceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch & Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">أداء الفروع</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={branchData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="إجمالي" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="resolved" name="تم الحل" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">توزيع المشاكل حسب الفئة</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="عدد المشاكل" radius={[4, 4, 0, 0]}>
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">آخر المشاكل المبلغ عنها</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المشكلة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفرع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المطابقة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentIssues.map(issue => {
                const branch = branches.find(b => b.id === issue.branchId);
                const reporter = users.find(u => u.id === issue.reportedBy);
                const CatIcon = categoryIcons[issue.category];
                return (
                  <tr key={issue.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CatIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{issue.title}</p>
                          <p className="text-xs text-gray-500">بواسطة: {reporter?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{branch?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{categoryLabels[issue.category]}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[issue.priority]}`}>
                        {priorityLabels[issue.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[issue.status]}`}>
                        {statusLabels[issue.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${complianceColors[issue.complianceStatus]}`}>
                        {complianceLabels[issue.complianceStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(issue.reportedAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

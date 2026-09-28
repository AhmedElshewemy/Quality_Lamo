import React, { Suspense ,lazy ,useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useBranches } from '../hooks/useBranches';
import { useUsers } from '../hooks/useUsers';
import { Issue, IssueCategory } from '../types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  COMPLIANCE_LABELS,
  COMPLIANCE_COLORS,
} from '../utils/labels';
//import DashboardChartsSkeleton from '../components/dashboard/DashboardChartsSkeleton';

// recharts (~250KB) is only needed once these render, so it's kept out of the
// Dashboard's own chunk - the KPI cards and recent-issues table below render
// immediately, and this chunk streams in right after instead of blocking them.

 import DashboardChartsSkeleton from '../components/dashboard/DashboardChartsSkeleton';

 const DashboardCharts = lazy(() => import('../components/dashboard/DashboardCharts'));
//import DashboardCharts from '../components/dashboard/DashboardCharts';
const isResolved = (issue: Issue) => issue.status === 'resolved' || issue.status === 'closed';

/** Percentage change from `previous` to `current`, treating 0→N as a full +100%. */
const percentChange = (current: number, previous: number) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

const TrendBadge: React.FC<{ change: number; label: string }> = ({ change, label }) => (
  <span
    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
      change <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}
  >
    {change > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
    {' '}
    {Math.abs(change)}% {label}
  </span>
);

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { issues, isLoading } = useData();
  const { branches, branchName, isLoading: branchesLoading } = useBranches();
  const { userName, isLoading: usersLoading } = useUsers();

  const isManager = currentUser?.role === 'quality_manager' || currentUser?.role === 'admin';

  // Engineers only see their own reported issues throughout the dashboard;
  // managers/admins see everything. Scoping is applied once here so every
  // stat, chart and table below stays consistent with what the KPI cards show.
  const scopedIssues = useMemo(
    () => (isManager ? issues : issues.filter((i) => i.reportedBy === currentUser?.id)),
    [issues, isManager, currentUser]
  );

  const stats = useMemo(() => {
    const total = scopedIssues.length;
    const open = scopedIssues.filter((i) => i.status === 'open').length;
    const inProgress = scopedIssues.filter((i) => i.status === 'in_progress').length;
    const resolved = scopedIssues.filter(isResolved).length;
    const critical = scopedIssues.filter((i) => i.priority === 'critical' && !isResolved(i)).length;
    const compliant = scopedIssues.filter((i) => i.complianceStatus === 'compliant').length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, open, inProgress, resolved, critical, complianceRate };
  }, [scopedIssues]);

  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeek = scopedIssues.filter((i) => new Date(i.reportedAt) >= thisWeekStart).length;
    const lastWeek = scopedIssues.filter((i) => {
      const d = new Date(i.reportedAt);
      return d >= lastWeekStart && d < thisWeekStart;
    }).length;

    return { thisWeek, change: percentChange(thisWeek, lastWeek) };
  }, [scopedIssues]);

  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonth = scopedIssues.filter((i) => new Date(i.reportedAt) >= thisMonthStart).length;
    const lastMonth = scopedIssues.filter((i) => {
      const d = new Date(i.reportedAt);
      return d >= lastMonthStart && d < thisMonthStart;
    }).length;

    return { change: percentChange(thisMonth, lastMonth) };
  }, [scopedIssues]);

  const branchData = useMemo(
    () =>
      branches.map((branch) => {
        const branchIssues = scopedIssues.filter((i) => i.branchId === branch.id);
        const resolved = branchIssues.filter(isResolved).length;
        return {
          name: branch.name.replace('فرع ', ''),
          total: branchIssues.length,
          resolved,
        };
      }),
    [branches, scopedIssues]
  );

  const categoryData = useMemo(() => {
    const counts: Partial<Record<IssueCategory, number>> = {};
    scopedIssues.forEach((issue) => {
      counts[issue.category] = (counts[issue.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({ name: CATEGORY_LABELS[key as IssueCategory], value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [scopedIssues]);

  const trendData = useMemo(() => {
    const months: { name: string; issues: number; resolved: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthIssues = scopedIssues.filter((issue) => {
        const d = new Date(issue.reportedAt);
        return d >= monthStart && d <= monthEnd;
      });

      months.push({
        name: date.toLocaleDateString('ar-EG', { month: 'short' }),
        issues: monthIssues.length,
        resolved: monthIssues.filter(isResolved).length,
      });
    }
    return months;
  }, [scopedIssues]);

  const complianceData = useMemo(
    () => [
      { name: COMPLIANCE_LABELS.compliant, value: scopedIssues.filter((i) => i.complianceStatus === 'compliant').length, color: '#10b981' },
      { name: COMPLIANCE_LABELS.partially_compliant, value: scopedIssues.filter((i) => i.complianceStatus === 'partially_compliant').length, color: '#f59e0b' },
      { name: COMPLIANCE_LABELS.non_compliant, value: scopedIssues.filter((i) => i.complianceStatus === 'non_compliant').length, color: '#ef4444' },
    ],
    [scopedIssues]
  );

  const recentIssues = useMemo(
    () =>
      [...scopedIssues]
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
        .slice(0, 5),
    [scopedIssues]
  );

  const dataLoading = isLoading || branchesLoading || usersLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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

      {dataLoading ? (
        <p className="text-gray-400">جاري تحميل البيانات...</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <TrendBadge change={weeklyComparison.change} label="عن الأسبوع الماضي" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">إجمالي المشاكل ({weeklyComparison.thisWeek} هذا الأسبوع)</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <TrendBadge change={monthlyComparison.change} label="عن الشهر الماضي" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.resolved}</p>
              <p className="text-sm text-gray-500 mt-1">مشاكل تم حلها</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.open + stats.inProgress}</p>
              <p className="text-sm text-gray-500 mt-1">مشاكل مفتوحة / قيد المعالجة</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.complianceRate}%</p>
              <p className="text-sm text-gray-500 mt-1">نسبة المطابقة</p>
            </div>
          </div>

          {stats.critical > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">تنبيه: {stats.critical} مشكلة حرجة تحتاج اهتمام فوري</p>
                <p className="text-sm text-red-600">يجب التعامل مع هذه المشاكل في أقرب وقت ممكن</p>
              </div>
            </div>
          )}

           <Suspense fallback={<DashboardChartsSkeleton />}>
            <DashboardCharts
              hasData={stats.total > 0}
              trendData={trendData}
              complianceData={complianceData}
              branchData={branchData}
              categoryData={categoryData}
            />
          </Suspense> 


                {/* <DashboardCharts
            hasData={stats.total > 0}
           trendData={trendData}
          complianceData={complianceData}
          branchData={branchData}
          categoryData={categoryData}
                /> */}

          {/* Recent Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">آخر المشاكل المبلغ عنها</h3>
            </div>
            {recentIssues.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">لا توجد مشاكل مسجلة حتى الآن</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
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
                    {recentIssues.map((issue) => {
                      const CatIcon = CATEGORY_ICONS[issue.category];
                      return (
                        <tr key={issue.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CatIcon className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                                <p className="text-xs text-gray-500">بواسطة: {userName(issue.reportedBy)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{branchName(issue.branchId)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{CATEGORY_LABELS[issue.category]}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${PRIORITY_COLORS[issue.priority]}`}>
                              {PRIORITY_LABELS[issue.priority]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[issue.status]}`}>
                              {STATUS_LABELS[issue.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${COMPLIANCE_COLORS[issue.complianceStatus]}`}>
                              {COMPLIANCE_LABELS[issue.complianceStatus]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {new Date(issue.reportedAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

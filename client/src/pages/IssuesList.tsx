import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Filter, CheckCircle, Edit3, Trash2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useBranches } from '../hooks/useBranches';
import { useUsers } from '../hooks/useUsers';
import { Issue, IssueStatus } from '../types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_OPTIONS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  CATEGORY_ICONS,
  CATEGORY_OPTIONS,
  COMPLIANCE_LABELS,
  COMPLIANCE_COLORS,
} from '../utils/labels';

interface IssuesListProps {
  showAll?: boolean;
}

const isOpenIssue = (issue: Issue) => issue.status !== 'resolved' && issue.status !== 'closed';

const IssuesList: React.FC<IssuesListProps> = ({ showAll = false }) => {
  const { currentUser } = useAuth();
  const { issues, isLoading, updateIssue, deleteIssue } = useData();
  const { branches, branchName } = useBranches();
  const { userName } = useUsers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const canManageAllIssues = currentUser?.role === 'admin' || currentUser?.role === 'quality_manager';

  const filteredIssues = useMemo(() => {
    let result = showAll ? issues : issues.filter((i) => i.reportedBy === currentUser?.id);

    const query = search.trim();
    if (query) {
      result = result.filter(
        (i) => i.title.includes(query) || i.description.includes(query)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category === categoryFilter);
    }
    if (showAll && branchFilter !== 'all') {
      result = result.filter((i) => i.branchId === branchFilter);
    }

    return [...result].sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
  }, [issues, search, statusFilter, categoryFilter, branchFilter, showAll, currentUser]);

  const resolvingIssue = issues.find((i) => i.id === resolvingIssueId);

  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    setPendingAction(issueId);
    try {
      await updateIssue(issueId, { status });
      toast.success('تم تحديث الحالة');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل تحديث الحالة');
    } finally {
      setPendingAction(null);
    }
  };

  const handleResolve = async () => {
    if (!resolvingIssueId) return;
    setPendingAction(resolvingIssueId);
    try {
      await updateIssue(resolvingIssueId, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      toast.success('تم تسجيل الحل');
      setResolvingIssueId(null);
      setResolutionNotes('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل تسجيل الحل');
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (issueId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المشكلة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    setPendingAction(issueId);
    try {
      await deleteIssue(issueId);
      toast.success('تم حذف المشكلة');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حذف المشكلة');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{showAll ? 'جميع المشاكل' : 'مشاكلي'}</h1>
        <p className="text-gray-500 mt-1">
          {showAll ? 'عرض وإدارة جميع مشاكل الجودة' : 'المشاكل التي قمت بتسجيلها'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="بحث في المشاكل..."
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الحالات</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الفئات</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {showAll && (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل الفروع</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Issues List */}
      {isLoading ? (
        <p className="text-gray-400 text-center py-12">جاري تحميل المشاكل...</p>
      ) : (
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد مشاكل</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const CategoryIcon = CATEGORY_ICONS[issue.category];
              const isPending = pendingAction === issue.id;

              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-800">{issue.title}</h3>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[issue.priority]}`}
                          >
                            {PRIORITY_LABELS[issue.priority]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap text-xs text-gray-400">
                          <span>{branchName(issue.branchId)}</span>
                          <span>•</span>
                          <span>{userName(issue.reportedBy)}</span>
                          <span>•</span>
                          <span>{new Date(issue.reportedAt).toLocaleDateString('ar-EG')}</span>
                          <span
                            className={`font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[issue.status]}`}
                          >
                            {STATUS_LABELS[issue.status]}
                          </span>
                          <span
                            className={`font-medium px-2 py-0.5 rounded-full ${COMPLIANCE_COLORS[issue.complianceStatus]}`}
                          >
                            {COMPLIANCE_LABELS[issue.complianceStatus]}
                          </span>
                          {issue.images.length > 0 && <span>📷 {issue.images.length}</span>}
                        </div>
                        {issue.resolutionNotes && (
                          <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-3">
                            <span className="font-medium">ملاحظات الحل: </span>
                            {issue.resolutionNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isOpenIssue(issue) && (
                        <>
                          <button
                            onClick={() => {
                              setResolvingIssueId(issue.id);
                              setResolutionNotes('');
                            }}
                            disabled={isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-40"
                            title="تسجيل حل"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          {showAll && issue.status === 'open' && (
                            <button
                              onClick={() => handleStatusChange(issue.id, 'in_progress')}
                              disabled={isPending}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition disabled:opacity-40"
                              title="قيد المعالجة"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                      {showAll && canManageAllIssues && (
                        <button
                          onClick={() => handleDelete(issue.id)}
                          disabled={isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {resolvingIssueId && resolvingIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">تسجيل حل المشكلة</h3>
              <button
                onClick={() => setResolvingIssueId(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{resolvingIssue.title}</p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب ملاحظات الحل..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setResolvingIssueId(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleResolve}
                disabled={pendingAction === resolvingIssueId}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {pendingAction === resolvingIssueId ? 'جاري الحفظ...' : 'تسجيل الحل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesList;

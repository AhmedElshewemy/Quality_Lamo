import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { branches } from '../data/branches';
import { users } from '../data/users';
import { IssueCategory, IssuePriority, ComplianceStatus, IssueStatus } from '../types';
import {
  Search,
  Filter,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Thermometer,
  Bug,
  Droplets,
  Trash2,
  FileWarning,
  Wrench,
  Users,
  Package,
  Shield,
  X,
} from 'lucide-react';

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

const priorityLabels: Record<IssuePriority, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  critical: 'حرج',
};

const priorityColors: Record<IssuePriority, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusLabels: Record<IssueStatus, string> = {
  open: 'مفتوح',
  in_progress: 'قيد المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلق',
};

const statusColors: Record<IssueStatus, string> = {
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

interface IssuesListProps {
  showAll?: boolean;
}

const IssuesList: React.FC<IssuesListProps> = ({ showAll = false }) => {
  const { currentUser } = useAuth();
  const { issues, updateIssue } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredIssues = useMemo(() => {
    let result = showAll ? issues : issues.filter(i => i.reportedBy === currentUser?.id);
    
    if (search) {
      result = result.filter(i =>
        i.title.includes(search) || i.description.includes(search)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(i => i.category === categoryFilter);
    }
    if (branchFilter !== 'all') {
      result = result.filter(i => i.branchId === branchFilter);
    }
    
    return result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }, [issues, search, statusFilter, categoryFilter, branchFilter, showAll, currentUser]);

  const handleResolve = (issueId: string) => {
    updateIssue(issueId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNotes,
    });
    setSelectedIssue(null);
    setResolutionNotes('');
  };

  const handleStatusChange = (issueId: string, status: IssueStatus) => {
    updateIssue(issueId, { status });
  };

  const selectedIssueData = issues.find(i => i.id === selectedIssue);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {showAll ? 'جميع المشاكل' : 'مشاكلي'}
        </h1>
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
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الحالات</option>
              <option value="open">مفتوح</option>
              <option value="in_progress">قيد المعالجة</option>
              <option value="resolved">تم الحل</option>
              <option value="closed">مغلق</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الفئات</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {showAll && (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل الفروع</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد مشاكل</p>
          </div>
        ) : (
          filteredIssues.map(issue => {
            const branch = branches.find(b => b.id === issue.branchId);
            const reporter = users.find(u => u.id === issue.reportedBy);
            const CatIcon = categoryIcons[issue.category];
            
            return (
              <div key={issue.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CatIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-800">{issue.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[issue.priority]}`}>
                          {priorityLabels[issue.priority]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{issue.description}</p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="text-xs text-gray-400">{branch?.name}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{reporter?.name}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{new Date(issue.reportedAt).toLocaleDateString('ar-EG')}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[issue.status]}`}>
                          {statusLabels[issue.status]}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${complianceColors[issue.complianceStatus]}`}>
                          {complianceLabels[issue.complianceStatus]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-4">
                    {issue.status !== 'resolved' && issue.status !== 'closed' && (
                      <>
                        <button
                          onClick={() => setSelectedIssue(issue.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="تسجيل حل"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        {(showAll) && (
                          <button
                            onClick={() => handleStatusChange(issue.id, 'in_progress')}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title="قيد المعالجة"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                    {issue.images.length > 0 && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        📷 {issue.images.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Modal */}
      {selectedIssue && selectedIssueData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">تسجيل حل المشكلة</h3>
              <button onClick={() => setSelectedIssue(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{selectedIssueData.title}</p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب ملاحظات الحل..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleResolve(selectedIssue)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                تسجيل الحل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesList;

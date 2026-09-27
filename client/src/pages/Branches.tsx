import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useBranches } from '../hooks/useBranches';
import { Branch, Issue } from '../types';
import { BRANCH_TYPE_LABELS, BRANCH_TYPE_ICONS, BRANCH_TYPE_GRADIENTS } from '../utils/labels';

const complianceColor = (rate: number) =>
  rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-600';

const complianceBarColor = (rate: number) =>
  rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500';

const BranchCard: React.FC<{ branch: Branch; issues: Issue[] }> = ({ branch, issues }) => {
  const branchIssues = issues.filter((i) => i.branchId === branch.id);
  const openIssues = branchIssues.filter((i) => i.status === 'open' || i.status === 'in_progress').length;
  const resolvedIssues = branchIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const complianceRate =
    branchIssues.length > 0
      ? Math.round(
          (branchIssues.filter((i) => i.complianceStatus === 'compliant').length / branchIssues.length) * 100
        )
      : 100;
  const Icon = BRANCH_TYPE_ICONS[branch.type];
  const gradient = BRANCH_TYPE_GRADIENTS[branch.type];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 truncate">{branch.name}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {BRANCH_TYPE_LABELS[branch.type]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{branch.location}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-800">{branchIssues.length}</p>
            <p className="text-xs text-gray-500">مشاكل</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{resolvedIssues}</p>
            <p className="text-xs text-gray-500">تم الحل</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <p className="text-lg font-bold text-yellow-600">{openIssues}</p>
            <p className="text-xs text-gray-500">مفتوح</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">نسبة المطابقة</span>
            <span className={`text-sm font-bold ${complianceColor(complianceRate)}`}>{complianceRate}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${complianceBarColor(complianceRate)}`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Branches: React.FC = () => {
  const { issues } = useData();
  const { branches, isLoading, error } = useBranches();

  const countByType = (type: Branch['type']) => branches.filter((b) => b.type === type).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">الفروع والمواقع</h1>
        <p className="text-gray-500 mt-1">نظرة عامة على جميع فروع ومواقع المطعم</p>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-center py-12">جاري تحميل الفروع...</p>
      ) : error ? (
        <p className="text-red-500 text-center py-12">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} issues={issues} />
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ملخص الحالة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{branches.length}</p>
                <p className="text-sm text-gray-600">إجمالي المواقع</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{countByType('branch')}</p>
                <p className="text-sm text-gray-600">فروع</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{countByType('central_kitchen_warehouse')}</p>
                <p className="text-sm text-gray-600">مطبخ مركزي ومخزن</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Branches;

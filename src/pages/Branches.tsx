import React from 'react';
import { branches } from '../data/branches';
import { useData } from '../contexts/DataContext';
import { Building2, MapPin, Package, Utensils, ShieldCheck, AlertTriangle } from 'lucide-react';

const typeIcons = {
  branch: Building2,
  headquarters: ShieldCheck,
  central_kitchen: Utensils,
  main_warehouse: Package,
};

const typeLabels = {
  branch: 'فرع',
  headquarters: 'إدارة رئيسية',
  central_kitchen: 'مطبخ مركزي',
  main_warehouse: 'مخزن رئيسي',
};

const typeColors = {
  branch: 'from-blue-500 to-blue-600',
  headquarters: 'from-purple-500 to-purple-600',
  central_kitchen: 'from-orange-500 to-orange-600',
  main_warehouse: 'from-green-500 to-green-600',
};

const Branches: React.FC = () => {
  const { issues } = useData();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">الفروع والمواقع</h1>
        <p className="text-gray-500 mt-1">نظرة عامة على جميع فروع ومواقع المطعم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => {
          const branchIssues = issues.filter(i => i.branchId === branch.id);
          const openIssues = branchIssues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
          const resolvedIssues = branchIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
          const complianceRate = branchIssues.length > 0
            ? Math.round((branchIssues.filter(i => i.complianceStatus === 'compliant').length / branchIssues.length) * 100)
            : 100;
          const Icon = typeIcons[branch.type];

          return (
            <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className={`h-2 bg-gradient-to-r ${typeColors[branch.type]}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[branch.type]} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{branch.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {typeLabels[branch.type]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  {branch.location}
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
                    <span className={`text-sm font-bold ${
                      complianceRate >= 80 ? 'text-green-600' :
                      complianceRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{complianceRate}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        complianceRate >= 80 ? 'bg-green-500' :
                        complianceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${complianceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          ملخص الحالة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{branches.length}</p>
            <p className="text-sm text-gray-600">إجمالي المواقع</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{branches.filter(b => b.type === 'branch').length}</p>
            <p className="text-sm text-gray-600">فروع</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{branches.filter(b => b.type === 'central_kitchen').length}</p>
            <p className="text-sm text-gray-600">مطابخ مركزية</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{branches.filter(b => b.type === 'main_warehouse').length}</p>
            <p className="text-sm text-gray-600">مخازن</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branches;

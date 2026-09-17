import React from 'react';
import { users } from '../data/users';
import { branches } from '../data/branches';
import { useData } from '../contexts/DataContext';
import { Users, Mail, Building2, CheckCircle, AlertTriangle } from 'lucide-react';

const Staff: React.FC = () => {
  const { issues } = useData();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">فريق الجودة</h1>
        <p className="text-gray-500 mt-1">مهندسو الجودة ومديرو النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => {
          const userIssues = issues.filter(i => i.reportedBy === user.id);
          const resolvedIssues = userIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
          const openIssues = userIssues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
          const branch = branches.find(b => b.id === user.branch);

          return (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  user.role === 'quality_manager' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  user.role === 'admin' ? 'bg-gradient-to-br from-gray-600 to-gray-700' :
                  'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}>
                  <span className="text-xl font-bold text-white">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{user.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    user.role === 'quality_manager' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'admin' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'quality_manager' ? 'مدير الجودة' :
                     user.role === 'admin' ? 'مدير النظام' : 'مهندس جودة'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {branch && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="w-4 h-4" />
                    {branch.name}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">{userIssues.length}</p>
                  <p className="text-xs text-gray-500">إجمالي</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{resolvedIssues}</p>
                  <p className="text-xs text-gray-500">تم الحل</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-600">{openIssues}</p>
                  <p className="text-xs text-gray-500">مفتوح</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Summary */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          ملخص الفريق
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'quality_engineer').length}</p>
            <p className="text-sm text-gray-600">مهندسو جودة</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'quality_manager').length}</p>
            <p className="text-sm text-gray-600">مديرو جودة</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {issues.filter(i => i.status === 'resolved' || i.status === 'closed').length}
            </p>
            <p className="text-sm text-gray-600">مشاكل تم حلها</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {issues.filter(i => i.status === 'open' || i.status === 'in_progress').length}
            </p>
            <p className="text-sm text-gray-600">مشاكل مفتوحة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;

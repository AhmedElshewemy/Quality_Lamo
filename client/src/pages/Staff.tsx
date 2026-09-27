import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Building2, Users as UsersIcon, UserPlus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUsers } from '../hooks/useUsers';
import { useBranches } from '../hooks/useBranches';
import { apiClient } from '../services/apiClient';
import { UserRole } from '../types';
import { ROLE_LABELS, ROLE_BADGE_COLORS, ROLE_AVATAR_GRADIENTS } from '../utils/labels';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'quality_engineer', label: ROLE_LABELS.quality_engineer },
  { value: 'quality_manager', label: ROLE_LABELS.quality_manager },
  { value: 'admin', label: ROLE_LABELS.admin },
];

type AddUserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId: string;
};

const emptyForm: AddUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'quality_engineer',
  branchId: '',
};

const Staff: React.FC = () => {
  const { currentUser } = useAuth();
  const { issues } = useData();
  const { users, isLoading, error, refetch } = useUsers();
  const { branches, branchName } = useBranches();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<AddUserForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const engineerCount = users.filter((u) => u.role === 'quality_engineer').length;
  const managerCount = users.filter((u) => u.role === 'quality_manager').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const openCount = issues.filter((i) => i.status === 'open' || i.status === 'in_progress').length;

  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.password.length >= 8 &&
    (form.role !== 'quality_engineer' || form.branchId);

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        branchId: form.role === 'quality_engineer' ? form.branchId : undefined,
      });
      toast.success('تم إضافة المستخدم بنجاح');
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل إضافة المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">فريق الجودة</h1>
          <p className="text-gray-500 mt-1">مهندسو الجودة ومديرو النظام</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">إضافة مستخدم</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-center py-12">جاري تحميل الفريق...</p>
      ) : error ? (
        <p className="text-red-500 text-center py-12">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => {
              const userIssues = issues.filter((i) => i.reportedBy === user.id);
              const resolvedIssues = userIssues.filter(
                (i) => i.status === 'resolved' || i.status === 'closed'
              ).length;
              const openIssues = userIssues.filter(
                (i) => i.status === 'open' || i.status === 'in_progress'
              ).length;

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${ROLE_AVATAR_GRADIENTS[user.role]}`}
                    >
                      <span className="text-xl font-bold text-white">{user.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{user.name}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE_COLORS[user.role]}`}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.branch && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{branchName(user.branch)}</span>
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

          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-blue-500" />
              ملخص الفريق
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{engineerCount}</p>
                <p className="text-sm text-gray-600">مهندسو جودة</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{managerCount}</p>
                <p className="text-sm text-gray-600">مديرو جودة</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                <p className="text-sm text-gray-600">مشاكل تم حلها</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{openCount}</p>
                <p className="text-sm text-gray-600">مشاكل مفتوحة</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">إضافة مستخدم جديد</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8 حروف على الأقل"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدور *</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, role: e.target.value as UserRole, branchId: '' }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.role === 'quality_engineer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفرع *</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm((prev) => ({ ...prev, branchId: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

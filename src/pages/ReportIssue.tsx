import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { branches } from '../data/branches';
import { Issue, IssueCategory, IssuePriority, ComplianceStatus } from '../types';
import {
  Camera,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  Image as ImageIcon,
} from 'lucide-react';

const categoryOptions: { value: IssueCategory; label: string }[] = [
  { value: 'food_safety', label: 'سلامة الغذاء' },
  { value: 'hygiene', label: 'النظافة والتعقيم' },
  { value: 'equipment', label: 'المعدات والصيانة' },
  { value: 'storage', label: 'التخزين' },
  { value: 'staff', label: 'الموظفين والتدريب' },
  { value: 'documentation', label: 'المستندات والسجلات' },
  { value: 'temperature', label: 'درجة الحرارة' },
  { value: 'pest_control', label: 'مكافحة الآفات' },
  { value: 'water_quality', label: 'جودة المياه' },
  { value: 'waste_management', label: 'إدارة النفايات' },
];

const priorityOptions: { value: IssuePriority; label: string; color: string }[] = [
  { value: 'low', label: 'منخفض', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'medium', label: 'متوسط', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
  { value: 'high', label: 'عالي', color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 'critical', label: 'حرج', color: 'border-red-300 bg-red-50 text-red-700' },
];

const complianceOptions: { value: ComplianceStatus; label: string; color: string }[] = [
  { value: 'compliant', label: '✅ مطابق', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'partially_compliant', label: '⚠️ مطابق جزئياً', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
  { value: 'non_compliant', label: '❌ غير مطابق', color: 'border-red-300 bg-red-50 text-red-700' },
];

const ReportIssue: React.FC = () => {
  const { currentUser } = useAuth();
  const { addIssue } = useData();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    branchId: currentUser?.branch || '',
    category: '' as IssueCategory | '',
    priority: '' as IssuePriority | '',
    complianceStatus: '' as ComplianceStatus | '',
    images: [] as string[],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.branchId || !formData.category || !formData.priority || !formData.complianceStatus) {
      return;
    }

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      branchId: formData.branchId,
      category: formData.category as IssueCategory,
      priority: formData.priority as IssuePriority,
      status: 'open',
      complianceStatus: formData.complianceStatus as ComplianceStatus,
      images: formData.images,
      reportedBy: currentUser?.id || '',
      reportedAt: new Date().toISOString(),
    };

    addIssue(newIssue);
    setSuccess(true);
    setFormData({
      title: '',
      description: '',
      branchId: currentUser?.branch || '',
      category: '',
      priority: '',
      complianceStatus: '',
      images: [],
    });

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تقرير مشكلة جودة</h1>
        <p className="text-gray-500 mt-1">قم بتسجيل مشكلة جودة جديدة مع التفاصيل والصور</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium text-green-800">تم تسجيل المشكلة بنجاح!</p>
            <p className="text-sm text-green-600">سيتم مراجعتها من قبل مدير الجودة</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            المعلومات الأساسية
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المشكلة *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اكتب عنوان وصفي للمشكلة"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفرع / الموقع *</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر الفرع</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as IssueCategory }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر الفئة</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف المشكلة *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                placeholder="اكتب وصفاً تفصيلياً للمشكلة..."
                required
              />
            </div>
          </div>
        </div>

        {/* Priority & Compliance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">التقييم والأولوية</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">درجة الأولوية *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: opt.value }))}
                    className={`p-3 rounded-lg border-2 text-center font-medium text-sm transition-all ${
                      formData.priority === opt.value
                        ? `${opt.color} border-2 ring-2 ring-offset-1 ring-current`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حالة المطابقة *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {complianceOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, complianceStatus: opt.value }))}
                    className={`p-4 rounded-lg border-2 text-center font-medium transition-all ${
                      formData.complianceStatus === opt.value
                        ? `${opt.color} border-2 ring-2 ring-offset-1 ring-current`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            الصور
          </h3>

          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">اضغط لرفع الصور</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG حتى 5MB</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      <ImageIcon className="w-3 h-3 inline" /> {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setFormData({
              title: '',
              description: '',
              branchId: currentUser?.branch || '',
              category: '',
              priority: '',
              complianceStatus: '',
              images: [],
            })}
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
          >
            مسح البيانات
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
          >
            تسجيل المشكلة
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;

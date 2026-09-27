import React from 'react';

const ChartCardSkeleton: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
    <div className="h-[250px] rounded-lg bg-gray-100 animate-pulse" />
  </div>
);

const DashboardChartsSkeleton: React.FC = () => (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCardSkeleton title="اتجاه المشاكل - آخر 6 أشهر" />
      <ChartCardSkeleton title="حالة المطابقة" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCardSkeleton title="أداء الفروع" />
      <ChartCardSkeleton title="توزيع المشاكل حسب الفئة" />
    </div>
  </>
);

export default DashboardChartsSkeleton;

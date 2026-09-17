import { Branch } from '../types';

export const branches: Branch[] = [
  {
    id: 'branch-1',
    name: 'فرع المعادي',
    location: 'المعادي، القاهرة',
    type: 'branch',
  },
  {
    id: 'branch-2',
    name: 'فرع مدينة نصر',
    location: 'مدينة نصر، القاهرة',
    type: 'branch',
  },
  {
    id: 'branch-3',
    name: 'فرع التجمع الخامس',
    location: 'التجمع الخامس، القاهرة الجديدة',
    type: 'branch',
  },
  {
    id: 'headquarters',
    name: 'الإدارة الرئيسية',
    location: 'المهندسين، الجيزة',
    type: 'headquarters',
  },
  {
    id: 'central-kitchen',
    name: 'المطبخ المركزي',
    location: 'العاشر من رمضان',
    type: 'central_kitchen',
  },
  {
    id: 'main-warehouse',
    name: 'المخزن الرئيسي',
    location: 'العبور، القاهرة',
    type: 'main_warehouse',
  },
];

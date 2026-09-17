import { User } from '../types';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'أحمد محمد',
    email: 'ahmed@seafood.com',
    role: 'quality_engineer',
    branch: 'branch-1',
  },
  {
    id: 'user-2',
    name: 'محمود علي',
    email: 'mahmoud@seafood.com',
    role: 'quality_engineer',
    branch: 'branch-2',
  },
  {
    id: 'user-3',
    name: 'خالد حسن',
    email: 'khaled@seafood.com',
    role: 'quality_engineer',
    branch: 'branch-3',
  },
  {
    id: 'manager-1',
    name: 'د. سارة أحمد',
    email: 'sara@seafood.com',
    role: 'quality_manager',
  },
  {
    id: 'admin-1',
    name: 'مدير النظام',
    email: 'admin@seafood.com',
    role: 'admin',
  },
];

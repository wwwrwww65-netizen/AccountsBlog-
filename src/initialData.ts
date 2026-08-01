/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Account, Transaction } from './types';

export const initialAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'أحمد محمد',
    phone: '0501234567',
    createdAt: '2026-07-08T10:30:00Z',
    currency: 'SAR',
  },
  {
    id: 'acc-2',
    name: 'خالد عبدالله',
    phone: '0559876543',
    createdAt: '2026-07-07T20:15:00Z',
    currency: 'YER',
  },
  {
    id: 'acc-3',
    name: 'مؤسسة الوفاء',
    phone: '0543332221',
    createdAt: '2026-07-03T12:00:00Z',
    currency: 'USD',
  },
  {
    id: 'acc-4',
    name: 'سوبرماركت النجمة',
    phone: '0567778889',
    createdAt: '2026-07-01T15:45:00Z',
    currency: 'SAR',
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    type: 'debt', // لك (دين)
    amount: 1500,
    date: '2026-07-08',
    notes: 'بضائع مباعة ومستحقة الدفع خلال أسبوعين',
    category: 'عمل',
  },
  {
    id: 'tx-2',
    accountId: 'acc-2',
    type: 'obligation', // عليك (التزام)
    amount: 800,
    date: '2026-07-07',
    notes: 'سلفة شخصية طارئة',
    category: 'شخصي',
  },
  {
    id: 'tx-3',
    accountId: 'acc-3',
    type: 'debt', // لك (دين)
    amount: 3500,
    date: '2026-07-03',
    notes: 'دفعة صيانة متبقية',
    category: 'عمل',
  },
  {
    id: 'tx-4',
    accountId: 'acc-4',
    type: 'obligation', // عليك (التزام)
    amount: 1200,
    date: '2026-07-01',
    notes: 'مشتريات مستلزمات المكتب الشهرية',
    category: 'مشتريات',
  },
];

export const CATEGORIES = [
  { id: 'شخصي', label: 'شخصي', iconName: 'User', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'عمل', label: 'عمل تجاري', iconName: 'Briefcase', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'قرض', label: 'قرض/سلفة', iconName: 'HandCoins', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'مشتريات', label: 'مشتريات', iconName: 'ShoppingCart', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'أخرى', label: 'أخرى', iconName: 'LayoutGrid', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export const initialDailyExpenses = [
  { id: 'exp-1', amount: 150, date: '2026-07-08', category: 'طعام', notes: 'غداء عمل مع الفريق' },
  { id: 'exp-2', amount: 45, date: '2026-07-08', category: 'نقل', notes: 'تعبئة وقود السيارة' },
  { id: 'exp-3', amount: 350, date: '2026-07-07', category: 'ترفيه', notes: 'مشتريات ألعاب للأولاد' },
  { id: 'exp-4', amount: 120, date: '2026-07-06', category: 'صحة', notes: 'أدوية وفيتامينات من الصيدلية' },
  { id: 'exp-5', amount: 95, date: '2026-07-05', category: 'طعام', notes: 'عشاء عائلي' }
];

export const initialEmployees = [
  { id: 'emp-1', name: 'محمد علي النجار', role: 'محاسب مالي', phone: '0511112222', salaryRate: 4500, hiredAt: '2026-01-15' },
  { id: 'emp-2', name: 'سعيد فرج الدوسري', role: 'مسؤول المشتريات والخدمات', phone: '0522223333', salaryRate: 3800, hiredAt: '2026-03-01' },
  { id: 'emp-3', name: 'جهاد سليم الأحمد', role: 'سائق ومندوب توصيل', phone: '0533334444', salaryRate: 3200, hiredAt: '2026-04-10' }
];

export const initialEmployeeTransactions = [
  { id: 'etx-1', employeeId: 'emp-1', type: 'salary_pay', amount: 4500, date: '2026-06-30', notes: 'راتب شهر يونيو كاملاً' },
  { id: 'etx-2', employeeId: 'emp-2', type: 'advance_pay', amount: 500, date: '2026-07-05', notes: 'سلفة طارئة للظروف العائلية' },
  { id: 'etx-3', employeeId: 'emp-3', type: 'salary_pay', amount: 3200, date: '2026-06-30', notes: 'راتب شهر يونيو كاملاً' },
  { id: 'etx-4', employeeId: 'emp-1', type: 'bonus_pay', amount: 300, date: '2026-07-02', notes: 'مكافأة على الجهد الإضافي لتدقيق الحسابات' }
];

export const initialHomeNeeds = [
  { id: 'hn-1', name: 'شراء كرتون حليب وأجبان للفطور', expectedPrice: 65, isPurchased: true, category: 'بقالة', addedAt: '2026-07-08' },
  { id: 'hn-2', name: 'إصلاح تسريب مياه مغسلة المطبخ', expectedPrice: 150, isPurchased: false, category: 'صيانة', addedAt: '2026-07-07' },
  { id: 'hn-3', name: 'شراء ستائر لغرفة الجلوس', expectedPrice: 400, isPurchased: false, category: 'أثاث', addedAt: '2026-07-05' },
  { id: 'hn-4', name: 'سداد فاتورة الكهرباء والإنترنت', expectedPrice: 320, isPurchased: true, category: 'فواتير', addedAt: '2026-07-02' }
];


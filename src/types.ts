/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'debt' | 'obligation'; // debt is "لك" (receivable), obligation is "عليك" (payable)

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  category: string; // 'شخصي' | 'عمل' | 'قرض' | 'مشتريات' | 'أخرى'
}

export interface Account {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
  currency?: 'USD' | 'YER' | 'SAR';
}

export interface CategoryOption {
  id: string;
  label: string;
  iconName: string;
  color: string;
}

// --- Daily Expenses types ---
export interface DailyExpense {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string; // 'طعام' | 'سكن' | 'نقل' | 'ترفيه' | 'صحة' | 'أخرى'
  notes?: string;
}

// --- Employee Ledger types ---
export interface Employee {
  id: string;
  name: string;
  role: string;
  phone?: string;
  salaryRate: number; // Monthly base salary
  hiredAt: string; // YYYY-MM-DD
}

export interface EmployeeTransaction {
  id: string;
  employeeId: string;
  type: 'salary_pay' | 'advance_pay' | 'bonus_pay'; // راتب، سلفة، مكافأة
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

// --- Home Essentials types ---
export interface HomeNeed {
  id: string;
  name: string;
  expectedPrice?: number;
  isPurchased: boolean;
  category: string; // 'بقالة' | 'صيانة' | 'أثاث' | 'فواتير' | 'أخرى'
  addedAt: string;
}


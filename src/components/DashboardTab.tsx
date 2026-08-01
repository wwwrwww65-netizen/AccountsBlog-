/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, Tag, Users, Home, ArrowUpRight, ArrowDownLeft, 
  TrendingUp, Coins, Calendar, ChevronLeft, Package, 
  ListChecks, Briefcase, FileText, CheckCircle2, ShoppingCart, 
  Sparkles, TrendingDown, Clock
} from 'lucide-react';
import { Account, Transaction, DailyExpense, Employee, EmployeeTransaction, HomeNeed } from '../types';

interface DashboardTabProps {
  accounts: Account[];
  transactions: Transaction[];
  dailyExpenses: DailyExpense[];
  employees: Employee[];
  employeeTransactions: EmployeeTransaction[];
  homeNeeds: HomeNeed[];
  onTabChange: (tab: 'debts' | 'expenses' | 'employees' | 'home' | 'reports') => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// Map currencies to Arabic display labels
const CURRENCY_LABELS = {
  SAR: { label: 'ريال سعودي', code: 'ر.س', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  YER: { label: 'ريال يمني', code: 'ر.ي', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  USD: { label: 'دولار أمريكي', code: '$', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' }
};

export default function DashboardTab({
  accounts,
  transactions,
  dailyExpenses,
  employees,
  employeeTransactions,
  homeNeeds,
  onTabChange,
  showToast
}: DashboardTabProps) {

  // --- 1. Debts & Obligations Calculations by Currency ---
  const getCurrencyBalances = (currency: 'SAR' | 'YER' | 'USD') => {
    let totalDebts = 0;       // لك
    let totalObligations = 0; // عليك
    let accountsCount = 0;

    accounts.forEach(acc => {
      const accCurrency = acc.currency || 'SAR';
      if (accCurrency !== currency) return;

      accountsCount++;
      const accTxs = transactions.filter(t => t.accountId === acc.id);
      const give = accTxs.filter(t => t.type === 'debt').reduce((s, t) => s + t.amount, 0);
      const take = accTxs.filter(t => t.type === 'obligation').reduce((s, t) => s + t.amount, 0);
      const net = give - take;

      if (net > 0) {
        totalDebts += net;
      } else if (net < 0) {
        totalObligations += Math.abs(net);
      }
    });

    const netBalance = totalDebts - totalObligations;
    return {
      totalDebts,
      totalObligations,
      netBalance,
      accountsCount
    };
  };

  const sarStats = getCurrencyBalances('SAR');
  const yerStats = getCurrencyBalances('YER');
  const usdStats = getCurrencyBalances('USD');

  // Top active accounts (highest net balances)
  const accountsWithBalances = accounts.map(acc => {
    const accTxs = transactions.filter(t => t.accountId === acc.id);
    const give = accTxs.filter(t => t.type === 'debt').reduce((s, t) => s + t.amount, 0);
    const take = accTxs.filter(t => t.type === 'obligation').reduce((s, t) => s + t.amount, 0);
    const net = give - take;
    return { ...acc, net };
  }).filter(acc => acc.net !== 0);

  // Top Debtors (people who owe me - net > 0)
  const topDebtors = [...accountsWithBalances]
    .filter(a => a.net > 0)
    .sort((a, b) => b.net - a.net)
    .slice(0, 3);

  // Top Creditors (people I owe - net < 0)
  const topCreditors = [...accountsWithBalances]
    .filter(a => a.net < 0)
    .sort((a, b) => b.net - a.net) // sorted by magnitude
    .slice(0, 3);


  // --- 2. Daily Expenses Calculations ---
  const totalDailyExpenses = dailyExpenses.reduce((s, e) => s + e.amount, 0);
  
  // Expenses category breakdown
  const expenseCategoriesCount = dailyExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expenseCategoriesCount)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalDailyExpenses > 0 ? (amount / totalDailyExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  const recentExpenses = [...dailyExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);


  // --- 3. Employees Management Calculations ---
  const totalEmployeesCount = employees.length;
  const totalSalaryRates = employees.reduce((s, emp) => s + emp.salaryRate, 0);
  
  // Total paid to employees (sum of employeeTransactions)
  const totalPaidToEmployees = employeeTransactions.reduce((s, t) => s + t.amount, 0);
  const salaryPaid = employeeTransactions.filter(t => t.type === 'salary_pay').reduce((s, t) => s + t.amount, 0);
  const advancesPaid = employeeTransactions.filter(t => t.type === 'advance_pay').reduce((s, t) => s + t.amount, 0);
  const bonusesPaid = employeeTransactions.filter(t => t.type === 'bonus_pay').reduce((s, t) => s + t.amount, 0);


  // --- 4. Home Essentials Calculations ---
  const totalNeedsCount = homeNeeds.length;
  const purchasedNeedsCount = homeNeeds.filter(n => n.isPurchased).length;
  const remainingNeedsCount = totalNeedsCount - purchasedNeedsCount;
  
  const totalExpectedPrice = homeNeeds.reduce((s, n) => s + (n.expectedPrice || 0), 0);
  const remainingExpectedPrice = homeNeeds.filter(n => !n.isPurchased).reduce((s, n) => s + (n.expectedPrice || 0), 0);
  const purchasedPercentage = totalNeedsCount > 0 ? (purchasedNeedsCount / totalNeedsCount) * 100 : 0;

  const urgentHomeNeeds = homeNeeds.filter(n => !n.isPurchased).slice(0, 4);


  // --- Render Functions ---
  const renderCurrencyCard = (currency: 'SAR' | 'YER' | 'USD', stats: ReturnType<typeof getCurrencyBalances>) => {
    const label = CURRENCY_LABELS[currency];
    const isNetPositive = stats.netBalance >= 0;

    return (
      <div id={`currency-card-${currency}`} className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-4 flex flex-col justify-between hover:border-slate-600 transition-all shadow-md">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${label.color}`}>
              {label.code}
            </span>
            <span className="text-xs font-bold text-slate-100">{label.label}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {stats.accountsCount} حسابات نشطة
          </span>
        </div>

        <div className="space-y-3">
          {/* Debts: لك */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>مستحق لك (ديون):</span>
            </div>
            <span className="text-xs font-black text-emerald-400">
              +{stats.totalDebts.toLocaleString('ar-EG')} {label.code}
            </span>
          </div>

          {/* Obligations: عليك */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>مستحق عليك (التزامات):</span>
            </div>
            <span className="text-xs font-black text-orange-400">
              -{stats.totalObligations.toLocaleString('ar-EG')} {label.code}
            </span>
          </div>

          {/* Net */}
          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">صافي المحصلة:</span>
            <div className="text-left">
              <span className={`text-sm font-black ${isNetPositive ? 'text-emerald-400' : 'text-orange-400'}`}>
                {isNetPositive ? '+' : ''}{stats.netBalance.toLocaleString('ar-EG')} {label.code}
              </span>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                {isNetPositive ? 'فائض لصالحك' : 'عجز والتزام عليك'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      dir="rtl"
      id="dashboard-tab-container"
    >
      {/* Welcome Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-[#131d31] to-[#0f172a] border border-slate-800/60 p-5 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
              <h2 className="text-lg font-black text-slate-100">لوحة التحكم والملخص الشامل 📊</h2>
            </div>
            <p className="text-xs text-slate-400 leading-normal max-w-xl">
              مرحباً بك في شاشة المراقبة الموحدة! هنا تجد خلاصة المبالغ الحية الموزعة في الدفتر، المصاريف اليومية، رواتب العمال، ومتطلبات المنزل في مكان واحد وبتحديث فوري.
            </p>
          </div>

          <button
            onClick={() => onTabChange('reports')}
            className="self-start md:self-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FileText size={15} />
            <span>تصدير تقرير PDF شامل 🖨️</span>
          </button>
        </div>
      </section>

      {/* Grid of Multi-Currency Debt Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 flex items-center gap-1.5">
            <Coins size={14} className="text-emerald-400" />
            <span>ملخص أرصدة الديون والالتزامات (حسب العملات)</span>
          </h3>
          <button 
            onClick={() => onTabChange('debts')} 
            className="text-[10px] text-slate-400 hover:text-emerald-400 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>عرض الدفتر بالتفصيل</span>
            <ChevronLeft size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderCurrencyCard('SAR', sarStats)}
          {renderCurrencyCard('YER', yerStats)}
          {renderCurrencyCard('USD', usdStats)}
        </div>
      </section>

      {/* Main Dashboard Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RIGHT COLUMN: Ledger Focus (Outstanding people) */}
        <div className="space-y-5">
          {/* Top Debtors: مستحقات لك */}
          <div className="rounded-2xl bg-[#1e293b]/70 border border-slate-800/40 p-4 space-y-4">
            <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
              <ArrowUpRight size={15} className="text-emerald-400" />
              <span>أكبر الحسابات المستحقة لك (لك ديون عليهم)</span>
            </h4>

            {topDebtors.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-4">لا توجد حسابات مستحقة لك حالياً</p>
            ) : (
              <div className="space-y-2">
                {topDebtors.map(acc => {
                  const label = CURRENCY_LABELS[acc.currency || 'SAR'];
                  return (
                    <div 
                      key={acc.id}
                      onClick={() => onTabChange('debts')}
                      className="p-2.5 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-850 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-200">{acc.name}</span>
                      <span className="text-xs font-black text-emerald-400">
                        +{acc.net.toLocaleString('ar-EG')} {label.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Creditors: التزامات عليك */}
          <div className="rounded-2xl bg-[#1e293b]/70 border border-slate-800/40 p-4 space-y-4">
            <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
              <ArrowDownLeft size={15} className="text-orange-400" />
              <span>أكبر الالتزامات المستحقة عليك (ديون للآخرين)</span>
            </h4>

            {topCreditors.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-4">لا توجد التزامات مالية مستحقة عليك حالياً</p>
            ) : (
              <div className="space-y-2">
                {topCreditors.map(acc => {
                  const label = CURRENCY_LABELS[acc.currency || 'SAR'];
                  return (
                    <div 
                      key={acc.id}
                      onClick={() => onTabChange('debts')}
                      className="p-2.5 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-850 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-200">{acc.name}</span>
                      <span className="text-xs font-black text-orange-400">
                        -{Math.abs(acc.net).toLocaleString('ar-EG')} {label.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Employee Salaries overview */}
          <div className="rounded-2xl bg-[#1e293b] border border-slate-800/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                <Users size={15} className="text-emerald-400" />
                <span>حسابات الموظفين والعمال 👷‍♂️</span>
              </h4>
              <button 
                onClick={() => onTabChange('employees')}
                className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                المزيد
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-right">
                <span className="text-[10px] font-bold text-slate-500 block mb-1">العمال النشطين:</span>
                <span className="text-sm font-black text-slate-200">{totalEmployeesCount} موظفين</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-right">
                <span className="text-[10px] font-bold text-slate-500 block mb-1">إجمالي الرواتب الشهرية:</span>
                <span className="text-sm font-black text-amber-400">{totalSalaryRates.toLocaleString('ar-EG')} ر.س</span>
              </div>
            </div>

            {/* Quick payout list / metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>إجمالي المدفوعات المسجلة:</span>
                <span className="text-slate-200">{totalPaidToEmployees.toLocaleString('ar-EG')} ر.س</span>
              </div>

              {/* Stacked bar of pays */}
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                {totalPaidToEmployees > 0 ? (
                  <>
                    <div 
                      style={{ width: `${(salaryPaid / totalPaidToEmployees) * 100}%` }} 
                      className="bg-emerald-500 h-full" 
                      title="رواتب مستلمة"
                    />
                    <div 
                      style={{ width: `${(advancesPaid / totalPaidToEmployees) * 100}%` }} 
                      className="bg-amber-500 h-full" 
                      title="سلف وقروض"
                    />
                    <div 
                      style={{ width: `${(bonusesPaid / totalPaidToEmployees) * 100}%` }} 
                      className="bg-purple-500 h-full" 
                      title="مكافآت وحوافز"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 flex-wrap text-[9px] font-bold text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>رواتب: {salaryPaid.toLocaleString('ar-EG')} ر.س</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>سلف: {advancesPaid.toLocaleString('ar-EG')} ر.س</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  <span>مكافآت: {bonusesPaid.toLocaleString('ar-EG')} ر.س</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* LEFT COLUMN: Expenses and Home Essentials */}
        <div className="space-y-5">
          
          {/* Daily Expenses Breakdown Widget */}
          <div className="rounded-2xl bg-[#1e293b] border border-slate-800/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                <Tag size={15} className="text-rose-400" />
                <span>صرفياتي اليومية والميزانية 💸</span>
              </h4>
              <button 
                onClick={() => onTabChange('expenses')}
                className="text-[10px] text-rose-400 font-bold hover:underline cursor-pointer"
              >
                إدارة المصاريف
              </button>
            </div>

            {/* Total Spent card */}
            <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">مجموع ما تم إنفاقه:</span>
                <span className="text-base font-black text-rose-400">{totalDailyExpenses.toLocaleString('ar-EG')} ر.س</span>
              </div>
              <TrendingDown size={22} className="text-rose-500/40" />
            </div>

            {/* Category ratios */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 block">توزيع المصروفات حسب التصنيف:</span>
              
              {sortedCategories.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-2">لا توجد مصاريف مدونة لتوزيعها</p>
              ) : (
                <div className="space-y-2">
                  {sortedCategories.slice(0, 3).map(cat => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold">
                        <span className="text-slate-300">{cat.name}</span>
                        <span className="text-slate-400 font-bold">
                          {cat.amount.toLocaleString('ar-EG')} ر.س ({Math.round(cat.percentage)}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-400 rounded-full" 
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent list */}
            <div className="space-y-1.5 border-t border-slate-800/40 pt-3">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">أحدث الحركات اليومية الصادرة:</span>
              {recentExpenses.length === 0 ? (
                <p className="text-[9px] text-slate-500 text-center py-1">لا توجد مصاريف مسجلة</p>
              ) : (
                <div className="space-y-1.5">
                  {recentExpenses.map(e => (
                    <div key={e.id} className="flex justify-between items-center text-[10px] p-1.5 bg-slate-900/20 rounded-lg">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={11} className="text-slate-500" />
                        <span>{e.notes || e.category}</span>
                      </div>
                      <span className="font-bold text-rose-400">{e.amount.toLocaleString('ar-EG')} ر.س</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Home Essentials Widget */}
          <div className="rounded-2xl bg-[#1e293b] border border-slate-800/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                <Home size={15} className="text-indigo-400" />
                <span>مستلزمات ومتطلبات البيت 🏡</span>
              </h4>
              <button 
                onClick={() => onTabChange('home')}
                className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                عرض القائمة الكاملة
              </button>
            </div>

            {/* Progress indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">الاحتياجات المنجزة:</span>
                <span className="text-sm font-black text-emerald-400">{purchasedNeedsCount} من {totalNeedsCount}</span>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full bg-emerald-400" style={{ width: `${purchasedPercentage}%` }} />
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">المبلغ المطلوب للمتبقي:</span>
                <span className="text-sm font-black text-indigo-300">{remainingExpectedPrice.toLocaleString('ar-EG')} ر.س</span>
                <span className="text-[8px] text-slate-500 block mt-0.5">لـ {remainingNeedsCount} أغراض غير مشتراة</span>
              </div>
            </div>

            {/* Quick checklist of outstanding needs */}
            <div className="space-y-1.5 border-t border-slate-800/40 pt-3">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">متطلبات قيد المتابعة حالياً:</span>
              
              {urgentHomeNeeds.length === 0 ? (
                <p className="text-[9px] text-slate-500 text-center py-2">لا توجد نواقص أو احتياجات مسجلة قيد الشراء 🎉</p>
              ) : (
                <div className="space-y-1.5">
                  {urgentHomeNeeds.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => onTabChange('home')}
                      className="flex justify-between items-center text-[10px] p-2 bg-slate-900/40 rounded-xl border border-slate-850 hover:bg-slate-900 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span>{n.name}</span>
                        <span className="text-[8px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded border border-slate-850">{n.category}</span>
                      </div>
                      <span className="font-bold text-indigo-300">{n.expectedPrice ? `${n.expectedPrice.toLocaleString('ar-EG')} ر.س` : 'غير محدد'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

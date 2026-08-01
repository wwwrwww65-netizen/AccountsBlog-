/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Edit2, Coins, Calendar, Tag, Sparkles, 
  Search, ArrowDown, ChevronDown, CheckCircle2, 
  Utensils, Car, Film, HeartPulse, Home, HelpCircle,
  Printer, Download, X, FileText
} from 'lucide-react';
import { DailyExpense } from '../types';

interface DailyExpensesTabProps {
  expenses: DailyExpense[];
  onAddExpense: (expense: Omit<DailyExpense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense?: (id: string, expense: Omit<DailyExpense, 'id'>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const EXPENSE_CATEGORIES = [
  { id: 'طعام', label: 'طعام ومشروبات', icon: Utensils, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'سكن', label: 'سكن وإيجار وفواتير', icon: Home, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'نقل', label: 'نقل ومواصلات ووقود', icon: Car, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  { id: 'ترفيه', label: 'ترفيه وتسوق وهدايا', icon: Film, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'صحة', label: 'صحة وعلاج وأدوية', icon: HeartPulse, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'أخرى', label: 'مصاريف أخرى', icon: HelpCircle, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export default function DailyExpensesTab({ expenses, onAddExpense, onDeleteExpense, onUpdateExpense, showToast }: DailyExpensesTabProps) {
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<DailyExpense | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('طعام');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('الكل');

  // Export states
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [exportDateRange, setExportDateRange] = useState('all');
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [exportEndDate, setExportEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Suggested monthly budget limit
  const monthlyLimit = 4000;
  
  // Calculate total monthly expenses
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percentageSpent = Math.min((totalSpent / monthlyLimit) * 100, 100);

  const handleExport = (isDownload: boolean) => {
    // 1. Filter expenses based on the selected range
    const filtered = expenses.filter(e => {
      if (exportDateRange === 'all') return true;
      const targetTime = new Date(e.date).getTime();
      if (exportDateRange === 'month') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        return targetTime >= startOfMonth.getTime();
      }
      const sTime = new Date(exportStartDate).getTime();
      const eTime = new Date(exportEndDate).getTime();
      return targetTime >= sTime && targetTime <= eTime;
    });

    const sumSpent = filtered.reduce((sum, e) => sum + e.amount, 0);

    const rangeLabel = exportDateRange === 'all' ? 'جميع البيانات' : 
                       exportDateRange === 'month' ? 'الشهر الحالي' : 
                       `الفترة من ${exportStartDate} إلى ${exportEndDate}`;

    // Build self-contained HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الصرفيات اليومية والميزانية</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            margin: 0;
            padding: 30px;
            direction: rtl;
            font-size: 12px;
            line-height: 1.6;
          }
          .report-header {
            border-bottom: 3px double #e11d48;
            padding-bottom: 20px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo-box {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-img {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            object-fit: cover;
          }
          .title {
            font-size: 20px;
            font-weight: 800;
            color: #e11d48;
            margin: 0;
          }
          .subtitle {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
            font-weight: 600;
          }
          .meta-info {
            text-align: left;
            font-size: 11px;
            color: #475569;
          }
          .meta-info p {
            margin: 3px 0;
          }
          .summary-card {
            background-color: #fff1f2;
            border: 1px solid #fecdd3;
            border-right: 5px solid #e11d48;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 30px;
            display: inline-block;
            min-width: 200px;
          }
          .summary-card h4 {
            margin: 0 0 5px 0;
            font-size: 10px;
            color: #64748b;
            font-weight: bold;
          }
          .summary-card .value {
            font-size: 18px;
            font-weight: 800;
            color: #e11d48;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
          }
          .report-table th {
            background-color: #e11d48;
            color: #ffffff;
            text-align: right;
            padding: 10px 12px;
            font-weight: 700;
            border: 1px solid #e11d48;
          }
          .report-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }
          .report-table tr:nth-child(even) {
            background-color: #fcfcfc;
          }
          .total-row {
            font-weight: bold;
            background-color: #fff1f2 !important;
            border-top: 2px solid #e11d48;
          }
          .total-row td {
            color: #e11d48;
            font-size: 12px;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; margin: 15mm; }
          }
        </style>
      </head>
      <body>
        ${isDownload ? `
          <button onclick="window.print()" class="no-print" style="position: fixed; top: 20px; left: 20px; background-color: #e11d48; color: #ffffff; font-family: 'Cairo', sans-serif; font-weight: 800; font-size: 12px; border: none; padding: 10px 20px; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); cursor: pointer; z-index: 99999;">
            🖨️ طباعة أو حفظ كـ PDF بالجوال
          </button>
        ` : ''}

        <div class="report-header">
          <div class="logo-box">
            <img class="logo-img" src="/logo.jpg" alt="Logo" onerror="this.style.display='none'" referrerPolicy="no-referrer" />
            <div>
              <h1 class="title">مدونة الحسابات المتقدمة</h1>
              <p class="subtitle">تقرير الصرفيات اليومية والشخصية والميزانية</p>
            </div>
          </div>
          <div class="meta-info">
            <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>النطاق الزمني:</strong> ${rangeLabel}</p>
          </div>
        </div>

        <div class="summary-card">
          <h4>إجمالي المصاريف المصنفة</h4>
          <div class="value">${sumSpent.toLocaleString('ar-EG')} ريال</div>
        </div>

        <h3 style="color: #e11d48; border-bottom: 2px solid #fecdd3; padding-bottom: 5px; font-size: 14px;">جدول الصرفيات التفصيلي</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>التصنيف</th>
              <th>البيان والملاحظات</th>
              <th>القيمة والعملة</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#888;">لا توجد مصاريف مسجلة في هذا النطاق</td></tr>' : 
              filtered.map(item => `
                <tr>
                  <td>${item.date}</td>
                  <td>${item.category}</td>
                  <td>${item.notes || '—'}</td>
                  <td style="font-weight: bold; color: #e11d48;">${item.amount.toLocaleString('ar-EG')} ريال</td>
                </tr>
              `).join('')}
            <tr class="total-row">
              <td colspan="3">المجموع النهائي للأموال المصروفة</td>
              <td>${sumSpent.toLocaleString('ar-EG')} ريال</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    if (isDownload) {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_المصاريف_اليومية_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم تحميل ملف تقرير الصرفيات وحفظه بتخزين الهاتف بنجاح!', 'success');
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.write('<script>window.onload = function() { window.print(); }</script>');
        doc.close();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
      showToast('جاري تحضير التقرير للطباعة وحفظه كـ PDF...', 'success');
    }
    setIsOpenExport(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('الرجاء إدخال مبلغ صحيح', 'error');
      return;
    }
    if (editingExpense) {
      if (onUpdateExpense) {
        onUpdateExpense(editingExpense.id, {
          amount: parseFloat(amount),
          category,
          date,
          notes: notes.trim() || undefined
        });
        showToast('تم تعديل المصروف اليومي بنجاح', 'success');
      }
    } else {
      onAddExpense({
        amount: parseFloat(amount),
        category,
        date,
        notes: notes.trim() || undefined
      });
      showToast('تم تسجيل المصروف اليومي بنجاح', 'success');
    }
    setAmount('');
    setNotes('');
    setEditingExpense(null);
    setIsOpenAdd(false);
  };

  const getCategoryColor = (catId: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getCategoryIcon = (catId: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
    const Icon = cat ? cat.icon : HelpCircle;
    return <Icon size={16} />;
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.notes?.toLowerCase().includes(search.toLowerCase()) || e.category.includes(search);
    const matchesCat = filterCategory === 'الكل' || e.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Overview & Budget Progress Meter */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              صرفياتي اليومية والشخصية
            </span>
            <div className="pt-1 flex items-baseline gap-1">
              <span className="text-3xl font-black text-rose-400">{totalSpent.toLocaleString('ar-EG')}</span>
              <span className="text-sm font-semibold text-slate-400">ريال مصروف هذا الشهر</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsOpenExport(true)}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-600/15 hover:from-red-500/20 hover:to-rose-600/25 border border-red-500/20 hover:border-red-500/40 py-3 px-4 text-xs font-black text-rose-300 hover:text-rose-100 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-red-500/5"
            >
              <span className="flex items-center justify-center bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow shadow-red-600/30 group-hover:scale-110 transition-transform">
                PDF
              </span>
              <span>تصدير تقرير PDF</span>
            </button>
            <button
              onClick={() => {
                setEditingExpense(null);
                setAmount('');
                setCategory('طعام');
                setDate(new Date().toISOString().split('T')[0]);
                setNotes('');
                setIsOpenAdd(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-rose-500 hover:bg-rose-400 py-3 px-5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              <span>إضافة مصروف جديد</span>
            </button>
          </div>
        </div>

        {/* Budget bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>مقياس الميزانية المرنة</span>
            <span>{totalSpent.toLocaleString('ar-EG')} / {monthlyLimit.toLocaleString('ar-EG')} ريال</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentageSpent > 90 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' :
                percentageSpent > 70 ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' :
                'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              }`}
              style={{ width: `${percentageSpent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>متبقي {Math.max(monthlyLimit - totalSpent, 0).toLocaleString('ar-EG')} ريال سعودي</span>
            <span>{Math.round(percentageSpent)}% مستهلك</span>
          </div>
        </div>
      </div>

      {/* Expense Filters & Search */}
      <div className="space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 py-3.5 pl-4 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            placeholder="البحث في بيان المصروفات اليومية..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/30 rounded-2xl border border-slate-800/40 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('الكل')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'الكل'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            جميع التصنيفات
          </button>
          {EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterCategory === cat.id
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="text-[14px]">{getCategoryIcon(cat.id)}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 text-slate-500">
            <Coins size={36} className="text-slate-700 mb-3" />
            <h4 className="text-sm font-bold text-slate-400 mb-1">لا توجد مصاريف مطابقة</h4>
            <p className="text-xs text-slate-500">سجل مصروفاتك اليومية لترتيب صرفياتك بدقة.</p>
          </div>
        ) : (
          filteredExpenses.map(item => (
            <div 
              key={item.id}
              className="rounded-2xl bg-slate-900 p-4 border border-slate-800/50 flex items-center justify-between shadow-sm group hover:border-slate-700 hover:bg-slate-850 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border font-bold ${getCategoryColor(item.category)}`}>
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{item.notes || `مصروف من فئة ${item.category}`}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-black text-rose-400 text-sm">
                  -{item.amount.toLocaleString('ar-EG')} ريال
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingExpense(item);
                      setAmount(item.amount.toString());
                      setCategory(item.category);
                      setDate(item.date);
                      setNotes(item.notes || '');
                      setIsOpenAdd(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    title="تعديل المصروف"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onDeleteExpense(item.id);
                      showToast('تم حذف المصروف بنجاح', 'info');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="حذف المصروف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isOpenAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenAdd(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl z-10"
            >
              <div className="border-b border-slate-800 p-5 flex justify-between items-center">
                <h3 className="font-bold text-slate-200">
                  {editingExpense ? 'تعديل المصروف اليومي ✏️' : 'إضافة مصروف يومي جديد 💸'}
                </h3>
                <button 
                  onClick={() => {
                    setIsOpenAdd(false);
                    setEditingExpense(null);
                  }}
                  className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  إغلاق
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">قيمة المبلغ (ريال) *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                      <Coins size={16} />
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="0.00"
                      required
                      min="0.01"
                      step="any"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">التصنيف</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">التاريخ</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-rose-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">البيان / ملاحظات المصروف</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="مثال: غداء، كوفي شوب، فاتورة مياه..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenAdd(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-400 transition-colors"
                  >
                    تسجيل المصروف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Report Modal */}
      <AnimatePresence>
        {isOpenExport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenExport(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl z-10"
            >
              <div className="border-b border-slate-800 p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="text-rose-400" size={18} />
                  <h3 className="font-bold text-slate-200 text-xs">تصدير تقرير الصرفيات اليومية 📊</h3>
                </div>
                <button 
                  onClick={() => setIsOpenExport(false)}
                  className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* 1. Range selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400">الفترة الزمنية المراد تصديرها:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportDateRange('all')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'all' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الكل (كل الأوقات)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportDateRange('month')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'month' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الشهر الحالي
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportDateRange('custom')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'custom' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      تاريخ مخصص
                    </button>
                  </div>
                </div>

                {/* 2. Custom Date inputs */}
                {exportDateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-850 animate-fadeIn">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">من تاريخ:</span>
                      <input
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">إلى تاريخ:</span>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleExport(false)}
                    className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-500/15"
                  >
                    <Printer size={16} />
                    <span>طباعة وتصدير PDF مباشر</span>
                  </button>

                  <button
                    onClick={() => handleExport(true)}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 text-rose-400 border border-slate-700/80 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={16} />
                    <span>تحميل وتخزين المستند في الهاتف</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, CheckSquare, Square, Trash2, Edit2, Home, 
  Coins, Calendar, ShoppingCart, Wrench, Sofa, 
  FileSpreadsheet, Sparkles, AlertCircle, RefreshCw,
  Printer, Download, X, FileText
} from 'lucide-react';
import { HomeNeed } from '../types';

interface HomeEssentialsTabProps {
  needs: HomeNeed[];
  onAddNeed: (need: Omit<HomeNeed, 'id' | 'addedAt'>) => void;
  onToggleNeed: (id: string) => void;
  onDeleteNeed: (id: string) => void;
  onUpdateNeed?: (id: string, need: Omit<HomeNeed, 'id' | 'addedAt'>) => void;
  onConvertToExpense?: (need: HomeNeed) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES = [
  { id: 'بقالة', label: 'أغذية وبقالة البيت', icon: ShoppingCart, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'صيانة', label: 'أعمال صيانة وإصلاح', icon: Wrench, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'أثاث', label: 'أثاث ومستلزمات الغرف', icon: Sofa, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'فواتير', label: 'فواتير وخدمات منزلية', icon: FileSpreadsheet, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'أخرى', label: 'مستلزمات أخرى', icon: Home, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export default function HomeEssentialsTab({
  needs,
  onAddNeed,
  onToggleNeed,
  onDeleteNeed,
  onUpdateNeed,
  onConvertToExpense,
  showToast
}: HomeEssentialsTabProps) {
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [editingNeed, setEditingNeed] = useState<HomeNeed | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('بقالة');

  // Export states
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [exportDateRange, setExportDateRange] = useState('all');
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [exportEndDate, setExportEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleExport = (isDownload: boolean) => {
    // Filter home needs by added date if they have one (or fallback to true)
    const filtered = needs.filter(n => {
      if (exportDateRange === 'all') return true;
      if (!n.addedAt) return true;
      const targetTime = new Date(n.addedAt).getTime();
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

    const sumPending = filtered.filter(n => !n.isPurchased).reduce((sum, n) => sum + (n.expectedPrice || 0), 0);
    const sumPurchased = filtered.filter(n => n.isPurchased).reduce((sum, n) => sum + (n.expectedPrice || 0), 0);

    const rangeLabel = exportDateRange === 'all' ? 'جميع البيانات' : 
                       exportDateRange === 'month' ? 'الشهر الحالي' : 
                       `الفترة من ${exportStartDate} إلى ${exportEndDate}`;

    // Build PDF Html structure
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير مستلزمات ومقاضي البيت</title>
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
            border-bottom: 3px double #6366f1;
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
            color: #6366f1;
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
          .summary-container {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            background-color: #f5f3ff;
            border: 1px solid #ddd6fe;
            border-right: 5px solid #6366f1;
            border-radius: 12px;
            padding: 12px 18px;
            flex: 1;
            min-width: 150px;
          }
          .summary-card.purchased {
            background-color: #ecfdf5;
            border-color: #a7f3d0;
            border-right-color: #10b981;
          }
          .summary-card h4 {
            margin: 0 0 5px 0;
            font-size: 10px;
            color: #64748b;
            font-weight: bold;
          }
          .summary-card .value {
            font-size: 16px;
            font-weight: 800;
            color: #6366f1;
          }
          .summary-card.purchased .value {
            color: #10b981;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
          }
          .report-table th {
            background-color: #6366f1;
            color: #ffffff;
            text-align: right;
            padding: 10px 12px;
            font-weight: 700;
            border: 1px solid #6366f1;
          }
          .report-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }
          .report-table tr:nth-child(even) {
            background-color: #fcfcfc;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
          }
          .badge-purchased {
            background-color: #d1fae5;
            color: #065f46;
          }
          .badge-pending {
            background-color: #fee2e2;
            color: #991b1b;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; margin: 15mm; }
          }
        </style>
      </head>
      <body>
        ${isDownload ? `
          <button onclick="window.print()" class="no-print" style="position: fixed; top: 20px; left: 20px; background-color: #6366f1; color: #ffffff; font-family: 'Cairo', sans-serif; font-weight: 800; font-size: 12px; border: none; padding: 10px 20px; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); cursor: pointer; z-index: 99999;">
            🖨️ طباعة أو حفظ كـ PDF بالجوال
          </button>
        ` : ''}

        <div class="report-header">
          <div class="logo-box">
            <img class="logo-img" src="/logo.jpg" alt="Logo" onerror="this.style.display='none'" referrerPolicy="no-referrer" />
            <div>
              <h1 class="title">مدونة الحسابات المتقدمة</h1>
              <p class="subtitle">تقرير مستلزمات ومقاضي البيت</p>
            </div>
          </div>
          <div class="meta-info">
            <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>النطاق الزمني:</strong> ${rangeLabel}</p>
          </div>
        </div>

        <div class="summary-container">
          <div class="summary-card">
            <h4>إجمالي الأغراض المتبقية (مطلوبة)</h4>
            <div class="value">${sumPending.toLocaleString('ar-EG')} ريال</div>
          </div>
          <div class="summary-card purchased">
            <h4>إجمالي الأغراض التي تم شراؤها</h4>
            <div class="value">${sumPurchased.toLocaleString('ar-EG')} ريال</div>
          </div>
        </div>

        <h3 style="color: #6366f1; border-bottom: 2px solid #ddd6fe; padding-bottom: 5px; font-size: 14px;">كشف الأغراض والتصنيفات</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>اسم الغرض / المستلزم</th>
              <th>التصنيف</th>
              <th>تاريخ الإضافة</th>
              <th>السعر المتوقع</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#888;">لا توجد أغراض مضافة حالياً</td></tr>' : 
              filtered.map(item => `
                <tr>
                  <td style="font-weight: bold;">${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.addedAt || '—'}</td>
                  <td>${item.expectedPrice ? `${item.expectedPrice.toLocaleString('ar-EG')} ريال` : 'غير محدد'}</td>
                  <td>
                    ${item.isPurchased ? 
                      '<span class="badge badge-purchased">تم الشراء</span>' : 
                      '<span class="badge badge-pending">قيد الطلب</span>'}
                  </td>
                </tr>
              `).join('')}
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
      a.download = `تقرير_مستلزمات_البيت_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم تحميل قائمة مستلزمات البيت وحفظها بتخزين الهاتف بنجاح!', 'success');
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
      showToast('جاري تحضير قائمة مقاضي البيت للحفظ كـ PDF...', 'success');
    }
    setIsOpenExport(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('الرجاء إدخال اسم الغرض', 'error');
      return;
    }
    if (editingNeed) {
      if (onUpdateNeed) {
        onUpdateNeed(editingNeed.id, {
          name: name.trim(),
          expectedPrice: price ? parseFloat(price) : undefined,
          isPurchased: editingNeed.isPurchased,
          category
        });
        showToast('تم تعديل الغرض بنجاح', 'success');
      }
    } else {
      onAddNeed({
        name: name.trim(),
        expectedPrice: price ? parseFloat(price) : undefined,
        isPurchased: false,
        category
      });
      showToast('تمت إضافة غرض البيت بنجاح', 'success');
    }
    setName('');
    setPrice('');
    setEditingNeed(null);
    setIsOpenAdd(false);
  };

  const getCategoryColor = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getCategoryIcon = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    const Icon = cat ? cat.icon : Home;
    return <Icon size={16} />;
  };

  // Calculate totals
  const pendingNeeds = needs.filter(n => !n.isPurchased);
  const totalPendingCost = pendingNeeds.reduce((sum, n) => sum + (n.expectedPrice || 0), 0);

  const purchasedNeeds = needs.filter(n => n.isPurchased);
  const totalPurchasedCost = purchasedNeeds.reduce((sum, n) => sum + (n.expectedPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              مستلزمات ومقاضي البيت
            </span>
            <div className="pt-1 flex items-baseline gap-1">
              <span className="text-3xl font-black text-indigo-400">{totalPendingCost.toLocaleString('ar-EG')}</span>
              <span className="text-sm font-semibold text-slate-400">ريال متوقع للطلبات المتبقية ({pendingNeeds.length} أغراض)</span>
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
                setEditingNeed(null);
                setName('');
                setPrice('');
                setCategory('بقالة');
                setIsOpenAdd(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 py-3 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              <span>إضافة غرض للبيت</span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-850">
          <AlertCircle size={15} className="text-indigo-400" />
          <span>يمكنك التكبيس على المربع لتحديد الغرض كـ (تم الشراء) وسيتغير لونه لسهولة الترتيب.</span>
        </div>
      </div>

      {/* Main checklist split */}
      <div className="space-y-4">
        {/* Pending Items Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>قائمة المقاضي المتبقية</span>
          </h4>

          {pendingNeeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-slate-800 bg-slate-900/10 text-slate-500">
              <p className="text-xs">رائع! تم تلبية جميع متطلبات البيت المسجلة.</p>
            </div>
          ) : (
            pendingNeeds.map(need => (
              <div 
                key={need.id}
                className="rounded-2xl bg-slate-900 p-4 border border-slate-800/60 flex items-center justify-between shadow-sm hover:border-indigo-500/40 hover:bg-slate-850/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      onToggleNeed(need.id);
                      showToast('تم تحديث حالة الغرض بنجاح', 'success');
                    }}
                    className="text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    <Square size={20} />
                  </button>

                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{need.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">{getCategoryIcon(need.category)} {need.category}</span>
                      <span>•</span>
                      <span>تاريخ الإضافة: {need.addedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {need.expectedPrice ? (
                    <span className="text-xs font-bold text-slate-300">{need.expectedPrice.toLocaleString('ar-EG')} ريال</span>
                  ) : (
                    <span className="text-[10px] text-slate-500">سعر غير محدد</span>
                  )}

                  {onConvertToExpense && need.expectedPrice && (
                    <button
                      onClick={() => {
                        onConvertToExpense(need);
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-md font-bold transition-colors animate-pulse"
                      title="ترحيل الغرض كـ مصروف يومي"
                    >
                      ترحيل كـ مصروف
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingNeed(need);
                        setName(need.name);
                        setPrice(need.expectedPrice ? need.expectedPrice.toString() : '');
                        setCategory(need.category);
                        setIsOpenAdd(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="تعديل الغرض"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        onDeleteNeed(need.id);
                        showToast('تم حذف الغرض من القائمة', 'info');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف الغرض"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Purchased Items Section */}
        {purchasedNeeds.length > 0 && (
          <div className="space-y-3 pt-4">
            <h4 className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>أغراض تم شراؤها سابقاً</span>
            </h4>

            <div className="space-y-2 opacity-65">
              {purchasedNeeds.map(need => (
                <div 
                  key={need.id}
                  className="rounded-2xl bg-slate-900/60 p-4 border border-slate-850 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        onToggleNeed(need.id);
                        showToast('تمت إعادة الغرض للقائمة المتبقية', 'info');
                      }}
                      className="text-emerald-400"
                    >
                      <CheckSquare size={20} />
                    </button>

                    <div>
                      <h4 className="font-bold text-slate-400 text-sm line-through">{need.name}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 font-semibold flex items-center gap-1">
                        {getCategoryIcon(need.category)} {need.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {need.expectedPrice && (
                      <span className="text-xs font-bold text-slate-500 line-through">{need.expectedPrice.toLocaleString('ar-EG')} ريال</span>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingNeed(need);
                          setName(need.name);
                          setPrice(need.expectedPrice ? need.expectedPrice.toString() : '');
                          setCategory(need.category);
                          setIsOpenAdd(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="تعديل الغرض"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          onDeleteNeed(need.id);
                          showToast('تم حذف الغرض تماماً', 'info');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="حذف الغرض"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Need Modal */}
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
                  {editingNeed ? 'تعديل مستلزم البيت ✏️' : 'إضافة مستلزم للبيت 🏠'}
                </h3>
                <button onClick={() => {
                  setIsOpenAdd(false);
                  setEditingNeed(null);
                }} className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors">
                  إغلاق
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">اسم الغرض المطلوب *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: شراء كرتون مياه صحية للبيت"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">التكلفة المتوقعة (ريال) - اختياري</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">التصنيف المنزلي</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
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
                    className="rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-400 transition-colors"
                  >
                    حفظ في قائمة البيت
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
                  <FileText className="text-indigo-400" size={18} />
                  <h3 className="font-bold text-slate-200 text-xs">تصدير مستلزمات ومقاضي البيت 📊</h3>
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
                  <label className="block text-xs font-semibold text-slate-400">الفترة الزمنية للطلب أو الشراء:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportDateRange('all')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'all' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الكل (كل الأوقات)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportDateRange('month')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'month' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الشهر الحالي
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportDateRange('custom')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'custom' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-950 text-slate-500'
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">إلى تاريخ:</span>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleExport(false)}
                    className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    <Printer size={16} />
                    <span>طباعة وتصدير PDF مباشر</span>
                  </button>

                  <button
                    onClick={() => handleExport(true)}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 text-indigo-400 border border-slate-700/80 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
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

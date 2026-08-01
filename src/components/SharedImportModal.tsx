/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Eye, X, Sparkles, ShieldAlert, Check } from 'lucide-react';

interface SharedImportModalProps {
  isOpen: boolean;
  sharedData: any;
  onAccept: () => void;
  onPreview: () => void;
  onDecline: () => void;
}

export default function SharedImportModal({ isOpen, sharedData, onAccept, onPreview, onDecline }: SharedImportModalProps) {
  if (!sharedData) return null;

  // Compute some stats about the shared data to entice them!
  const accountsCount = sharedData.accounts?.length || 0;
  const transactionsCount = sharedData.transactions?.length || 0;
  const expensesCount = sharedData.dailyExpenses?.length || 0;
  const employeesCount = sharedData.employees?.length || 0;
  const sharedOwnerName = sharedData.user?.name || 'صديقك';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden text-right font-sans"
            dir="rtl"
          >
            {/* Accent Glowing Circle */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Icon */}
            <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-slate-800">
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl mb-3">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-slate-100">تحميل بيانات العمل المشتركة 📬</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                شارك معك <span className="text-emerald-400 font-bold">{sharedOwnerName}</span> نسخة حية من دفتر حساباته وتقاريره لتعاينها وتجربها!
              </p>
            </div>

            {/* Data Stats breakdown */}
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">مكونات السجل المالي المشترك:</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block text-lg font-black text-emerald-400">{accountsCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">الحسابات والشركاء</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block text-lg font-black text-sky-400">{transactionsCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">المعاملات المالية</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block text-lg font-black text-rose-400">{expensesCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">صرفيات الميزانية</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block text-lg font-black text-amber-400">{employeesCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">عمال وموظفين</span>
                  </div>
                </div>
              </div>

              {/* Warning box */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-right">
                <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-400">تنبيه حماية البيانات الشخصية:</h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                    الاستيراد والحفظ الدائم سيقوم باستبدال أي بيانات محلية مسجلة في متصفحك حالياً. يمكنك استخدام <strong>وضع المعاينة المؤقتة</strong> لمعاينة ومراجعة عمل صديقك دون التأثير مطلقاً على سجلاتك الخاصة!
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Preview Button (Recommended) */}
                  <button
                    onClick={onPreview}
                    className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                  >
                    <Eye size={14} />
                    <span>معاينة تجريبية مؤقتة (آمن) 🔍</span>
                  </button>

                  {/* Accept & Import */}
                  <button
                    onClick={onAccept}
                    className="py-3.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>استيراد وحفظ دائم 📥</span>
                  </button>
                </div>

                {/* Decline & Dismiss */}
                <button
                  onClick={onDecline}
                  className="py-3 px-4 bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-slate-400 border border-slate-850 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X size={13} />
                  <span>تخطي والاحتفاظ ببياناتي الخاصة ❌</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

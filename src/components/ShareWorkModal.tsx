/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, ExternalLink, Link2, HeartHandshake } from 'lucide-react';

interface ShareWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function ShareWorkModal({ isOpen, onClose, shareUrl, showToast }: ShareWorkModalProps) {
  const [copied, setCopied] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        showToast('تم نسخ رابط مشاركة الدفتر الحية بنجاح! 🔗', 'success');
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {
        showToast('فشل النسخ التلقائي، يرجى نسخ الرابط يدوياً.', 'error');
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'دفتر الديون المتقدم',
          text: 'ألقِ نظرة على حساباتي وسجلاتي المالية في تطبيق الدفتر الذكي وأعطني رأيك!',
          url: shareUrl,
        });
        showToast('تم فتح نافذة المشاركة بنجاح! 📲', 'success');
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden text-right font-sans"
            dir="rtl"
          >
            {/* Ambient glows */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">رابط مشاركة العمل والبيانات الحية</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">شارك حساباتك وصرفياتك الحالية مع صديق ليعطيك رأيه</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/5 p-2 rounded-xl border border-amber-500/15">
                  <HeartHandshake size={14} className="shrink-0" />
                  <span>كيف تعمل ميزة مشاركة الرابط؟</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                  يقوم هذا الرابط بتشفير وتضمين كافة الحسابات والديون والعمال والمستلزمات الحالية التي قمت بصنعها في الرابط نفسه. عندما يفتح صديقك الرابط، سيستطيع معاينة وتجربة عملك مباشرة وكأنك بجانبه!
                </p>
              </div>

              {/* URL Input Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 block font-bold">رابط المشاركة المباشر السحابي:</label>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono text-left focus:outline-none focus:border-emerald-500"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copied 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              {/* Native mobile share / Quick Send */}
              <div className="pt-3 flex gap-2">
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-95"
                  >
                    <Share2 size={14} />
                    <span>إرسال ومشاركة عبر التطبيقات الأخري 📲</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 font-bold text-xs rounded-xl flex-1 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>إغلاق النافذة</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

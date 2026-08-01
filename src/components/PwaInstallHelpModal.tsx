import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, ExternalLink, Info, CheckCircle2, Monitor, Download, Sparkles } from 'lucide-react';

interface PwaInstallHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallDirectly: () => void;
}

export const PwaInstallHelpModal: React.FC<PwaInstallHelpModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallDirectly,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [isIframe, setIsIframe] = useState<boolean>(false);

  useEffect(() => {
    // Detect if running inside an iframe (like AI Studio preview frame)
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

    // Auto-detect platform to set the default tab
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  }, [isOpen]);

  const handleOpenStandalone = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-slate-800 p-5 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 text-sm">تثبيت دفتر الحسابات الذكي 📲</h3>
                  <p className="text-[10px] text-slate-400 font-normal">حوّل الموقع إلى تطبيق جوال حقيقي بثوانٍ معدودة</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg bg-slate-800/60 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Iframe Alert Context */}
              {isIframe && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-2xl space-y-2.5 text-xs shadow-lg shadow-amber-500/5">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold block text-amber-400 mb-1">أنت داخل بيئة إطار المعاينة (Iframe) ⚠️</span>
                      المتصفحات الأمنية تحظر تثبيت تطبيقات الـ PWA بشكل مباشر من داخل إطارات المواقع. لتتمكن من التثبيت، يجب فتح التطبيق في صفحة مستقلة أولاً.
                    </div>
                  </div>
                  <button
                    onClick={handleOpenStandalone}
                    className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10 text-xs"
                  >
                    <ExternalLink size={14} />
                    <span>افتح التطبيق في نافذة مستقلة للمتابعة</span>
                  </button>
                </div>
              )}

              {/* Direct Native Install if Prompt is Available and NOT in Iframe */}
              {!isIframe && deferredPrompt && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-center space-y-3">
                  <p className="text-xs font-bold leading-normal">
                    متصفحك يدعم التثبيت الفوري بنقرة واحدة! اضغط بالأسفل لبدء التثبيت مباشرة:
                  </p>
                  <button
                    onClick={() => {
                      onInstallDirectly();
                      onClose();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                  >
                    <Download size={16} />
                    <span>تثبيت التطبيق فوراً الآن 📲</span>
                  </button>
                </div>
              )}

              {/* Why install PWA features list */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 space-y-3">
                <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>مزايا التطبيق المثبّت:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>تشغيل بملء الشاشة وإخفاء العنوان</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>سرعة تحميل خارقة وبدون انتظار</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>دعم كامل للوضع غير المتصل (أوفلاين)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>أيقونة خاصة على شاشتك الرئيسية</span>
                  </div>
                </div>
              </div>

              {/* Platform Selector Tabs */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-400">اختر نوع نظام تشغيل جهازك لمشاهدة الخطوات:</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850">
                  <button
                    onClick={() => setActiveTab('android')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'android'
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    🤖 أندرويد
                  </button>
                  <button
                    onClick={() => setActiveTab('ios')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'ios'
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    🍏 آيفون / آيباد
                  </button>
                  <button
                    onClick={() => setActiveTab('desktop')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'desktop'
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    💻 الكمبيوتر
                  </button>
                </div>
              </div>

              {/* Steps Area based on selected Tab */}
              <div className="bg-slate-950/20 rounded-2xl border border-slate-850 p-4 min-h-[140px] flex flex-col justify-center">
                {activeTab === 'android' && (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">١</div>
                      <p className="text-slate-300 leading-normal">
                        افتح هذا التطبيق في متصفح <strong className="text-white">Google Chrome</strong> على هاتفك الأندرويد.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">٢</div>
                      <p className="text-slate-300 leading-normal">
                        اضغط على أيقونة <strong className="text-white">الثلاث نقاط (⋮)</strong> في أعلى الزاوية اليسرى للمتصفح.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">٣</div>
                      <p className="text-slate-300 leading-normal">
                        اختر <strong className="text-emerald-400">"تثبيت التطبيق" (Install App)</strong> أو <strong className="text-white">"إضافة إلى الشاشة الرئيسية"</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">١</div>
                      <p className="text-slate-300 leading-normal">
                        تأكد من فتح هذا الرابط في متصفح <strong className="text-white">Safari (سفاري)</strong> الرسمي على جهاز الآيفون.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">٢</div>
                      <p className="text-slate-300 leading-normal">
                        اضغط على زر <strong className="text-white">المشاركة (Share) 📤</strong> المتواجد في شريط الأدوات بالأسفل.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">٣</div>
                      <p className="text-slate-300 leading-normal">
                        قم بالتمرير للأسفل في القائمة، ثم اضغط على خيار <strong className="text-emerald-400">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen) ➕</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'desktop' && (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">١</div>
                      <p className="text-slate-300 leading-normal">
                        افتح التطبيق عبر متصفح <strong className="text-white">Chrome أو Edge</strong> على جهاز الكمبيوتر الخاص بك.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">٢</div>
                      <p className="text-slate-300 leading-normal">
                        انظر إلى شريط العناوين في الأعلى، ستجد أيقونة تشبه <strong className="text-white">الشاشة مع سهم لأسفل (أو علامة زائد ⊕)</strong> بجوار المفضلة.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">٣</div>
                      <p className="text-slate-300 leading-normal">
                        اضغط عليها ثم اختر <strong className="text-emerald-400">"تثبيت" (Install)</strong> لتثبيته كبرنامج مستقل على شريط المهام أو سطح المكتب.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="border-t border-slate-800 p-4 bg-slate-950/30 flex items-center justify-end gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق الدليل
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

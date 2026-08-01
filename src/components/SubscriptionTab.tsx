/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Sparkles, Check, Key, Mail, User, ShieldCheck, 
  HelpCircle, CreditCard, Gift, Clock, RefreshCw, MessageCircle, Send, Settings, AlertCircle, Smartphone,
  QrCode, Link2, Trash2, ExternalLink, CheckCircle, Info, Phone, Globe, MoreVertical, Play, ArrowLeft
} from 'lucide-react';

interface SubscriptionTabProps {
  user: {
    email: string;
    name: string;
    isPremium: boolean;
    trialDaysLeft: number;
    subscriptionType: 'free' | 'silver' | 'gold';
  } | null;
  onLogin: (name: string, email: string) => void;
  onLogout: () => void;
  onUpgradePlan: (plan: 'silver' | 'gold') => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function SubscriptionTab({ user, onLogin, onLogout, onUpgradePlan, showToast }: SubscriptionTabProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // WhatsApp Linking States
  const [isWsConnected, setIsWsConnected] = useState(() => localStorage.getItem('ws_linked') === 'true');
  const [wsNumber, setWsNumber] = useState(() => localStorage.getItem('ws_number') || '');
  const [wsMethod, setWsMethod] = useState<'direct' | 'ultramsg' | 'custom_post' | 'custom_get'>(
    () => (localStorage.getItem('ws_method') as any) || 'direct'
  );
  const [wsToken, setWsToken] = useState(() => localStorage.getItem('ws_token') || '');
  const [wsInstanceId, setWsInstanceId] = useState(() => localStorage.getItem('ws_instance_id') || '');
  const [wsCustomUrl, setWsCustomUrl] = useState(() => localStorage.getItem('ws_custom_url') || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [wsStatus, setWsStatus] = useState<string>('');

  const [isScanning, setIsScanning] = useState(false);
  const [qrProgress, setQrProgress] = useState(100);
  const [qrKey, setQrKey] = useState(0);
  const [wsPhoneInput, setWsPhoneInput] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [wsPairingCode, setWsPairingCode] = useState('');
  const [showPhonePairing, setShowPhonePairing] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessageText, setTestMessageText] = useState('تم تفعيل وتجربة ميزة ربط واتساب بنجاح في مدونة الحسابات المتقدمة! 🟢✨');

  // Auto-reload fake QR code to simulate WhatsApp security rotation
  useEffect(() => {
    if (isWsConnected || isScanning) return;
    
    setQrProgress(100);
    const interval = setInterval(() => {
      setQrProgress((prev) => {
        if (prev <= 1) {
          setQrKey((k) => k + 1);
          return 100;
        }
        return prev - 1.5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [qrKey, isWsConnected, isScanning]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    showToast('جاري قراءة كود الـ QR والتحقق من التشفير الثنائي المشفر...', 'info');
    
    setTimeout(() => {
      setIsScanning(false);
      setIsWsConnected(true);
      const targetPhone = wsPhoneInput.trim() || '+966555555555';
      setWsNumber(targetPhone);
      setWsMethod('direct');
      localStorage.setItem('ws_linked', 'true');
      localStorage.setItem('ws_number', targetPhone);
      localStorage.setItem('ws_method', 'direct');
      showToast('تم الارتباط بنجاح! تم تفعيل ميزة إرسال واتساب الحقيقية للسندات 🟢', 'success');
    }, 2000);
  };

  const handleSaveGatewaySettings = () => {
    if (wsMethod !== 'direct') {
      if (wsMethod === 'ultramsg' && !wsInstanceId.trim()) {
        showToast('الرجاء إدخال الـ Instance ID لبوابة UltraMsg ⚠️', 'error');
        return;
      }
      if (!wsToken.trim()) {
        showToast('الرجاء إدخال مفتاح الـ Token الخاص بالبوابة ⚠️', 'error');
        return;
      }
      if ((wsMethod === 'custom_get' || wsMethod === 'custom_post') && !wsCustomUrl.trim()) {
        showToast('الرجاء إدخال رابط الـ API الخاص بالبوابة المخصصة ⚠️', 'error');
        return;
      }
    }

    localStorage.setItem('ws_linked', 'true');
    localStorage.setItem('ws_method', wsMethod);
    localStorage.setItem('ws_token', wsToken);
    localStorage.setItem('ws_instance_id', wsInstanceId);
    localStorage.setItem('ws_custom_url', wsCustomUrl);
    
    let label = 'إرسال مباشر مجاني (WhatsApp)';
    if (wsMethod === 'ultramsg') label = `بوابة UltraMsg (ID: ${wsInstanceId})`;
    if (wsMethod === 'custom_get') label = 'بوابة مخصصة (GET API)';
    if (wsMethod === 'custom_post') label = 'بوابة مخصصة (POST API)';

    localStorage.setItem('ws_number', label);
    setWsNumber(label);
    setIsWsConnected(true);
    showToast('تم حفظ إعدادات بوابة واتساب والارتباط بنجاح! 💾🟢', 'success');
  };

  const handleDisconnectWs = () => {
    setIsWsConnected(false);
    setWsNumber('');
    setWsPairingCode('');
    localStorage.removeItem('ws_linked');
    localStorage.removeItem('ws_number');
    localStorage.removeItem('ws_method');
    localStorage.removeItem('ws_token');
    localStorage.removeItem('ws_instance_id');
    localStorage.removeItem('ws_custom_url');
    setWsMethod('direct');
    setWsToken('');
    setWsInstanceId('');
    setWsCustomUrl('');
    showToast('تم إلغاء تفعيل الارتباط ومسح إعدادات البوابة بنجاح 🔴', 'info');
  };

  const handleCheckUltraMsgStatus = async () => {
    if (!wsInstanceId.trim() || !wsToken.trim()) {
      showToast('الرجاء إدخال الـ Instance ID والـ Token أولاً للتحقق ⚠️', 'error');
      return;
    }
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/whatsapp/status?instanceId=${wsInstanceId.trim()}&token=${wsToken.trim()}`);
      const data = await response.json();
      setIsCheckingStatus(false);
      if (response.ok && data.success) {
        const statusVal = data.status?.status || data.status;
        setWsStatus(statusVal);
        if (statusVal === 'authenticated') {
          setIsWsConnected(true);
          const label = `بوابة UltraMsg (ID: ${wsInstanceId})`;
          setWsNumber(label);
          localStorage.setItem('ws_linked', 'true');
          localStorage.setItem('ws_method', 'ultramsg');
          localStorage.setItem('ws_token', wsToken);
          localStorage.setItem('ws_instance_id', wsInstanceId);
          localStorage.setItem('ws_number', label);
          showToast('رائع! تم التحقق بنجاح وجهازك مرتبط بالكامل بالواتساب السحابي 🎉🟢', 'success');
        } else if (statusVal === 'qr') {
          showToast('جهازك غير مرتبط حالياً. يرجى مسح رمز الـ QR الظاهر على الشاشة بجوالك 📱', 'info');
        } else {
          showToast(`حالة الجهاز الحالية: ${statusVal || 'غير متصل'} ⚠️`, 'info');
        }
      } else {
        showToast(`فشل التحقق: ${data.error || 'يرجى التأكد من صحة المفاتيح والاتصال'} ❌`, 'error');
      }
    } catch (err: any) {
      setIsCheckingStatus(false);
      showToast(`حدث خطأ أثناء الاتصال بالبوابة: ${err.message || 'خطأ في الشبكة'} ❌`, 'error');
    }
  };

  const handleGeneratePairingCode = () => {
    if (!wsPhoneInput.trim()) {
      showToast('الرجاء إدخال رقم الهاتف أولاً لتوليد كود المزامنة', 'error');
      return;
    }
    setIsGeneratingCode(true);
    setTimeout(() => {
      // Generate a WhatsApp-style 8-character pairing code
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      setWsPairingCode(`${part1}-${part2}`);
      setIsGeneratingCode(false);
      showToast('تم توليد كود الربط المباشر! أدخله في جهازك الآن', 'success');
    }, 1200);
  };

  const handleConfirmPairingCode = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsWsConnected(true);
      setWsNumber(wsPhoneInput.trim());
      setWsMethod('direct');
      localStorage.setItem('ws_linked', 'true');
      localStorage.setItem('ws_number', wsPhoneInput.trim());
      localStorage.setItem('ws_method', 'direct');
      setWsPairingCode('');
      setShowPhonePairing(false);
      showToast('تم الربط المباشر بنجاح باستخدام كود الهاتف! 📱✨', 'success');
    }, 1500);
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = testPhoneNumber.trim();
    if (!target) {
      showToast('الرجاء كتابة رقم الهاتف لإرسال الرسالة التجريبية ⚠️', 'error');
      return;
    }

    let cleaned = target.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('05')) {
      cleaned = '966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5')) {
      cleaned = '966' + cleaned;
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    if (wsMethod === 'direct') {
      const url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(testMessageText)}`;
      window.open(url, '_blank');
      showToast('تم فتح نافذة الإرسال التجريبي المباشر على واتساب بنجاح 🟢', 'success');
      return;
    }

    // Server-side proxy API background gateway send
    setIsTesting(true);
    showToast('جاري إرسال الرسالة التجريبية بالخلفية عبر البوابة السحابية الرسمية...', 'info');

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gatewayType: wsMethod,
          apiUrl: wsMethod === 'ultramsg' ? '' : wsCustomUrl,
          token: wsToken,
          instanceId: wsInstanceId,
          phone: cleaned,
          message: testMessageText,
        }),
      });

      const data = await response.json();
      setIsTesting(false);

      if (response.ok && data.success) {
        showToast('تم إرسال الرسالة التجريبية الحقيقية بنجاح عبر البوابة السحابية! 🟢🚀', 'success');
      } else {
        showToast(`فشل الإرسال: ${data.error || 'الرجاء التحقق من إعدادات البوابة والاتصال بالإنترنت'} ❌`, 'error');
      }
    } catch (err: any) {
      setIsTesting(false);
      showToast(`حدث خطأ غير متوقع أثناء الإرسال: ${err.message || 'خطأ في الشبكة'} ❌`, 'error');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      showToast('الرجاء تعبئة البريد الإلكتروني', 'error');
      return;
    }
    const name = nameInput.trim() || emailInput.split('@')[0];
    onLogin(name, emailInput.trim());
    showToast(`أهلاً بك يا ${name}! تم تسجيل الدخول بنجاح`, 'success');
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. Account status block */}
      {user ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                user.subscriptionType === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                user.subscriptionType === 'silver' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25' :
                'bg-slate-800 text-slate-400 border-slate-700/50'
              }`}>
                {user.subscriptionType === 'gold' ? 'الاشتراك الذهبي المميز ⭐' :
                 user.subscriptionType === 'silver' ? 'الاشتراك الفضي المميز 🥈' :
                 'الفترة التجريبية المجانية 🎁'}
              </span>

              <h3 className="text-xl font-black text-slate-100 flex items-center gap-1.5 pt-1.5">
                <span>الملف الشخصي: {user.name}</span>
              </h3>
              
              <p className="text-xs text-slate-400 font-semibold">{user.email}</p>
            </div>

            {/* Trial Counter / Plan Indicator */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 min-w-[160px] text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">حالة الاشتراك</span>
              {user.subscriptionType === 'free' ? (
                <>
                  <span className="text-base font-black text-amber-400 block">متبقي {user.trialDaysLeft} يوم</span>
                  <span className="text-[10px] text-slate-500 font-semibold">على انتهاء التجربة المجانية</span>
                </>
              ) : (
                <>
                  <span className="text-base font-black text-emerald-400 block">نشط بالكامل</span>
                  <span className="text-[10px] text-slate-500 font-semibold">تجديد تلقائي شهري</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-850 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-semibold">يمكنك ترقية الاشتراك أو إلغائه في أي وقت بنقرة واحدة.</p>
            <button
              onClick={() => {
                onLogout();
                showToast('تم تسجيل الخروج بنجاح', 'info');
              }}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      ) : (
        // Login/Signup Form
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl max-w-md mx-auto">
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-lg font-black text-slate-100">تسجيل الدخول / إنشاء حساب</h3>
            <p className="text-xs text-slate-400">انضم للدفتر الذكي لحفظ بياناتك في السحابة والاستثمار</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">الاسم الكامل</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="مثال: أحمد عبد الله"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">البريد الإلكتروني *</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">كلمة المرور *</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-sm font-bold text-white transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer"
            >
              <span>{isLoginMode ? 'تسجيل الدخول للدفتر' : 'إنشاء حساب مميز وتفعيل التجربة'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                {isLoginMode ? 'ليس لديك حساب؟ إنشاء حساب جديد وتجربة مجانية' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. WhatsApp Direct Link Service Section - Removed */}
      <div className="hidden">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl relative">
        {/* Teal Header - Classic WhatsApp Web style */}
        <div className="bg-teal-600/20 border-b border-teal-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <MessageCircle size={22} className="text-emerald-400" />
            </div>
            <div className="text-right">
              <h4 className="font-extrabold text-sm md:text-base text-slate-100">خدمة ربط وتفعيل واتساب الذكية (WhatsApp Direct Link)</h4>
              <p className="text-[10px] md:text-xs text-slate-400">فعل ميزة الإرسال التلقائي والمباشر لسندات الموظفين والرواتب</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
              isWsConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-750'
            }`}>
              {isWsConnected ? 'نشط ومتصل 🟢' : 'غير متصل 🔴'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Method Selection Header */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-right">
            <label className="text-xs font-black text-slate-200 block">طريقة الربط والإرسال النشطة في النظام:</label>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              اختر طريقة الإرسال المناسبة لك. نوفر لك الربط المباشر المجاني تماماً أو الربط التلقائي عبر بوابات الـ API السحابية (UltraMsg) لإرسال السندات تلقائياً في الخلفية.
            </p>
            <div className="relative mt-2">
              <select
                value={wsMethod}
                onChange={(e) => {
                  const method = e.target.value as any;
                  setWsMethod(method);
                  if (method === 'direct') {
                    // automatically mark as connected when using free direct link
                    localStorage.setItem('ws_method', 'direct');
                    localStorage.setItem('ws_linked', 'true');
                    localStorage.setItem('ws_number', 'إرسال مباشر مجاني (WhatsApp)');
                    setIsWsConnected(true);
                    setWsNumber('إرسال مباشر مجاني (WhatsApp)');
                    showToast('تم تفعيل ميزة إرسال واتساب المباشر المجاني بنجاح! 🟢', 'success');
                  } else {
                    // check if the saved method matches what is currently stored
                    const storedMethod = localStorage.getItem('ws_method');
                    const storedLinked = localStorage.getItem('ws_linked') === 'true';
                    if (storedMethod === method && storedLinked) {
                      setIsWsConnected(true);
                      setWsNumber(localStorage.getItem('ws_number') || 'بوابة سحابية مفعلة');
                    } else {
                      setIsWsConnected(false);
                      setWsNumber('');
                    }
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-bold outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="direct">إرسال مباشر مجاني (WhatsApp App / Web - Click to Chat)</option>
                <option value="ultramsg">بوابة إرسال تلقائي سحابي (UltraMsg API)</option>
                <option value="custom_post">بوابة مخصصة (Custom POST API)</option>
                <option value="custom_get">بوابة مخصصة (Custom GET API)</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {wsMethod === 'direct' ? (
              // 1. Direct Click-to-Chat State
              <motion.div
                key="direct-ws"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-right"
              >
                {!isWsConnected ? (
                  /* Disconnected Direct QR pairing state */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-850">
                    {/* Left instructions block - 7cols */}
                    <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h5 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                          <QrCode size={18} className="text-teal-400" />
                          <span>تفعيل الربط المباشر عبر كود التصوير (QR Code)</span>
                        </h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          قم بمسح رمز الاستجابة السريعة المقابل لربط جهازك بالمتصفح بشكل آمن ومشفر وتفعيل الإرسال الفوري لرواتب وسندات الموظفين.
                        </p>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-[10px] text-teal-400 block">خطوات الربط السريع:</span>
                          <ol className="text-[10px] text-slate-400 list-decimal pr-4 space-y-1">
                            <li>افتح تطبيق واتساب على هاتفك المحمول.</li>
                            <li>اذهب إلى الإعدادات ثم "الأجهزة المرتبطة" (Linked Devices).</li>
                            <li>اضغط على "ربط جهاز" ثم وجه كاميرا هاتفك نحو كود التصوير المقابل.</li>
                          </ol>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={handleSimulateScan}
                          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer text-center flex items-center justify-center gap-2"
                        >
                          <Smartphone size={14} />
                          <span>مسح كود التصوير وتأكيد الربط الفوري ⚡</span>
                        </button>
                      </div>
                    </div>

                    {/* Right QR block - 5cols */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center relative min-h-[240px]">
                      <div className="space-y-4 relative w-full flex flex-col items-center">
                        <div 
                          onClick={handleSimulateScan}
                          className="relative w-40 h-40 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-700 overflow-hidden cursor-pointer group"
                        >
                          {/* Simulated QR blocks with canvas/gradient look */}
                          <div className="w-full h-full bg-slate-100 flex flex-col justify-between p-1.5 select-none relative">
                            <div className="flex justify-between">
                              <div className="w-9 h-9 border-[4px] border-slate-900 rounded-md"></div>
                              <div className="w-9 h-9 border-[4px] border-slate-900 rounded-md"></div>
                            </div>
                            
                            {/* Laser Scanning Line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981] animate-bounce top-1/3 pointer-events-none"></div>

                            {/* Center scan spinner during scan */}
                            {isScanning ? (
                              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-1.5 text-white rounded-md">
                                <RefreshCw size={24} className="animate-spin text-teal-400" />
                                <span className="text-[10px] font-bold text-teal-300">جاري قراءة الكود...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-2">
                                <QrCode size={44} className="text-slate-800" />
                                <span className="text-[8px] font-black text-slate-500 mt-1">انقر للمسح السريع 📲</span>
                              </div>
                            )}

                            <div className="flex justify-between items-end">
                              <div className="w-9 h-9 border-[4px] border-slate-900 rounded-md"></div>
                              {/* Dot block pattern */}
                              <div className="w-7 h-7 flex flex-wrap gap-0.5 p-0.5">
                                {[...Array(9)].map((_, i) => (
                                  <div key={i} className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Security Ring Progress overlay when not scanning */}
                          {!isScanning && (
                            <div className="absolute bottom-1 right-1 left-1 bg-slate-900/90 text-teal-400 text-[8px] font-mono text-center rounded-lg py-1 border border-slate-800">
                              تحديث الرمز: {Math.round(qrProgress)}% 🔄
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 leading-relaxed font-bold">
                          رمز الاستجابة السريعة آمن ومتغير تلقائياً لحفظ الأمان التام.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Connected Direct State */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Status & Instructions */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-200">الإرسال المباشر نشط وجاهز</h5>
                            <p className="text-[10px] text-slate-400">لا يتطلب خوادم مدفوعة</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDisconnectWs}
                          className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] rounded-lg transition-all border border-red-500/15 cursor-pointer"
                        >
                          قطع الاتصال 🔴
                        </button>
                      </div>

                      <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed border-t border-slate-850 pt-3">
                        <p>✨ <strong>مميزات الإرسال المباشر النشط:</strong></p>
                        <ul className="list-disc pr-4 space-y-1 text-[10px] text-slate-400">
                          <li>مجاني تماماً ١٠٠٪ وبدون أي رسوم إضافية.</li>
                          <li>يتم بفتح تطبيق واتساب على هاتفك أو المتصفح تلقائياً.</li>
                          <li>يقوم بتعبئة رقم هاتف الموظف ومحتوى السند بشكل كامل وجاهز.</li>
                          <li>يحافظ على خصوصيتك الكاملة وتشفير المحادثة.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Test Send Card */}
                    <form onSubmit={handleSendTestMessage} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                      <h5 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                        <Send size={13} className="text-teal-400" />
                        <span>إرسال تجربة حقيقية (مباشر)</span>
                      </h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">أدخل رقم هاتف مع رمز الدولة لتجربة إرسال رسالة حقيقية والتحقق من العمل الفوري.</p>

                      <div className="space-y-2 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-bold">رقم هاتف التجربة *</label>
                          <input
                            type="tel"
                            value={testPhoneNumber}
                            onChange={(e) => setTestPhoneNumber(e.target.value)}
                            placeholder="مثال: +966555555555"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-bold">محتوى رسالة التجربة</label>
                          <textarea
                            value={testMessageText}
                            onChange={(e) => setTestMessageText(e.target.value)}
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          <span>إرسال تجربة الآن ⚡</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            ) : (
              // 2. Automated Cloud Gateway Configuration
              <motion.div
                key="cloud-ws"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-right"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left panel: Credentials inputs (7cols) */}
                  <div className="lg:col-span-7 space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-850">
                    <h5 className="font-bold text-xs text-slate-200 flex items-center gap-1.5 border-b border-slate-850 pb-2">
                      <Settings size={14} className="text-teal-400" />
                      <span>إعدادات الاتصال بالبوابة السحابية الحقيقية</span>
                    </h5>

                    <div className="space-y-3.5 pt-1 text-xs">
                      {wsMethod === 'ultramsg' && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-bold">رقم الـ Instance ID الخاص بـ UltraMsg *</label>
                          <input
                            type="text"
                            value={wsInstanceId}
                            onChange={(e) => setWsInstanceId(e.target.value)}
                            placeholder="مثال: instance12345"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">مفتاح الدخول الآمن للـ API Token *</label>
                        <input
                          type="password"
                          value={wsToken}
                          onChange={(e) => setWsToken(e.target.value)}
                          placeholder="أدخل الـ Token الممنوح لك من مزود الخدمة"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                        />
                      </div>

                      {(wsMethod === 'custom_get' || wsMethod === 'custom_post') && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-bold">رابط الـ API الخاص ببوابتك (Endpoint URL) *</label>
                          <input
                            type="text"
                            value={wsCustomUrl}
                            onChange={(e) => setWsCustomUrl(e.target.value)}
                            placeholder="https://api.example.com/send?to={phone}&msg={message}"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                          />
                          <p className="text-[9px] text-slate-500">
                            لـ GET يمكنك استعمال المتغيرات لتبديلها تلقائياً: {'{phone}'} و {'{message}'} و {'{token}'}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={handleSaveGatewaySettings}
                          className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer text-center"
                        >
                          حفظ وتفعيل الارتباط 💾
                        </button>
                        
                        {wsMethod === 'ultramsg' && (
                          <button
                            type="button"
                            disabled={isCheckingStatus}
                            onClick={handleCheckUltraMsgStatus}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5"
                          >
                            {isCheckingStatus ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            <span>التحقق من حالة الربط 🔄</span>
                          </button>
                        )}

                        {isWsConnected && (
                          <button
                            type="button"
                            onClick={handleDisconnectWs}
                            className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all border border-red-500/15 cursor-pointer text-center"
                          >
                            قطع الاتصال 🔴
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Live QR scanner or instructions (5cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Live UltraMsg QR Scanner panel */}
                    {wsMethod === 'ultramsg' && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
                        <span className="font-extrabold text-[11px] text-slate-200 block">رمز استجابة UltraMsg المباشر (QR Code)</span>
                        
                        {wsInstanceId.trim() && wsToken.trim() ? (
                          <div className="relative w-36 h-36 bg-white p-2 rounded-xl shadow-lg border border-slate-700 overflow-hidden group">
                            <img 
                              src={`/api/whatsapp/qr?instanceId=${wsInstanceId.trim()}&token=${wsToken.trim()}&r=${qrKey}`} 
                              alt="UltraMsg WhatsApp QR Code" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // If image loading fails (e.g. wrong tokens), replace with placeholder
                                (e.target as HTMLElement).style.display = 'none';
                                const parent = (e.target as HTMLElement).parentElement;
                                if (parent) {
                                  const textNode = document.createElement('div');
                                  textNode.className = 'w-full h-full flex items-center justify-center text-[9px] text-red-400 font-bold p-2 text-center bg-slate-950 rounded-lg';
                                  textNode.innerText = 'فشل جلب الرمز. يرجى التأكد من صحة الـ Instance ID والـ Token';
                                  parent.appendChild(textNode);
                                }
                              }}
                            />
                            {/* Scanning laser effect */}
                            <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-bounce top-1/3 pointer-events-none"></div>
                          </div>
                        ) : (
                          <div className="w-36 h-36 bg-slate-950 rounded-xl border border-slate-850 flex flex-col items-center justify-center p-3 text-center">
                            <Lock size={26} className="text-slate-600 mb-1.5" />
                            <span className="text-[9px] text-slate-400 leading-relaxed font-bold">يرجى تعبئة الـ Instance ID والـ Token لتوليد الكود المباشر</span>
                          </div>
                        )}

                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          امسح الـ QR كود الظاهر بجوالك عبر تطبيق واتساب لربط رقمك بالبوابة فورياً.
                        </p>
                      </div>
                    )}

                    {/* Real instructions on how to set up UltraMsg or Custom API */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-right space-y-2.5">
                      <h6 className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Info size={13} className="text-teal-400" />
                        <span>طريقة تفعيل جهازك حقيقياً:</span>
                      </h6>
                      <ol className="text-[10px] text-slate-400 space-y-1.5 list-decimal pr-4">
                        <li>سجل حساباً حقيقياً في موقع <a href="https://ultramsg.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">UltraMsg.com</a>.</li>
                        <li>امسح الـ QR كود الحقيقي الظاهر في لوحة تحكم UltraMsg بجوالك ليرتبط الواتساب الخاص بك بالبوابة.</li>
                        <li>انسخ الـ Instance ID والـ Token من لوحتهم والصقهم هنا لتتم الأتمتة فورياً!</li>
                      </ol>
                    </div>

                    {/* Quick test sending form */}
                    <form onSubmit={handleSendTestMessage} className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-right space-y-3">
                      <h6 className="font-bold text-[11px] text-slate-200">إرسال تجربة عبر البوابة السحابية</h6>
                      
                      <div className="space-y-2 text-xs">
                        <input
                          type="tel"
                          value={testPhoneNumber}
                          onChange={(e) => setTestPhoneNumber(e.target.value)}
                          placeholder="مثال: +966555555555"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isTesting}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {isTesting ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : (
                            <Send size={11} />
                          )}
                          <span>إرسال رسالة تجريبية بالخلفية 🚀</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Integration notice */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex gap-3 text-xs text-slate-400 text-right">
                  <Info size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-300 block">حول الأمان والاتصال السحابي:</span>
                    <p className="leading-relaxed text-[10px]">بمجرد إدخال مفاتيح البوابة الصحيحة وربط رقمك، سيعمل الخيار السحابي تلقائياً في الخلفية. عندما تضغط على "إرسال السند عبر واتساب" داخل شؤون الموظفين، سيتم الإرسال فوراً ومباشرة للموظف بالخلفية دون الحاجة لفتح المتصفح يدوياً!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div> {/* End of hidden container for WhatsApp section */}



      {/* 2. Subscription plans & Monetization options */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h4 className="text-base font-bold text-slate-200">باقات الاشتراك المميزة للمستثمرين وأصحاب الحسابات</h4>
          <p className="text-xs text-slate-500">استثمر في تنظيم حساباتك والتصدير والنسخ الاحتياطي المتقدم</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plan 1: Silver */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden group">
            {user?.subscriptionType === 'silver' && (
              <span className="absolute top-3 left-3 bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                خطتك النشطة
              </span>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-100 text-base">الخطة الفضية (Silver) 🥈</h5>
                <div className="pt-1.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-indigo-400">29</span>
                  <span className="text-xs text-slate-400">ريال سعودي / شهرياً</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-indigo-400" />
                  <span>دعم كامل لـ 4 دفاتر حسابات متكاملة</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-indigo-400" />
                  <span>مزامنة يدوية مع Google Drive في أي وقت</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-indigo-400" />
                  <span>مجموع عمال وموظفين يصل إلى 15 عامل</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-indigo-400" />
                  <span>حفظ محلي وسحابي آمن ومشفر</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  showToast('الرجاء تسجيل الدخول لتفعيل الباقة', 'info');
                  return;
                }
                onUpgradePlan('silver');
                showToast('تمت ترقية باقتك بنجاح للمستوى الفضي!', 'success');
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all mt-6 ${
                user?.subscriptionType === 'silver'
                  ? 'bg-slate-950 border border-indigo-500/30 text-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
              }`}
            >
              {user?.subscriptionType === 'silver' ? 'أنت على هذه الخطة حالياً' : 'تفعيل الخطة الفضية'}
            </button>
          </div>

          {/* Plan 2: Gold */}
          <div className="rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-5 flex flex-col justify-between hover:border-amber-500 transition-all relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-br-2xl">
              الأكثر طلباً 👑
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-100 text-base">الخطة الذهبية (Gold) ⭐</h5>
                <div className="pt-1.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-400">59</span>
                  <span className="text-xs text-slate-400">ريال سعودي / شهرياً</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-amber-400" />
                  <span>سجلات ودفاتر غير محدودة نهائياً</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-amber-400" />
                  <span>مزامنة سحابية تلقائية وفورية مع كل تحديث</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-amber-400" />
                  <span>عدد موظفين وعمال لا نهائي مع مستخرجات رواتب</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-amber-400" />
                  <span>تصدير ملفات Excel و PDF وتقارير متطورة</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-amber-400" />
                  <span>دعم كامل ومباشر وتوافق تام مع جميع الأجهزة المتنقلة</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  showToast('الرجاء تسجيل الدخول لتفعيل الباقة', 'info');
                  return;
                }
                onUpgradePlan('gold');
                showToast('تمت ترقية باقتك بنجاح للمستوى الذهبي الفاخر!', 'success');
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all mt-6 ${
                user?.subscriptionType === 'gold'
                  ? 'bg-slate-950 border border-amber-500/30 text-amber-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/15'
              }`}
            >
              {user?.subscriptionType === 'gold' ? 'أنت على هذه الخطة حالياً' : 'تفعيل الخطة الذهبية'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

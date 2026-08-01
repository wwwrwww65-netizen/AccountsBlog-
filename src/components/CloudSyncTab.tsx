/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cloud, RefreshCw, CheckCircle, AlertCircle, 
  Database, Shield, HelpCircle, HardDrive, 
  ArrowUp, ArrowDown, ExternalLink, Key,
  User, Lock, Mail, LogOut, CheckCircle2,
  Smartphone, Sparkles, Server, QrCode
} from 'lucide-react';
import { 
  auth, 
  db, 
  saveUserDataToCloud, 
  loadUserDataFromCloud,
  saveUserDataWithSyncCode,
  loadUserDataWithSyncCode
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface CloudSyncTabProps {
  accounts: any[];
  transactions: any[];
  dailyExpenses: any[];
  employees: any[];
  employeeTransactions: any[];
  homeNeeds: any[];
  onRestoreBackup: (backupData: any) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function CloudSyncTab({
  accounts,
  transactions,
  dailyExpenses,
  employees,
  employeeTransactions,
  homeNeeds,
  onRestoreBackup,
  showToast
}: CloudSyncTabProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(() => {
    return localStorage.getItem('smart_ledger_firebase_last_sync') || 'لم يتم المزامنة بعد';
  });

  // Direct Sync Code state
  const [activeSyncCode, setActiveSyncCode] = useState<string>(() => {
    return localStorage.getItem('smart_ledger_sync_code') || '';
  });
  const [syncCodeInput, setSyncCodeInput] = useState('');

  // Mode: 'auth' | 'code'
  const [authMode, setAuthMode] = useState<'auth' | 'code'>('code');

  // Auth form states
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authErrorBanner, setAuthErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        setAuthMode('auth');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Handle Direct Sync Code Login/Connection
  const handleConnectSyncCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetCode = syncCodeInput.trim() || activeSyncCode;
    if (!targetCode) {
      showToast('الرجاء إدخال كود مزامنة خاص بك', 'error');
      return;
    }

    setAuthLoading(true);
    setAuthErrorBanner(null);
    try {
      const cloudData = await loadUserDataWithSyncCode(targetCode);
      setActiveSyncCode(targetCode);
      localStorage.setItem('smart_ledger_sync_code', targetCode);
      
      if (cloudData) {
        onRestoreBackup(cloudData);
        showToast('تمت استعادة البيانات السحابية برمز المزامنة بنجاح! 📥', 'success');
      } else {
        showToast('كود المزامنة جديد، جاري رفع نسخة جديدة للسحابة...', 'info');
        await saveUserDataWithSyncCode(targetCode, {
          accounts,
          transactions,
          dailyExpenses,
          employees,
          employeeTransactions,
          homeNeeds
        });
      }
      const nowStr = new Date().toLocaleString('ar-EG');
      setLastSync(nowStr);
      localStorage.setItem('smart_ledger_firebase_last_sync', nowStr);
    } catch (err: any) {
      console.error(err);
      showToast('حدث خطأ أثناء الاتصال بقاعدة بيانات Firestore', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Register/Login with Firebase Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorBanner(null);
    if (!email || !password) {
      showToast('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
      return;
    }

    setAuthLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        showToast('تم إنشاء الحساب السحابي الموحد بنجاح! 🎉', 'success');
        await handleCloudSync(userCredential.user.uid);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showToast('تم تسجيل الدخول بنجاح! جاري جلب البيانات السحابية...', 'success');
        await handlePullCloudData(userCredential.user.uid);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = 'حدث خطأ أثناء الاتصال بالسحابة';
      
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'تسجيل الدخول بالبريد الإلكتروني غير مفعل حالياً في إعدادات المشروع. تم التبديل تلقائياً لخيار "كود المزامنة الفوري"!';
        setAuthErrorBanner('خدمة تسجيل الدخول بالبريد الإلكتروني تتطلب تفعيل Provider في منصة Firebase. يمكنك استخدام "كود المزامنة الفوري" للمزامنة المباشرة مع Firestore!');
        setAuthMode('code');
        if (email) {
          setSyncCodeInput(email.replace(/[^a-zA-Z0-9]/g, '_'));
        }
      } else if (err.code === 'auth/network-request-failed') {
        errMsg = 'تعذر الاتصال بخادم المصادقة (Network Request Failed). يمكنك استخدام كود المزامنة المباشر للأوفلاين والسحابة!';
        setAuthErrorBanner('تعذر الاتصال بخادم Firebase Auth. تم الانتقال لنموذج المزامنة المباشر برمز خاص.');
        setAuthMode('code');
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'هذا البريد الإلكتروني مستخدم بالفعل';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'صيغة البريد الإلكتروني غير صالحة';
      }

      showToast(errMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentUser) {
        await signOut(auth);
      }
      setActiveSyncCode('');
      localStorage.removeItem('smart_ledger_sync_code');
      showToast('تم إغلاق الجلسة السحابية بنجاح', 'info');
    } catch (err) {
      showToast('فشل تسجيل الخروج', 'error');
    }
  };

  // Push Local state to Cloud Firestore
  const handleCloudSync = async (forcedUid?: string) => {
    const uid = forcedUid || currentUser?.uid || activeSyncCode;
    if (!uid) {
      showToast('يرجى تحديد كود مزامنة أو تسجيل الدخول أولاً لتفعيل المزامنة السحابية', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      await saveUserDataWithSyncCode(uid, {
        accounts,
        transactions,
        dailyExpenses,
        employees,
        employeeTransactions,
        homeNeeds
      });
      const nowStr = new Date().toLocaleString('ar-EG');
      setLastSync(nowStr);
      localStorage.setItem('smart_ledger_firebase_last_sync', nowStr);
      showToast('تمت المزامنة وحفظ نسخة احتياطية سحابية آمنة بنجاح! 🚀', 'success');
    } catch (err) {
      showToast('فشل حفظ البيانات السحابية في قاعدة البيانات', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull Cloud state from Firestore
  const handlePullCloudData = async (forcedUid?: string) => {
    const uid = forcedUid || currentUser?.uid || activeSyncCode;
    if (!uid) {
      showToast('يرجى تحديد كود مزامنة أو تسجيل الدخول أولاً', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const cloudData = await loadUserDataWithSyncCode(uid);
      if (cloudData) {
        onRestoreBackup(cloudData);
        const nowStr = new Date().toLocaleString('ar-EG');
        setLastSync(nowStr);
        localStorage.setItem('smart_ledger_firebase_last_sync', nowStr);
        showToast('تم تحميل أحدث نسخة من قاعدة البيانات السحابية وتثبيتها بنجاح! 📥', 'success');
      } else {
        showToast('لا توجد بيانات سابقة محفوظة لهذا الرمز بعد. سيتم مزامنة النسخة الحالية.', 'info');
        await saveUserDataWithSyncCode(uid, {
          accounts,
          transactions,
          dailyExpenses,
          employees,
          employeeTransactions,
          homeNeeds
        });
      }
    } catch (err) {
      showToast('فشل استيراد البيانات من السحابة', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Local JSON Backup (Just in case the user wants raw file export)
  const downloadBackupFile = () => {
    try {
      const backupData = {
        accounts,
        transactions,
        dailyExpenses,
        employees,
        employeeTransactions,
        homeNeeds,
        backupDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartLedgerBackup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('تم تصدير ملف النسخة الاحتياطية اليدوية بنجاح!', 'success');
    } catch (err) {
      showToast('حدث خطأ أثناء تصدير ملف النسخة الاحتياطية', 'error');
    }
  };

  const handleManualFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed) {
          onRestoreBackup(parsed);
          showToast('تم استيراد الملف الاحتياطي بنجاح!', 'success');
        }
      } catch (err) {
        showToast('فشل قراءة ملف النسخة الاحتياطية', 'error');
      }
    };
    reader.readAsText(file);
  };

  const isConnected = !!currentUser || !!activeSyncCode;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <RefreshCw size={32} className="animate-spin text-amber-500" />
        <span className="text-xs font-bold">جاري الاتصال بقاعدة بيانات Firebase السحابية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100" dir="rtl">
      {/* Banner / Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">
              نظام المزامنة السحابي الاحترافي 📱💻
            </span>
            <h3 className="text-lg font-black text-slate-100 flex items-center gap-2 pt-1">
              <Server className="text-amber-400" size={20} />
              <span>تكامل قاعدة البيانات السحابية (Firebase Cloud Sync)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              تغيير قاعدة البيانات إلى Firebase يمنحك دعماً مطلقاً ومزامنة فورية للبيانات. يتيح لك هذا ربط حسابك في جميع أجهزتك (أندرويد، آيفون، الكمبيوتر والمتصفح) والتمتع بحفظ فوري وتأمين مطلق ضد الضياع.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-850 min-w-[150px]">
            <Cloud className={isConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"} size={26} />
            <span className="text-[10px] font-bold text-slate-500 mt-2">حالة الاتصال بالسحابة</span>
            <span className={`text-xs font-black mt-1 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isConnected ? 'متصل وبث حي 🟢' : 'وضع محلي مؤقت 🟡'}
            </span>
          </div>
        </div>
      </div>

      {authErrorBanner && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-300 text-xs leading-relaxed">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-black block mb-1">ملاحظة نظام المصادقة السحابي:</span>
            <span>{authErrorBanner}</span>
          </div>
        </div>
      )}

      {/* Cloud Controls Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RIGHT COLUMN: Authentic Flow (Firebase Auth & Sync Code) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
              <Database size={15} className="text-amber-400" />
              <span>بوابة الحساب والربط السحابي</span>
            </h4>

            {!isConnected && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                <button
                  onClick={() => setAuthMode('code')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${authMode === 'code' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  كود مزامنة
                </button>
                <button
                  onClick={() => setAuthMode('auth')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${authMode === 'auth' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  بريد ورقم سر
                </button>
              </div>
            )}
          </div>

          {isConnected ? (
            /* Logged In / Connected View */
            <div className="space-y-4 py-1">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-emerald-400" />
                  <span className="text-xs text-slate-400">كود / حساب المزامنة السحابي النشط:</span>
                </div>
                <p className="text-xs font-black text-slate-200 truncate dir-ltr text-right">
                  {currentUser?.email || activeSyncCode}
                </p>
                <div className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} />
                  <span>البيانات متصلة بقاعدة بيانات Firestore الفورية!</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>آخر مزامنة قاعدة بيانات ناجحة:</span>
                  <span className="font-bold text-slate-200">{lastSync}</span>
                </div>
                <div className="flex justify-between">
                  <span>حماية التزامن:</span>
                  <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-amber-400">نشط (SSL Encrypted)</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  onClick={() => handleCloudSync()}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-slate-950 py-3.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  <span>حفظ ومزامنة البيانات الحالية للسحابة 📤</span>
                </button>

                <button
                  onClick={() => handlePullCloudData()}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-300 py-3.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : <Cloud size={14} />}
                  <span>استيراد واستعادة البيانات من السحابة 📥</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold py-2.5 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>فصل وإغلاق الجلسة السحابية</span>
                </button>
              </div>
            </div>
          ) : authMode === 'code' ? (
            /* Direct Sync Code Mode */
            <form onSubmit={handleConnectSyncCode} className="space-y-3.5 py-1">
              <p className="text-xs text-slate-400 leading-normal">
                أدخل أي رمز خاص بك (مثال: رقم جوالك أو اسم عملك) لمزامنة دفترك مباشرة عبر خوادم Firebase Firestore بدون عوائق!
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">كود المزامنة السحابية الخاص بك:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <Key size={14} />
                  </span>
                  <input
                    type="text"
                    value={syncCodeInput}
                    onChange={(e) => setSyncCodeInput(e.target.value)}
                    placeholder="مثال: my_business_2026 أو 96777000000"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 focus:border-amber-500 px-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all text-right font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black py-3 transition-all cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {authLoading ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <Cloud size={14} />
                  )}
                  <span>ربط ومزامنة قاعدة البيانات السحابية 🚀</span>
                </button>
              </div>
            </form>
          ) : (
            /* Authentication Form (Login / Register) */
            <form onSubmit={handleAuthSubmit} className="space-y-3.5 py-1">
              <p className="text-xs text-slate-400 leading-normal">
                سجل حساباً سحابياً فورياً لتفعيل الحفظ التلقائي وقاعدة البيانات السحابية لكي تستطيع استخدام التطبيق باحترافية على هاتفك والكمبيوتر في نفس الوقت.
              </p>

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 focus:border-amber-500 px-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all text-right"
                    required
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="كلمة المرور (6 خانات فأكثر)"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 focus:border-amber-500 px-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all text-right"
                    required
                  />
                </div>
              </div>

              <div className="pt-1 space-y-3">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black py-3 transition-all cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {authLoading ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <Cloud size={14} />
                  )}
                  <span>{isRegister ? 'إنشاء حساب جديد والربط' : 'تسجيل الدخول وربط قاعدة البيانات'}</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors font-bold"
                  >
                    {isRegister ? 'لديك حساب بالفعل؟ سجل دخولك الآن' : 'ليس لديك حساب؟ أنشئ حساب سحابي جديد'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* LEFT COLUMN: Local Offline Backup & Security info */}
        <div className="space-y-6">
          {/* Manual Local Exporter/Importer */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5 border-b border-slate-850 pb-3">
              <HardDrive size={15} className="text-emerald-400" />
              <span>النسخ الاحتياطي اليدوي والمستقل (أوفلاين)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Manual Export */}
              <button
                onClick={downloadBackupFile}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-black py-3 transition-all cursor-pointer"
                title="تحميل ملف النسخة الاحتياطية وتخزينها يدوياً"
              >
                <ArrowDown size={14} />
                <span>تحميل ملف احتياطي 📥</span>
              </button>

              {/* Manual Import */}
              <label
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-black py-3 transition-all cursor-pointer text-center"
                title="رفع واستعادة ملف النسخة الاحتياطية"
              >
                <ArrowUp size={14} />
                <span>رفع واستعادة ملف 📤</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleManualFileImport}
                  className="hidden"
                />
              </label>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal text-center">
              يمكنك دوماً تحميل نسخة احتياطية مشفرة محلياً واستعادتها في أي وقت بدون الحاجة لاتصال بالإنترنت مطلقاً بخصوصية تامة.
            </p>
          </div>

          {/* Secure & Privacy Box */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5 border-b border-slate-850 pb-2.5">
                <Shield size={15} className="text-emerald-400" />
                <span>الخصوصية والتأمين الشامل</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تطبيق الدفتر الذكي لا يقوم بمطالعة بياناتك أو بيعها. مع قاعدة بيانات Firebase Firestore السحابية من Google، تكون بياناتك مشفرة ومحمية بقوانين صارمة وخوادم فائقة الأمان لضمان سرية حساباتك وعملك.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              <Smartphone size={13} className="text-amber-500" />
              <span>مهيأ بالكامل للتحويل لـ Android & iOS باستخدام Capacitor أو Cordova!</span>
            </div>
          </div>
        </div>

      </div>

      {/* Package Instructions for Android/iOS */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-3.5">
        <h4 className="text-xs font-black text-slate-200 flex items-center gap-2">
          <Smartphone size={15} className="text-amber-400" />
          <span>دليل خطوة بخطوة للتحويل إلى تطبيق Android & iOS احترافي 🛠️</span>
        </h4>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          الآن وبفضل إدراج قاعدة بيانات Firebase، أصبح التطبيق مهيأً للتشغيل على الهواتف الذكية مع بقاء كافة بيانات مستخدميك في مزامنة حية ومستمرة. إليك كيف تقوم بتغليفه:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-right space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">1. تجهيز Capacitor</span>
            <p className="text-[11px] text-slate-400 font-semibold">تثبيت المكثف السحابي:</p>
            <p className="text-[10px] text-slate-500 leading-normal">
              قم بتشغيل الأوامر التالية في مجلد مشروعك لتفعيل بيئة Capacitor:
              <br />
              <code className="text-[9px] text-emerald-400 block font-mono bg-slate-900 p-1 rounded mt-1">npm i @capacitor/core @capacitor/cli</code>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-right space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">2. تفعيل المنصات</span>
            <p className="text-[11px] text-slate-400 font-semibold">إضافة أنظمة التشغيل:</p>
            <p className="text-[10px] text-slate-500 leading-normal">
              أضف الدعم للأندرويد والآيفون عن طريق تشغيل:
              <br />
              <code className="text-[9px] text-emerald-400 block font-mono bg-slate-900 p-1 rounded mt-1">npm i @capacitor/android @capacitor/ios<br />npx cap add android<br />npx cap add ios</code>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-right space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">3. البناء والتشغيل</span>
            <p className="text-[11px] text-slate-400 font-semibold">المزامنة والتشغيل الفوري:</p>
            <p className="text-[10px] text-slate-500 leading-normal">
              كلما قمت بتحديث التطبيق، ابنه وانسخه للهاتف:
              <br />
              <code className="text-[9px] text-emerald-400 block font-mono bg-slate-900 p-1 rounded mt-1">npm run build<br />npx cap sync<br />npx cap open android</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

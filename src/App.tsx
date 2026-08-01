/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, ArrowUpRight, ArrowDownLeft, 
  Wallet, FileText, Download, Upload, RefreshCw, 
  HelpCircle, ChevronDown, CheckCircle2, AlertCircle, Info, Trash2,
  Users, Home, Cloud, Lock, Smartphone, Sparkles, LogOut, Check, CreditCard,
  UserPlus, Calendar, Mail, ShieldCheck, Tag, X, Printer, Sun, Moon, MessageCircle,
  SlidersHorizontal, Filter, Share2, Copy, ExternalLink, LayoutDashboard
} from 'lucide-react';

// Types
import { 
  Account, Transaction, TransactionType, 
  DailyExpense, Employee, EmployeeTransaction, HomeNeed 
} from './types';

// Initial Data
import { 
  initialAccounts, initialTransactions, CATEGORIES,
  initialDailyExpenses, initialEmployees, initialEmployeeTransactions, initialHomeNeeds
} from './initialData';

// Modals
import AddAccountModal from './components/AddAccountModal';
import AddTransactionModal from './components/AddTransactionModal';
import AccountDetailsModal from './components/AccountDetailsModal';
import { PwaInstallHelpModal } from './components/PwaInstallHelpModal';
import ShareWorkModal from './components/ShareWorkModal';
import SharedImportModal from './components/SharedImportModal';

// Tabs Components
import DashboardTab from './components/DashboardTab';
import DailyExpensesTab from './components/DailyExpensesTab';
import EmployeesTab from './components/EmployeesTab';
import HomeEssentialsTab from './components/HomeEssentialsTab';
import CloudSyncTab from './components/CloudSyncTab';
import SubscriptionTab from './components/SubscriptionTab';
import ReportsTab from './components/ReportsTab';
import LoginScreen from './components/LoginScreen';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'debts' | 'expenses' | 'employees' | 'home' | 'reports' | 'cloud' | 'subscription'>('dashboard');
  const [selectedDashboardCurrency, setSelectedDashboardCurrency] = useState<'SAR' | 'YER' | 'USD'>('SAR');

  // Theme Mode State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('smart_ledger_theme') as 'dark' | 'light') || 'dark';
  });

  // Offline and PWA states
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof window !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [isPwaHelpOpen, setIsPwaHelpOpen] = useState<boolean>(false);

  // Sharing and Import States
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string>('');
  const [sharedImportData, setSharedImportData] = useState<any>(null);
  const [showSharedImportModal, setShowSharedImportModal] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('smart_ledger_theme', themeMode);
  }, [themeMode]);

  // --- Core State Loaded from LocalStorage ---
  // 1. Debts Ledger (People Accounts)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('smart_ledger_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('smart_ledger_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  // 2. Daily Expenses
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>(() => {
    const saved = localStorage.getItem('smart_ledger_daily_expenses');
    return saved ? JSON.parse(saved) : initialDailyExpenses;
  });

  // 3. Employee Management
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('smart_ledger_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [employeeTransactions, setEmployeeTransactions] = useState<EmployeeTransaction[]>(() => {
    const saved = localStorage.getItem('smart_ledger_employee_txs');
    return saved ? JSON.parse(saved) : initialEmployeeTransactions;
  });

  // 4. Home Essentials Checklist
  const [homeNeeds, setHomeNeeds] = useState<HomeNeed[]>(() => {
    const saved = localStorage.getItem('smart_ledger_home_needs');
    return saved ? JSON.parse(saved) : initialHomeNeeds;
  });

  // 5. Subscription & Premium User state
  const [user, setUser] = useState<{
    email: string;
    name: string;
    isPremium: boolean;
    trialDaysLeft: number;
    subscriptionType: 'free' | 'silver' | 'gold';
  } | null>(() => {
    const saved = localStorage.getItem('smart_ledger_user');
    return saved ? JSON.parse(saved) : {
      email: 'investor@smartledger.com',
      name: 'مستثمر تجريبي',
      isPremium: false,
      trialDaysLeft: 14,
      subscriptionType: 'free'
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('smart_ledger_logged_in') === 'true';
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debt' | 'obligation'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('balance');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Advanced Search & Filter States
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [searchInNotes, setSearchInNotes] = useState<boolean>(false);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [amountScope, setAmountScope] = useState<'balance' | 'transaction'>('balance');

  // Modal control states
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedAccountIdForDetails, setSelectedAccountIdForDetails] = useState<string | null>(null);
  const [preselectedAccountIdForAddTx, setPreselectedAccountIdForAddTx] = useState<string | undefined>(undefined);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('smart_ledger_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('smart_ledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('smart_ledger_daily_expenses', JSON.stringify(dailyExpenses));
  }, [dailyExpenses]);

  useEffect(() => {
    localStorage.setItem('smart_ledger_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('smart_ledger_employee_txs', JSON.stringify(employeeTransactions));
  }, [employeeTransactions]);

  useEffect(() => {
    localStorage.setItem('smart_ledger_home_needs', JSON.stringify(homeNeeds));
  }, [homeNeeds]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smart_ledger_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smart_ledger_user');
    }
  }, [user]);

  // Show auto-dismissing feedback toasts
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // --- Network status & PWA Installation Handlers ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('🟢 تم استعادة الاتصال بالإنترنت - السحابة جاهزة ومفعّلة', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('⚠️ تم الانتقال لوضع العمل دون اتصال بالشبكة (أوفلاين) - البيانات مؤمنة بالكامل', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture the PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // --- Share Live Data & Load Share Handlers ---
  useEffect(() => {
    // Check if we are already in preview mode by checking pre-saved original data
    const hasPreviewBackup = localStorage.getItem('smart_ledger_pre_preview_backup');
    if (hasPreviewBackup) {
      setIsPreviewMode(true);
    }

    const params = new URLSearchParams(window.location.search);
    const sharedDataParam = params.get('shared_data');
    if (sharedDataParam) {
      try {
        // Decode base64 UTF-8 safely, replacing spaces with '+' since URL parsing decodes '+' to ' '
        const safeBase64 = sharedDataParam.replace(/ /g, '+');
        const decodedJson = decodeURIComponent(escape(window.atob(safeBase64)));
        const parsed = JSON.parse(decodedJson);
        if (parsed && (parsed.accounts || parsed.transactions)) {
          setSharedImportData(parsed);
          setShowSharedImportModal(true);
        }
      } catch (err) {
        console.error("Failed to decode shared data", err);
        showToast('رابط المشاركة السحابي تالف أو غير صالح للتحميل ⚠️', 'error');
      }
    }
  }, []);

  const generateShareLink = () => {
    try {
      const dataToShare = {
        accounts,
        transactions,
        dailyExpenses,
        employees,
        employeeTransactions,
        homeNeeds,
        user: user ? { ...user, isPremium: true } : {
          email: 'shared@smartledger.com',
          name: 'صديق مشترك',
          isPremium: true,
          trialDaysLeft: 30,
          subscriptionType: 'gold' as const
        }
      };
      
      const jsonStr = JSON.stringify(dataToShare);
      // Encode to UTF-8 safe base64
      const base64Data = window.btoa(unescape(encodeURIComponent(jsonStr)));
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?shared_data=${encodeURIComponent(base64Data)}`;
      setGeneratedShareUrl(shareUrl);
      setIsShareModalOpen(true);

      // Attempt clip write
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast('تم توليد ونسخ رابط مشاركة الدفتر والبيانات الحية بنجاح! 🎉', 'success');
        }).catch(() => {
          showToast('تم توليد رابط المشاركة بنجاح! انسخه من النافذة', 'info');
        });
      } else {
        showToast('تم توليد رابط المشاركة بنجاح! انسخه من النافذة', 'info');
      }
    } catch (err) {
      showToast('فشل في توليد رابط المشاركة ⚠️', 'error');
    }
  };

  const handleAcceptSharedData = () => {
    if (!sharedImportData) return;
    
    // Backup current local data first
    const currentLocalBackup = {
      accounts,
      transactions,
      dailyExpenses,
      employees,
      employeeTransactions,
      homeNeeds,
      user
    };
    localStorage.setItem('smart_ledger_pre_share_backup', JSON.stringify(currentLocalBackup));

    // Load new data
    if (sharedImportData.accounts) setAccounts(sharedImportData.accounts);
    if (sharedImportData.transactions) setTransactions(sharedImportData.transactions);
    if (sharedImportData.dailyExpenses) setDailyExpenses(sharedImportData.dailyExpenses);
    if (sharedImportData.employees) setEmployees(sharedImportData.employees);
    if (sharedImportData.employeeTransactions) setEmployeeTransactions(sharedImportData.employeeTransactions);
    if (sharedImportData.homeNeeds) setHomeNeeds(sharedImportData.homeNeeds);
    if (sharedImportData.user) setUser(sharedImportData.user);

    setShowSharedImportModal(false);
    setIsPreviewMode(false);
    showToast('تم استيراد وحفظ بيانات صديقك بنجاح! دفترك مُحدث الآن 📥', 'success');

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handlePreviewSharedData = () => {
    if (!sharedImportData) return;

    // Back up current state
    const originalLocal = {
      accounts,
      transactions,
      dailyExpenses,
      employees,
      employeeTransactions,
      homeNeeds,
      user
    };
    localStorage.setItem('smart_ledger_pre_preview_backup', JSON.stringify(originalLocal));

    // Load shared data
    if (sharedImportData.accounts) setAccounts(sharedImportData.accounts);
    if (sharedImportData.transactions) setTransactions(sharedImportData.transactions);
    if (sharedImportData.dailyExpenses) setDailyExpenses(sharedImportData.dailyExpenses);
    if (sharedImportData.employees) setEmployees(sharedImportData.employees);
    if (sharedImportData.employeeTransactions) setEmployeeTransactions(sharedImportData.employeeTransactions);
    if (sharedImportData.homeNeeds) setHomeNeeds(sharedImportData.homeNeeds);
    if (sharedImportData.user) setUser(sharedImportData.user);

    setIsPreviewMode(true);
    setShowSharedImportModal(false);
    showToast('تم تفعيل وضع المعاينة المؤقتة لبيانات صديقك! 🔍', 'info');

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleExitPreviewMode = () => {
    const savedOriginal = localStorage.getItem('smart_ledger_pre_preview_backup');
    if (savedOriginal) {
      try {
        const parsed = JSON.parse(savedOriginal);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.dailyExpenses) setDailyExpenses(parsed.dailyExpenses);
        if (parsed.employees) setEmployees(parsed.employees);
        if (parsed.employeeTransactions) setEmployeeTransactions(parsed.employeeTransactions);
        if (parsed.homeNeeds) setHomeNeeds(parsed.homeNeeds);
        if (parsed.user) setUser(parsed.user);
        
        localStorage.removeItem('smart_ledger_pre_preview_backup');
        setIsPreviewMode(false);
        showToast('تمت العودة لبياناتك الشخصية الأصلية بنجاح! ↩️', 'success');
      } catch (err) {
        showToast('فشل استعادة البيانات الأصلية، الرجاء إعادة تحميل الصفحة', 'error');
      }
    } else {
      setIsPreviewMode(false);
      showToast('تم الخروج من وضع المعاينة', 'info');
    }
  };

  const handleDeclineSharedData = () => {
    setShowSharedImportModal(false);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    showToast('تم الاحتفاظ ببياناتك المحلية الحالية دون تغيير', 'info');
  };

  const handleInstallApp = async () => {
    const isIframe = window.self !== window.top;
    if (isIframe || !deferredPrompt) {
      setIsPwaHelpOpen(true);
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('بدأ تنزيل وتثبيت الدفتر الذكي على جهازك! 🚀', 'success');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (err) {
      console.error('Error triggering PWA prompt:', err);
      setIsPwaHelpOpen(true);
    }
  };

  // Debts Export States
  const [isDebtsExportOpen, setIsDebtsExportOpen] = useState(false);
  const [debtsExportRange, setDebtsExportRange] = useState('all');
  const [debtsExportStart, setDebtsExportStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [debtsExportEnd, setDebtsExportEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const handleExportDebts = (isDownload: boolean) => {
    // Helper to calculate filtered balance for each account
    const getFilteredAccountNet = (accountId: string) => {
      const accTxs = transactions.filter(t => t.accountId === accountId).filter(t => {
        if (debtsExportRange === 'all') return true;
        const targetTime = new Date(t.date).getTime();
        if (debtsExportRange === 'month') {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0,0,0,0);
          return targetTime >= startOfMonth.getTime();
        }
        const sTime = new Date(debtsExportStart).getTime();
        const eTime = new Date(debtsExportEnd).getTime();
        return targetTime >= sTime && targetTime <= eTime;
      });

      const give = accTxs.filter(t => t.type === 'debt').reduce((sum, t) => sum + t.amount, 0);
      const take = accTxs.filter(t => t.type === 'obligation').reduce((sum, t) => sum + t.amount, 0);
      return give - take;
    };

    // Calculate totals based on current filters
    const reportAccounts = accounts.map(acc => {
      const net = getFilteredAccountNet(acc.id);
      return { ...acc, netBalance: net };
    }).filter(acc => {
      // Apply the active view filters
      if (filterType === 'debt') return acc.netBalance > 0;
      if (filterType === 'obligation') return acc.netBalance < 0;
      return true;
    });

    const repTotalDebts = reportAccounts.filter(a => a.netBalance > 0).reduce((sum, a) => sum + a.netBalance, 0);
    const repTotalObligations = reportAccounts.filter(a => a.netBalance < 0).reduce((sum, a) => sum + Math.abs(a.netBalance), 0);
    const repNet = repTotalDebts - repTotalObligations;

    const rangeLabel = debtsExportRange === 'all' ? 'جميع البيانات' : 
                       debtsExportRange === 'month' ? 'الشهر الحالي' : 
                       `الفترة من ${debtsExportStart} إلى ${debtsExportEnd}`;

    // Build beautiful HTML report
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>دفتر الديون والالتزامات المالية - مدونة الحسابات المتقدمة</title>
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
            border-bottom: 3px double #0d9488;
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
            color: #0d9488;
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
            background-color: #f0fdfa;
            border: 1px solid #ccfbf1;
            border-right: 5px solid #0d9488;
            border-radius: 12px;
            padding: 12px 18px;
            flex: 1;
            min-width: 150px;
          }
          .summary-card.obligation {
            background-color: #fff7ed;
            border-color: #ffedd5;
            border-right-color: #ea580c;
          }
          .summary-card.net {
            background-color: #f8fafc;
            border-color: #e2e8f0;
            border-right-color: #64748b;
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
            color: #0d9488;
          }
          .summary-card.obligation .value {
            color: #ea580c;
          }
          .summary-card.net .value {
            color: #1e293b;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
          }
          .badge-receivable {
            background-color: #d1fae5;
            color: #065f46;
          }
          .badge-payable {
            background-color: #ffedd5;
            color: #c2410c;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; margin: 15mm; }
          }
        </style>
      </head>
      <body>
        ${isDownload ? `
          <button onclick="window.print()" class="no-print" style="position: fixed; top: 20px; left: 20px; background-color: #0d9488; color: #ffffff; font-family: 'Cairo', sans-serif; font-weight: 800; font-size: 12px; border: none; padding: 10px 20px; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); cursor: pointer; z-index: 99999;">
            🖨️ طباعة أو حفظ كـ PDF بالجوال
          </button>
        ` : ''}

        <div class="report-header">
          <div class="logo-box">
            <img class="logo-img" src="/logo.jpg" alt="Logo" onerror="this.style.display='none'" referrerPolicy="no-referrer" />
            <div>
              <h1 class="title">مدونة الحسابات المتقدمة</h1>
              <p class="subtitle">تقرير كشوفات الحساب وحركات الديون بالتفصيل</p>
            </div>
          </div>
          <div class="meta-info">
            <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>النطاق الزمني:</strong> ${rangeLabel}</p>
          </div>
        </div>

        <div class="summary-container">
          <div class="summary-card">
            <h4>إجمالي الديون (لك للآخرين)</h4>
            <div class="value">${repTotalDebts.toLocaleString('ar-EG')} ريال</div>
          </div>
          <div class="summary-card obligation">
            <h4>إجمالي الالتزامات (عليك للآخرين)</h4>
            <div class="value">${repTotalObligations.toLocaleString('ar-EG')} ريال</div>
          </div>
          <div class="summary-card net">
            <h4>صافي رصيد الدفتر</h4>
            <div class="value" style="color: ${repNet >= 0 ? '#0d9488' : '#ea580c'}">${repNet.toLocaleString('ar-EG')} ريال</div>
          </div>
        </div>

        <h3 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 6px; font-size: 14px; margin-bottom: 10px;">كشوفات الحركات المالية للأشخاص بالتفصيل</h3>
        
        ${reportAccounts.length === 0 ? `
          <div style="text-align: center; padding: 40px; color: #64748b; border: 1px dashed #cbd5e1; border-radius: 12px;">
            لا توجد حسابات مسجلة مطابقة لخيارات التصدير الحالية.
          </div>
        ` : 
          reportAccounts.map(acc => {
            const personTxs = transactions.filter(t => t.accountId === acc.id).filter(t => {
              if (debtsExportRange === 'all') return true;
              const targetTime = new Date(t.date).getTime();
              if (debtsExportRange === 'month') {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0,0,0,0);
                return targetTime >= startOfMonth.getTime();
              }
              const sTime = new Date(debtsExportStart).getTime();
              const eTime = new Date(debtsExportEnd).getTime();
              return targetTime >= sTime && targetTime <= eTime;
            }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const txRows = personTxs.map(t => `
              <tr style="font-size: 10px;">
                <td style="color: #64748b; padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">${new Date(t.date).toLocaleDateString('ar-EG')}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">
                  <span class="badge ${t.type === 'debt' ? 'badge-receivable' : 'badge-payable'}">
                    ${t.type === 'debt' ? 'دين لك (+)' : 'التزام عليك (-)'}
                  </span>
                </td>
                <td style="font-weight: 700; color: ${t.type === 'debt' ? '#0d9488' : '#ea580c'}; padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">
                  ${t.amount.toLocaleString('ar-EG')} ريال
                </td>
                <td style="color: #334155; padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">${t.notes || '—'}</td>
              </tr>
            `).join('');

            return `
              <div style="margin-top: 22px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; page-break-inside: avoid; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <!-- Account Header -->
                <div style="background-color: #f8fafc; padding: 12px 18px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 13px; font-weight: 800; color: #0d9488;">${acc.name}</span>
                    ${acc.phone ? `<span style="font-size: 11px; color: #64748b; margin-right: 12px;">📞 ${acc.phone}</span>` : ''}
                  </div>
                  <div style="text-align: left;">
                    <span style="font-size: 13px; font-weight: 800; color: ${acc.netBalance > 0 ? '#0d9488' : acc.netBalance < 0 ? '#ea580c' : '#475569'}">
                      ${acc.netBalance > 0 ? 'لك (مستحق): ' : acc.netBalance < 0 ? 'عليك (التزام): ' : 'خالص ومتعادل: '}
                      ${Math.abs(acc.netBalance).toLocaleString('ar-EG')} ريال
                    </span>
                  </div>
                </div>

                <!-- Transactions Sub-table -->
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                  <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #475569;">
                      <th style="padding: 8px 12px; text-align: right; width: 20%; font-weight: 700;">التاريخ</th>
                      <th style="padding: 8px 12px; text-align: right; width: 25%; font-weight: 700;">نوع الحركة</th>
                      <th style="padding: 8px 12px; text-align: right; width: 20%; font-weight: 700;">المبلغ</th>
                      <th style="padding: 8px 12px; text-align: right; width: 35%; font-weight: 700;">البيان / ملاحظات الحركة</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${personTxs.length === 0 
                      ? '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px; font-style: italic;">لا توجد حركات مالية مسجلة لهذه الفترة</td></tr>' 
                      : txRows
                    }
                  </tbody>
                </table>
              </div>
            `;
          }).join('')
        }
      </body>
      </html>
    `;

    if (isDownload) {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `دفتر_الديون_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم تحميل دفتر الديون وحفظه بتخزين الهاتف بنجاح!', 'success');
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
      showToast('جاري تحضير دفتر الديون لحفظه كـ PDF...', 'success');
    }
    setIsDebtsExportOpen(false);
  };

  // --- Dynamic Financial Calculations ---
  const getAccountNetBalance = (accountId: string) => {
    const accountTxs = transactions.filter((t) => t.accountId === accountId);
    const debts = accountTxs.filter((t) => t.type === 'debt').reduce((sum, t) => sum + t.amount, 0);
    const obligations = accountTxs.filter((t) => t.type === 'obligation').reduce((sum, t) => sum + t.amount, 0);
    return debts - obligations;
  };

  const accountBalances = accounts
    .filter(acc => (acc.currency || 'SAR') === selectedDashboardCurrency)
    .map((acc) => ({
      accountId: acc.id,
      net: getAccountNetBalance(acc.id),
    }));

  const totalDebts = accountBalances
    .filter((ab) => ab.net > 0)
    .reduce((sum, ab) => sum + ab.net, 0);

  const totalObligations = accountBalances
    .filter((ab) => ab.net < 0)
    .reduce((sum, ab) => sum + Math.abs(ab.net), 0);

  const netBalance = totalDebts - totalObligations;

  // --- Date Formatter ---
  const formatDateArabic = (dateStr: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const targetDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;

      if (targetDateStr === todayStr) {
        return 'اليوم';
      } else if (targetDateStr === yesterdayStr) {
        return 'أمس';
      } else {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(targetDateStr).toLocaleDateString('ar-EG', options);
      }
    } catch {
      return dateStr;
    }
  };

  const getAccountDisplayDate = (account: Account) => {
    const accountTxs = transactions.filter((t) => t.accountId === account.id);
    if (accountTxs.length === 0) {
      return formatDateArabic(account.createdAt);
    }
    const sorted = [...accountTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return formatDateArabic(sorted[0].date);
  };

  // --- CRUD Event Handlers ---
  const handleAddAccount = (newAccount: Account, initialTx?: Omit<Transaction, 'id' | 'accountId'>) => {
    setAccounts((prev) => [newAccount, ...prev]);

    if (initialTx) {
      const newTx: Transaction = {
        ...initialTx,
        id: 'tx-' + Date.now(),
        accountId: newAccount.id,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`تم إنشاء الحساب وتسجيل المعاملة بقيمة ${initialTx.amount} ريال`);
    } else {
      showToast(`تم إنشاء الحساب بنجاح`);
    }
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: 'tx-' + Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    
    const acc = accounts.find((a) => a.id === newTxData.accountId);
    const accountName = acc ? acc.name : '';
    const label = newTxData.type === 'debt' ? 'مستحق لك' : 'التزام عليك';
    showToast(`تم تسجيل معاملة ${label} لحساب ${accountName} بقيمة ${newTxData.amount} ريال`);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
    showToast('تم تعديل المعاملة المالية بنجاح');
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    showToast('تم حذف المعاملة المالية بنجاح', 'info');
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setTransactions((prev) => prev.filter((t) => t.accountId !== accountId));
    showToast('تم حذف الحساب بالكامل وجميع معاملاته', 'info');
  };

  const handleUpdateAccount = (accountId: string, newName: string, newPhone?: string, newCurrency?: 'USD' | 'YER' | 'SAR') => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, name: newName, phone: newPhone, currency: newCurrency } : acc))
    );
    showToast('تم تحديث بيانات الحساب بنجاح');
  };

  const triggerAddTxForAccount = (accountId: string) => {
    setPreselectedAccountIdForAddTx(accountId);
    setIsAddTxOpen(true);
  };

  const resetToDefault = () => {
    setAccounts(initialAccounts);
    setTransactions(initialTransactions);
    setDailyExpenses(initialDailyExpenses);
    setEmployees(initialEmployees);
    setEmployeeTransactions(initialEmployeeTransactions);
    setHomeNeeds(initialHomeNeeds);
    setUser({
      email: 'investor@smartledger.com',
      name: 'مستثمر تجريبي',
      isPremium: false,
      trialDaysLeft: 14,
      subscriptionType: 'free'
    });
    showToast('تمت إعادة تعيين جميع الدفاتر للبيانات الافتراضية بنجاح', 'info');
  };

  // --- Export / Import Backup ---
  const exportAllData = () => {
    const dataStr = JSON.stringify({ 
      accounts, 
      transactions,
      dailyExpenses,
      employees,
      employeeTransactions,
      homeNeeds,
      user
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `دفتر_الحسابات_الذكي_الشامل_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast('تم تصدير ملف النسخة الاحتياطية الشامل بنجاح');
  };

  const importAllData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.accounts && parsed.transactions) {
            setAccounts(parsed.accounts);
            setTransactions(parsed.transactions);
            if (parsed.dailyExpenses) setDailyExpenses(parsed.dailyExpenses);
            if (parsed.employees) setEmployees(parsed.employees);
            if (parsed.employeeTransactions) setEmployeeTransactions(parsed.employeeTransactions);
            if (parsed.homeNeeds) setHomeNeeds(parsed.homeNeeds);
            if (parsed.user) setUser(parsed.user);
            showToast('تم استيراد نسخة البيانات الشاملة بنجاح واستبدال الرصيد الحالي');
          } else {
            showToast('صيغة الملف غير صحيحة، تأكد من اختيار ملف تم تصديره من هذا التطبيق', 'error');
          }
        } catch {
          showToast('فشل قراءة الملف. الملف قد يكون تالفاً', 'error');
        }
      };
    }
  };

  // --- Handlers for Daily Expenses ---
  const handleAddExpense = (expense: Omit<DailyExpense, 'id'>) => {
    const newExp: DailyExpense = {
      ...expense,
      id: 'exp-' + Date.now()
    };
    setDailyExpenses(prev => [newExp, ...prev]);
  };

  const handleUpdateExpense = (id: string, updated: Omit<DailyExpense, 'id'>) => {
    setDailyExpenses(prev =>
      prev.map(e => e.id === id ? { ...e, ...updated } : e)
    );
  };

  const handleDeleteExpense = (id: string) => {
    setDailyExpenses(prev => prev.filter(e => e.id !== id));
  };

  // --- Handlers for Employees ---
  const handleAddEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: 'emp-' + Date.now()
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setEmployeeTransactions(prev => prev.filter(t => t.employeeId !== id));
  };

  const handleUpdateEmployee = (id: string, updated: Omit<Employee, 'id'>) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, ...updated } : e)
    );
  };

  const handleAddEmployeeTx = (tx: Omit<EmployeeTransaction, 'id'>) => {
    const newTx: EmployeeTransaction = {
      ...tx,
      id: 'etx-' + Date.now()
    };
    setEmployeeTransactions(prev => [newTx, ...prev]);
  };

  const handleUpdateEmployeeTx = (id: string, updated: Omit<EmployeeTransaction, 'id'>) => {
    setEmployeeTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...updated } : t)
    );
  };

  const handleDeleteEmployeeTx = (id: string) => {
    setEmployeeTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Handlers for Home Needs ---
  const handleAddNeed = (need: Omit<HomeNeed, 'id' | 'addedAt'>) => {
    const newNeed: HomeNeed = {
      ...need,
      id: 'hn-' + Date.now(),
      addedAt: new Date().toISOString().split('T')[0]
    };
    setHomeNeeds(prev => [newNeed, ...prev]);
  };

  const handleUpdateNeed = (id: string, updated: Omit<HomeNeed, 'id' | 'addedAt'>) => {
    setHomeNeeds(prev =>
      prev.map(n => n.id === id ? { ...n, ...updated } : n)
    );
  };

  const handleToggleNeed = (id: string) => {
    setHomeNeeds(prev => prev.map(n => n.id === id ? { ...n, isPurchased: !n.isPurchased } : n));
  };

  const handleDeleteNeed = (id: string) => {
    setHomeNeeds(prev => prev.filter(n => n.id !== id));
  };

  const handleConvertToExpense = (need: HomeNeed) => {
    // 1. Mark need as purchased
    setHomeNeeds(prev => prev.map(n => n.id === need.id ? { ...n, isPurchased: true } : n));
    // 2. Map and add to dailyExpenses
    const newExp: DailyExpense = {
      id: 'exp-' + Date.now(),
      amount: need.expectedPrice || 0,
      date: new Date().toISOString().split('T')[0],
      category: need.category === 'بقالة' ? 'طعام' : need.category === 'أثاث' ? 'ترفيه' : 'أخرى',
      notes: `شراء مستلزم منزلي: ${need.name}`
    };
    setDailyExpenses(prev => [newExp, ...prev]);
    showToast(`تم ترحيل مستلزم البيت كـ مصروف يومي بقيمة ${need.expectedPrice} ريال!`, 'success');
  };

  // --- Handlers for Subscription and User ---
  const handleLogin = (arg1: string, arg2: string) => {
    const isFirstArgEmail = arg1 && arg1.includes('@');
    const email = isFirstArgEmail ? arg1 : arg2;
    const name = isFirstArgEmail ? arg2 : arg1;

    setUser({
      email: email || 'user@example.com',
      name: name || 'المستثمر الذكي',
      isPremium: true,
      trialDaysLeft: 14,
      subscriptionType: 'gold' // Gold subscription on login!
    });
    setIsLoggedIn(true);
    localStorage.setItem('smart_ledger_logged_in', 'true');
    showToast(`مرحباً بك يا ${name || 'المستخدم'}! تم تسجيل الدخول بنجاح ✨`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('smart_ledger_logged_in');
    showToast('تم تسجيل الخروج بنجاح 👋', 'info');
  };

  const handleUpgradePlan = (plan: 'silver' | 'gold') => {
    if (!user) return;
    setUser({
      ...user,
      isPremium: true,
      subscriptionType: plan
    });
  };

  // --- Google Drive Sync Backup Simulation ---
  const handleSyncBackup = () => {
    // Sync JSON data dump to storage
    const syncData = {
      accounts,
      transactions,
      dailyExpenses,
      employees,
      employeeTransactions,
      homeNeeds
    };
    localStorage.setItem('smart_ledger_backup_data', JSON.stringify(syncData));
  };

  const handleRestoreBackup = (fileContent: string | any) => {
    try {
      const parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
      if (parsed.accounts && parsed.transactions) {
        setAccounts(parsed.accounts);
        setTransactions(parsed.transactions);
        if (parsed.dailyExpenses) setDailyExpenses(parsed.dailyExpenses);
        if (parsed.employees) setEmployees(parsed.employees);
        if (parsed.employeeTransactions) setEmployeeTransactions(parsed.employeeTransactions);
        if (parsed.homeNeeds) setHomeNeeds(parsed.homeNeeds);
        showToast('تم استعادة نسختك السحابية بنجاح!', 'success');
      }
    } catch {
      showToast('الملف السحابي غير صالح', 'error');
    }
  };

  // --- Filters and Sorting logic for Debts ---
  const filteredAccounts = accounts.filter((acc) => {
    // 1. Text Search (Name and optional notes)
    let matchesText = false;
    if (!searchQuery) {
      matchesText = true;
    } else {
      const query = searchQuery.toLowerCase();
      const matchesName = acc.name.toLowerCase().includes(query);
      if (matchesName) {
        matchesText = true;
      } else if (searchInNotes) {
        // Check if any transaction note matches
        const accountTxs = transactions.filter((t) => t.accountId === acc.id);
        const matchesNotes = accountTxs.some((t) => t.notes && t.notes.toLowerCase().includes(query));
        if (matchesNotes) {
          matchesText = true;
        }
      }
    }
    
    if (!matchesText) return false;

    // 2. Net balance type filter (debt / obligation / all)
    const net = getAccountNetBalance(acc.id);
    if (filterType === 'debt' && net <= 0) return false;
    if (filterType === 'obligation' && net >= 0) return false;

    // 3. Amount Range filter
    const minVal = minAmount !== '' ? parseFloat(minAmount) : null;
    const maxVal = maxAmount !== '' ? parseFloat(maxAmount) : null;
    
    if (minVal !== null || maxVal !== null) {
      if (amountScope === 'balance') {
        const absNet = Math.abs(net);
        if (minVal !== null && absNet < minVal) return false;
        if (maxVal !== null && absNet > maxVal) return false;
      } else {
        // At least one individual transaction matches the range
        const accountTxs = transactions.filter((t) => t.accountId === acc.id);
        const hasMatchingTx = accountTxs.some((t) => {
          if (minVal !== null && t.amount < minVal) return false;
          if (maxVal !== null && t.amount > maxVal) return false;
          return true;
        });
        if (!hasMatchingTx) return false;
      }
    }

    return true;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ar');
    } else {
      const netA = Math.abs(getAccountNetBalance(a.id));
      const netB = Math.abs(getAccountNetBalance(b.id));
      return netB - netA;
    }
  });

  const activeAccountForDetails = accounts.find((a) => a.id === selectedAccountIdForDetails) || null;

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3.5 shadow-2xl border border-slate-850 text-sm font-semibold text-slate-100 bg-slate-950/95 backdrop-blur-md"
              id="global-feedback-toast"
            >
              {toast.type === 'success' && <CheckCircle2 className="text-emerald-400" size={18} />}
              {toast.type === 'info' && <Info className="text-blue-400" size={18} />}
              {toast.type === 'error' && <AlertCircle className="text-red-400" size={18} />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'light' ? 'light-theme bg-slate-50 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-800' : 'bg-[#0f172a] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200'} flex flex-col font-sans`}>
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 px-4 py-2.5 text-center text-xs font-black shadow-lg flex flex-col sm:flex-row items-center justify-center gap-3 z-50 sticky top-0" dir="rtl">
          <span className="flex items-center gap-1.5 animate-pulse justify-center">
            <Sparkles size={14} className="shrink-0" />
            <span>وضع المعاينة التجريبية: أنت تستعرض نسخة حية من دفتر صديقك المشترك!</span>
          </span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleExitPreviewMode}
              className="bg-slate-950 text-white hover:bg-slate-900 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            >
              العودة لبياناتي الشخصية ↩️
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('smart_ledger_pre_preview_backup');
                setIsPreviewMode(false);
                showToast('تم حفظ هذه البيانات كدفترك الافتراضي الجديد بنجاح! 🎉', 'success');
              }}
              className="bg-white text-slate-950 hover:bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            >
              حفظ كبياناتي الدائمة 📥
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3.5 shadow-2xl border border-slate-800 text-sm font-semibold text-slate-100 bg-slate-900/95 backdrop-blur-md"
              id="global-feedback-toast"
            >
              {toast.type === 'success' && <CheckCircle2 className="text-emerald-400" size={18} />}
              {toast.type === 'info' && <Info className="text-blue-400" size={18} />}
              {toast.type === 'error' && <AlertCircle className="text-red-400" size={18} />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

      {/* --- Sidebar Master Navigation (Desktop & Large Screens) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-l border-slate-800/80 p-5 space-y-6">
        <div className="py-2">
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 h-8 w-8 rounded-xl flex items-center justify-center font-black">م</span>
            <span>مدونة الحسابات المتقدمة</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 mr-10">الحسابات والرواتب الشاملة</p>
        </div>

        {/* Theme Selector widget in sidebar */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-850 p-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">مظهر التطبيق:</span>
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all border border-slate-700/50"
            title={themeMode === 'light' ? 'التحويل للثيم الليلي' : 'التحويل للثيم النهاري'}
          >
            {themeMode === 'light' ? (
              <>
                <Sun size={14} className="text-amber-500 animate-spin-slow" />
                <span>نهاري / صباحي</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-sky-400" />
                <span>ليلي / داكن</span>
              </>
            )}
          </button>
        </div>

        {/* User profile brief */}
        {user && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-850 p-3.5 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{user.name}</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-400 block pt-0.5">
              {user.subscriptionType === 'gold' ? 'الاشتراك الذهبي المميز 👑' :
               user.subscriptionType === 'silver' ? 'الاشتراك الفضي المميز 🥈' :
               'التجربة المجانية (١٤ يوم)'}
            </span>
          </div>
        )}

        {/* Quick share button in sidebar */}
        <button
          onClick={generateShareLink}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs font-black cursor-pointer shadow-md shadow-emerald-500/5 group"
        >
          <Share2 size={15} className="group-hover:rotate-12 transition-transform" />
          <span>مشاركة الدفتر مع صديق 🔗</span>
        </button>

        <nav className="flex-1 flex flex-col gap-1">
          {/* Nav Links */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>لوحة التحكم الرئيسية (الكل)</span>
          </button>

          <button
            onClick={() => setCurrentTab('debts')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'debts' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Wallet size={18} />
            <span>ديون الأشخاص (الدفتر)</span>
          </button>

          <button
            onClick={() => setCurrentTab('expenses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'expenses' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Tag size={18} />
            <span>صرفياتي اليومية (الميزانية)</span>
          </button>

          <button
            onClick={() => setCurrentTab('employees')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'employees' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Users size={18} />
            <span>حسابات عمالي (العمال)</span>
          </button>

          <button
            onClick={() => setCurrentTab('home')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'home' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Home size={18} />
            <span>مستلزمات البيت (المنزل)</span>
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'reports' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FileText size={18} />
            <span>التقارير وتصدير PDF</span>
          </button>

          <button
            onClick={() => setCurrentTab('cloud')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'cloud' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Cloud size={18} />
            <span>سحابتي (Google Drive)</span>
          </button>

          <div className="h-[1px] bg-slate-900 my-4" />

          <button
            onClick={() => setCurrentTab('subscription')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
              currentTab === 'subscription' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Lock size={18} />
            <span>بوابتي والاشتراك (الحساب)</span>
          </button>
        </nav>

        {/* Global actions at bottom of sidebar */}
        <div className="space-y-1.5 pt-4 border-t border-slate-900 text-xs font-bold text-slate-500">
          <button 
            onClick={resetToDefault}
            className="w-full flex items-center gap-2 px-3 py-2 text-right hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>إعادة ضبط البيانات</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-right text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* --- Main Scaffold Layout --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col pb-24 md:pb-8">
          
          {/* --- TOP MOBILE HEADER --- */}
          <header className="flex md:hidden items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-100 flex items-center gap-1.5">
                <span className="bg-amber-500 text-slate-950 h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs">م</span>
                <span>مدونة الحسابات المتقدمة</span>
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Share Live Link button */}
              <button
                onClick={generateShareLink}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center justify-center cursor-pointer"
                title="مشاركة الدفتر مع صديق 🔗"
              >
                <Share2 size={16} />
              </button>

              {/* Theme Toggle button */}
              <button
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer"
                title={themeMode === 'light' ? 'تفعيل الوضع الليلي 🌙' : 'تفعيل الوضع النهاري ☀️'}
              >
                {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* Export backup button */}
              <button
                onClick={exportAllData}
                className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer"
                title="تصدير نسخة احتياطية شاملة"
              >
                <Download size={16} />
              </button>

              {/* Import backup button */}
              <label
                className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
                title="استيراد نسخة احتياطية شاملة"
              >
                <Upload size={16} />
                <input type="file" accept=".json" onChange={importAllData} className="hidden" />
              </label>

              {/* Reset to defaults button */}
              <button
                onClick={resetToDefault}
                className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer"
                title="إعادة ضبط التطبيق"
              >
                <RefreshCw size={16} />
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center justify-center cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* 🟢 Offline & PWA Connection Banners */}
          <div className="mb-6 space-y-3">
            {!isOnline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold gap-3 shadow-lg shadow-amber-500/5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>تنبيه: تعمل حالياً "دون اتصال بالإنترنت" ⚠️ كافة الحسابات والعمليات مؤمنة ومحفوظة محلياً بالكامل.</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 text-amber-300">أوفلاين نشط</span>
              </motion.div>
            )}

            {isOnline && currentTab === 'cloud' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold gap-3 shadow-lg shadow-emerald-500/5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>متصل بالإنترنت: المزامنة السحابية وتخزين Google Drive جاهزة للتفعيل.</span>
                </div>
                <button
                  onClick={() => setCurrentTab('cloud')}
                  className="text-[10px] bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                >
                  افتح السحابة ☁️
                </button>
              </motion.div>
            )}

            {/* Android / iOS Standalone Screen Optimization Banner */}
            {currentTab === 'cloud' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
                    <Smartphone size={18} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span>تشغيل الدفتر كـ تطبيق مستقل بالجوال</span>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md">Android & iOS</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">ثبّت التطبيق الآن للعمل بملء الشاشة مع إخفاء خلفية المتصفح وشريط العناوين!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative z-10">
                  <button
                    onClick={handleInstallApp}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-[11px] font-black rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    تثبيت كـ تطبيق للجوال 📲
                  </button>
                  <button
                    onClick={() => setIsPwaHelpOpen(true)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    دليل آيفون 🍏
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* --- TAB CONDITIONAL RENDERING --- */}
          <div className="flex-1">
            {currentTab === 'dashboard' && (
              <DashboardTab
                accounts={accounts}
                transactions={transactions}
                dailyExpenses={dailyExpenses}
                employees={employees}
                employeeTransactions={employeeTransactions}
                homeNeeds={homeNeeds}
                onTabChange={(tab) => {
                  if (tab === 'debts') {
                    setCurrentTab('debts');
                    setSearchQuery('');
                  } else {
                    setCurrentTab(tab);
                  }
                }}
                showToast={showToast}
              />
            )}

            {currentTab === 'debts' && (
              // ORIGINAL DEBTS LEDGER VIEW
              <div className="space-y-6">
                {/* --- Elegant Dashboard Card (Premium Gradient) --- */}
                <section 
                  className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#1E3A8A] via-[#1e40af] to-[#0D9488] shadow-2xl text-white border border-white/20"
                  id="main-dashboard-balance-card"
                >
                  <div className="absolute top-0 right-0 w-44 h-44 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-44 h-44 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Currency Selector Switcher Pills */}
                  <div className="flex justify-center gap-2 relative z-10 mb-5 flex-wrap">
                    {[
                      { id: 'SAR', label: 'ريال سعودي', symbol: 'ر.س' },
                      { id: 'YER', label: 'ريال يمني', symbol: 'ر.ي' },
                      { id: 'USD', label: 'دولار أمريكي', symbol: '$' }
                    ].map((curr) => {
                      const isSelected = selectedDashboardCurrency === curr.id;
                      return (
                        <button
                          key={curr.id}
                          onClick={() => setSelectedDashboardCurrency(curr.id as 'SAR' | 'YER' | 'USD')}
                          style={isSelected ? { color: '#000000' } : undefined}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black border-white font-extrabold shadow-lg scale-105'
                              : 'bg-slate-950/40 hover:bg-slate-950/60 text-white border-white/30 font-bold backdrop-blur-sm'
                          }`}
                        >
                          {curr.label} ({curr.symbol})
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-center space-y-2 relative z-10">
                    <span className="text-xs font-black uppercase tracking-widest text-white bg-slate-950/40 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                      صافي رصيد الديون الحالي ({selectedDashboardCurrency === 'USD' ? 'دولار' : selectedDashboardCurrency === 'YER' ? 'ريال يمني' : 'ريال سعودي'})
                    </span>
                    <div className="pt-2 flex items-baseline justify-center gap-1.5">
                      <span className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md" id="dashboard-net-balance-text">
                        {netBalance.toLocaleString('ar-EG')}
                      </span>
                      <span className="text-xs md:text-sm font-black text-amber-300 drop-shadow-sm">
                        {selectedDashboardCurrency === 'USD' ? '$' : selectedDashboardCurrency === 'YER' ? 'ر.ي' : 'ر.س'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-100 drop-shadow-sm">
                      {netBalance > 0 ? 'إجمالي مستحقاتك الخارجية تفوق التزاماتك' : netBalance < 0 ? 'إجمالي التزاماتك تفوق مستحقاتك' : 'حساباتك متعادلة ومستقرة تماماً'}
                    </p>
                  </div>

                  <div className="w-full h-[1px] bg-white/20 my-5 relative z-10" />

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    {/* Receivable summary */}
                    <div className="bg-slate-950/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center hover:bg-slate-950/40 transition-all">
                      <span className="text-xs text-emerald-100 font-bold">لك (ديون مستحقة)</span>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="rounded-lg bg-emerald-500/30 p-1.5 text-emerald-300 border border-emerald-400/30">
                          <ArrowUpRight size={14} />
                        </span>
                        <span className="text-xl font-black text-emerald-300 drop-shadow-sm" id="dashboard-debts-total">
                          {totalDebts.toLocaleString('ar-EG')}
                        </span>
                        <span className="text-[11px] text-emerald-300 font-black">
                          {selectedDashboardCurrency === 'USD' ? '$' : selectedDashboardCurrency === 'YER' ? 'ر.ي' : 'ر.س'}
                        </span>
                      </div>
                    </div>

                    {/* Payables summary */}
                    <div className="bg-slate-950/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center hover:bg-slate-950/40 transition-all">
                      <span className="text-xs text-orange-100 font-bold">عليك (التزامات للآخرين)</span>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="rounded-lg bg-orange-500/30 p-1.5 text-orange-300 border border-orange-400/30">
                          <ArrowDownLeft size={14} />
                        </span>
                        <span className="text-xl font-black text-orange-300 drop-shadow-sm" id="dashboard-obligations-total">
                          {totalObligations.toLocaleString('ar-EG')}
                        </span>
                        <span className="text-[11px] text-orange-300 font-black">
                          {selectedDashboardCurrency === 'USD' ? '$' : selectedDashboardCurrency === 'YER' ? 'ر.ي' : 'ر.س'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* --- Action Bar & Search / Filtering Layout --- */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <span>دفتر حسابات الأشخاص والجهات</span>
                      <span className="text-xs bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                        {sortedAccounts.length} من {accounts.length}
                      </span>
                    </h2>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsDebtsExportOpen(true)}
                        className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-600/15 hover:from-red-500/20 hover:to-rose-600/25 border border-red-500/20 hover:border-red-500/40 p-2.5 px-4 text-xs font-black text-rose-300 hover:text-rose-100 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-red-500/5"
                      >
                        <span className="flex items-center justify-center bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow shadow-red-600/30 group-hover:scale-110 transition-transform">
                          PDF
                        </span>
                        <span>تصدير تقرير PDF</span>
                      </button>
                      <button
                        onClick={() => setIsAddAccountOpen(true)}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 p-2.5 px-4 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
                        id="fab-add-account-trigger"
                      >
                        <Plus size={16} />
                        <span>إضافة حساب</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Input Box with Advanced Search toggle */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 py-3 pl-4 pr-10 text-xs text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        placeholder={searchInNotes ? "البحث بالاسم أو بالملاحظات..." : "البحث عن اسم شخص أو جهة..."}
                        id="accounts-search-bar"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400 hover:text-white"
                        >
                          مسح
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className={`flex items-center gap-1.5 px-4 rounded-2xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                        showAdvancedSearch 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/5' 
                          : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                      }`}
                      title="البحث المتقدم والفلاتر الإضافية"
                    >
                      <SlidersHorizontal size={14} className={showAdvancedSearch ? 'text-emerald-400' : 'text-slate-400'} />
                      <span className="hidden sm:inline">بحث متقدم</span>
                    </button>
                  </div>

                  {/* Advanced Search Options Panel */}
                  <AnimatePresence>
                    {showAdvancedSearch && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden bg-slate-900/45 border border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-xl relative"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800/50">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Filter size={12} />
                            <span>تخصيص البحث المتقدم والفلترة</span>
                          </span>
                          
                          {/* Reset Filters button */}
                          {(searchInNotes || minAmount !== '' || maxAmount !== '' || amountScope !== 'balance') && (
                            <button
                              onClick={() => {
                                setSearchInNotes(false);
                                setMinAmount('');
                                setSearchQuery('');
                                setMaxAmount('');
                                setAmountScope('balance');
                                showToast('تمت إعادة تعيين فلاتر البحث المتقدم', 'info');
                              }}
                              className="text-[10px] text-red-400 hover:text-red-300 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                            >
                              إعادة تعيين الفلاتر 🔄
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Search Options Column */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 block">نطاق البحث النصي</label>
                            <div className="flex items-center gap-2 pt-1">
                              <label className="relative flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={searchInNotes}
                                  onChange={(e) => setSearchInNotes(e.target.checked)}
                                  className="w-4 h-4 accent-emerald-500 rounded border-slate-800 bg-slate-950 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                                <span>البحث في ملاحظات العمليات أيضاً</span>
                              </label>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">عند التفعيل، سيطابق البحث الحسابات التي تحتوي ملاحظات حركاتها المالية على الكلمة المدخلة.</p>
                          </div>

                          {/* Amount range Inputs */}
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-bold text-slate-400 block">تصفية بنطاق المبالغ المحددة</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1 relative">
                                <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-500 font-bold">من</span>
                                <input
                                  type="number"
                                  value={minAmount}
                                  onChange={(e) => setMinAmount(e.target.value)}
                                  placeholder="الحد الأدنى..."
                                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-3 pr-10 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>

                              <div className="flex-1 relative">
                                <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-500 font-bold">إلى</span>
                                <input
                                  type="number"
                                  value={maxAmount}
                                  onChange={(e) => setMaxAmount(e.target.value)}
                                  placeholder="الحد الأقصى..."
                                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-3 pr-10 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>

                              <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => setAmountScope('balance')}
                                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black transition-all cursor-pointer ${
                                    amountScope === 'balance'
                                      ? 'bg-slate-800 text-white'
                                      : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                  title="مقارنة الفلتر برصيد الحساب الإجمالي بعد الجمع"
                                >
                                  رصيد الحساب
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAmountScope('transaction')}
                                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black transition-all cursor-pointer ${
                                    amountScope === 'transaction'
                                      ? 'bg-slate-800 text-white'
                                      : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                  title="مقارنة الفلتر بأي عملية منفردة داخل الحساب"
                                >
                                  حركة منفردة
                                </button>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              {amountScope === 'balance' 
                                ? "سيتم عرض الحسابات التي يتراوح صافي رصيد ديونها الكلي بين القيم المحددة." 
                                : "سيتم عرض الحسابات التي تشتمل على حركة مالية واحدة على الأقل بالقيم المدخلة."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Filtering & Sorting Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/30 p-1.5 rounded-2xl border border-slate-800/40">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          filterType === 'all'
                            ? 'bg-slate-800 text-white border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        الكل
                      </button>
                      <button
                        onClick={() => setFilterType('debt')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                          filterType === 'debt'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'text-slate-400 hover:text-emerald-400'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        لك (مستحق)
                      </button>
                      <button
                        onClick={() => setFilterType('obligation')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                          filterType === 'obligation'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'text-slate-400 hover:text-orange-400'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        عليك (التزام)
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span>ترتيب حسب:</span>
                      <button
                        onClick={() => setSortBy(sortBy === 'name' ? 'balance' : 'name')}
                        className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 transition-colors border border-slate-700/40"
                      >
                        <span>{sortBy === 'name' ? 'الاسم' : 'قيمة المبلغ'}</span>
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  </div>
                </section>

                {/* --- List of Accounts (Contacts) --- */}
                <section className="flex-1 flex flex-col">
                  {sortedAccounts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 text-slate-500">
                      <FileText size={40} className="text-slate-700 mb-3" />
                      <h3 className="text-sm font-bold text-slate-400 mb-1">لا توجد حسابات مطابقة لخيارات التصفية</h3>
                      <p className="text-xs max-w-xs text-slate-500">
                        أدخل اسماً جديداً للبحث أو أنشئ حساباً باستخدام زر إضافة حساب بالأعلى لبدء تسجيل السجلات المالية.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5" id="accounts-list-container">
                      {sortedAccounts.map((account) => {
                        const net = getAccountNetBalance(account.id);
                        const isLeik = net > 0;
                        const isZero = net === 0;

                        return (
                          <motion.div
                            key={account.id}
                            layoutId={`account-card-${account.id}`}
                            onClick={() => setSelectedAccountIdForDetails(account.id)}
                            className="group rounded-2xl bg-[#1e293b] p-3.5 border border-slate-800/40 hover:border-slate-700/80 hover:bg-[#233044] transition-all duration-300 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs select-none border transition-all ${
                                isLeik 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                  : isZero
                                    ? 'bg-slate-700/20 border-slate-700 text-slate-400'
                                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                              }`}>
                                {account.name.charAt(0)}
                              </div>

                              <div>
                                <h4 className="font-bold text-slate-100 text-xs group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 flex-wrap">
                                  <span>{account.name}</span>
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-850">
                                    {account.currency === 'USD' ? '$' : account.currency === 'YER' ? 'ر.ي' : 'ر.س'}
                                  </span>
                                </h4>
                                <p className="text-slate-400 text-[10px] mt-0.5 font-semibold">
                                  آخر حركة: <span className="text-slate-500">{getAccountDisplayDate(account)}</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-left flex items-center gap-1.5">
                              <div className="flex flex-col items-end">
                                <span className={`text-xs font-black ${
                                  isLeik ? 'text-emerald-400' : isZero ? 'text-slate-500' : 'text-orange-400'
                                }`}>
                                  {isZero ? '' : isLeik ? '+' : '-'}{Math.abs(net).toLocaleString('ar-EG')} {account.currency === 'USD' ? '$' : account.currency === 'YER' ? 'ر.ي' : 'ر.س'}
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold mt-0.5">
                                  {isLeik ? 'مستحق لك' : isZero ? 'مستقر' : 'التزام عليك'}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {currentTab === 'expenses' && (
              <DailyExpensesTab
                expenses={dailyExpenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdateExpense={handleUpdateExpense}
                showToast={showToast}
              />
            )}

            {currentTab === 'employees' && (
              <EmployeesTab
                employees={employees}
                employeeTransactions={employeeTransactions}
                onAddEmployee={handleAddEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onAddEmployeeTx={handleAddEmployeeTx}
                onDeleteEmployeeTx={handleDeleteEmployeeTx}
                onUpdateEmployeeTx={handleUpdateEmployeeTx}
                showToast={showToast}
              />
            )}

            {currentTab === 'home' && (
              <HomeEssentialsTab
                needs={homeNeeds}
                onAddNeed={handleAddNeed}
                onToggleNeed={handleToggleNeed}
                onDeleteNeed={handleDeleteNeed}
                onUpdateNeed={handleUpdateNeed}
                onConvertToExpense={handleConvertToExpense}
                showToast={showToast}
              />
            )}

            {currentTab === 'cloud' && (
              <CloudSyncTab
                accounts={accounts}
                transactions={transactions}
                dailyExpenses={dailyExpenses}
                employees={employees}
                employeeTransactions={employeeTransactions}
                homeNeeds={homeNeeds}
                onRestoreBackup={handleRestoreBackup}
                showToast={showToast}
              />
            )}

            {currentTab === 'subscription' && (
              <SubscriptionTab
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onUpgradePlan={handleUpgradePlan}
                showToast={showToast}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsTab
                accounts={accounts}
                transactions={transactions}
                dailyExpenses={dailyExpenses}
                employees={employees}
                employeeTransactions={employeeTransactions}
                homeNeeds={homeNeeds}
                showToast={showToast}
              />
            )}
          </div>
        </main>

        {/* --- BOTTOM NAVIGATION BAR (Mobile devices only) --- */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 md:hidden flex items-center justify-around py-2.5 px-1 backdrop-blur-lg">
          <button
            onClick={() => { setCurrentTab('dashboard'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'dashboard' ? 'text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => { setCurrentTab('debts'); setSearchQuery(''); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'debts' ? 'text-emerald-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Wallet size={18} />
            <span>الديون</span>
          </button>

          <button
            onClick={() => { setCurrentTab('expenses'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'expenses' ? 'text-rose-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Tag size={18} />
            <span>المصاريف</span>
          </button>

          <button
            onClick={() => { setCurrentTab('employees'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'employees' ? 'text-emerald-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Users size={18} />
            <span>العمال</span>
          </button>

          <button
            onClick={() => { setCurrentTab('home'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'home' ? 'text-indigo-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home size={18} />
            <span>المنزل</span>
          </button>

          <button
            onClick={() => { setCurrentTab('reports'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'reports' ? 'text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileText size={18} />
            <span>التقارير</span>
          </button>

          <button
            onClick={() => { setCurrentTab('cloud'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'cloud' ? 'text-sky-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Cloud size={18} />
            <span>السحابة</span>
          </button>

          <button
            onClick={() => { setCurrentTab('subscription'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
              currentTab === 'subscription' ? 'text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Lock size={18} />
            <span>حسابي</span>
          </button>
        </nav>
      </div>

      {/* --- ORIGINAL MODALS SYSTEM FOR DEBTS --- */}
      {/* 1. Add Account Modal */}
      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAdd={handleAddAccount}
      />

      {/* 2. Account Details Lookup */}
      <AccountDetailsModal
        isOpen={!!selectedAccountIdForDetails}
        onClose={() => setSelectedAccountIdForDetails(null)}
        account={activeAccountForDetails}
        transactions={transactions}
        onAddTransaction={triggerAddTxForAccount}
        onDeleteTransaction={handleDeleteTransaction}
        onDeleteAccount={handleDeleteAccount}
        onUpdateAccount={handleUpdateAccount}
        onEditTransaction={(tx) => {
          setEditingTransaction(tx);
          setIsAddTxOpen(true);
        }}
      />

      {/* 3. Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          setPreselectedAccountIdForAddTx(undefined);
          setEditingTransaction(null);
        }}
        accounts={accounts}
        preselectedAccountId={preselectedAccountIdForAddTx}
        onAdd={handleAddTransaction}
        editTransaction={editingTransaction}
        onEdit={handleUpdateTransaction}
      />
      {/* 4. Debts PDF Report Modal */}
      <AnimatePresence>
        {isDebtsExportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDebtsExportOpen(false)}
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
                  <FileText className="text-emerald-400" size={18} />
                  <h3 className="font-bold text-slate-200 text-xs">تصدير تقرير دفتر الديون والالتزامات 📊</h3>
                </div>
                <button 
                  onClick={() => setIsDebtsExportOpen(false)}
                  className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* 1. Range selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400">الفترة الزمنية لحركة الديون والمدفوعات:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDebtsExportRange('all')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        debtsExportRange === 'all' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الكل (كل الأوقات)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtsExportRange('month')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        debtsExportRange === 'month' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الشهر الحالي
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtsExportRange('custom')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        debtsExportRange === 'custom' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      تاريخ مخصص
                    </button>
                  </div>
                </div>

                {/* 2. Custom Date inputs */}
                {debtsExportRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-850 animate-fadeIn">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">من تاريخ:</span>
                      <input
                        type="date"
                        value={debtsExportStart}
                        onChange={(e) => setDebtsExportStart(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">إلى تاريخ:</span>
                      <input
                        type="date"
                        value={debtsExportEnd}
                        onChange={(e) => setDebtsExportEnd(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleExportDebts(false)}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                  >
                    <Printer size={16} />
                    <span>طباعة وتصدير PDF مباشر</span>
                  </button>

                  <button
                    onClick={() => handleExportDebts(true)}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-700/80 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
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

      {/* 5. PWA Installation Help Modal */}
      <PwaInstallHelpModal
        isOpen={isPwaHelpOpen}
        onClose={() => setIsPwaHelpOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallDirectly={handleInstallApp}
      />

      {/* 6. Live Sharing Modals */}
      <ShareWorkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={generatedShareUrl}
        showToast={showToast}
      />

      <SharedImportModal
        isOpen={showSharedImportModal}
        sharedData={sharedImportData}
        onAccept={handleAcceptSharedData}
        onPreview={handlePreviewSharedData}
        onDecline={handleDeclineSharedData}
      />
      </div>
    </div>
  );
}

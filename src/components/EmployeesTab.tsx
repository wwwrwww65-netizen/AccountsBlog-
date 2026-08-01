/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Users, Trash2, Edit2, Phone, Briefcase, DollarSign, 
  Calendar, CreditCard, ChevronLeft, ArrowUpRight, 
  Search, CheckCircle2, UserPlus, FileText, Gift,
  Printer, Download, X, MessageCircle, Send, Share2, Eye
} from 'lucide-react';
import { Employee, EmployeeTransaction } from '../types';

interface EmployeesTabProps {
  employees: Employee[];
  employeeTransactions: EmployeeTransaction[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployee?: (id: string, emp: Omit<Employee, 'id'>) => void;
  onAddEmployeeTx: (tx: Omit<EmployeeTransaction, 'id'>) => void;
  onDeleteEmployeeTx: (id: string) => void;
  onUpdateEmployeeTx?: (id: string, tx: Omit<EmployeeTransaction, 'id'>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function EmployeesTab({
  employees,
  employeeTransactions,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateEmployee,
  onAddEmployeeTx,
  onDeleteEmployeeTx,
  onUpdateEmployeeTx,
  showToast
}: EmployeesTabProps) {
  const [search, setSearch] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  
  // Modals state
  const [isOpenAddEmp, setIsOpenAddEmp] = useState(false);
  const [isOpenAddTx, setIsOpenAddTx] = useState(false);
  const [editingEmployeeTx, setEditingEmployeeTx] = useState<EmployeeTransaction | null>(null);

  // WhatsApp Share and Receipt State
  const [isOpenShareModal, setIsOpenShareModal] = useState(false);
  const [justAddedTx, setJustAddedTx] = useState<EmployeeTransaction | null>(null);
  const [sharePhone, setSharePhone] = useState('');
  const [savePhoneToProfile, setSavePhoneToProfile] = useState(false);

  // Export states
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [exportDateRange, setExportDateRange] = useState('all');
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [exportEndDate, setExportEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // New Employee fields
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalary, setEmpSalary] = useState('');

  // New Transaction fields
  const [txType, setTxType] = useState<'salary_pay' | 'advance_pay' | 'bonus_pay'>('salary_pay');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleExport = (isDownload: boolean) => {
    // Filter employee transactions by date range
    const filteredTxs = employeeTransactions.filter(t => {
      if (exportDateRange === 'all') return true;
      const targetTime = new Date(t.date).getTime();
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

    const rangeLabel = exportDateRange === 'all' ? 'جميع البيانات' : 
                       exportDateRange === 'month' ? 'الشهر الحالي' : 
                       `الفترة من ${exportStartDate} إلى ${exportEndDate}`;

    // Generate HTML for employee ledger
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير كشوفات العمال والرواتب</title>
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
            border-bottom: 3px double #10b981;
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
            color: #10b981;
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
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
          }
          .report-table th {
            background-color: #10b981;
            color: #ffffff;
            text-align: right;
            padding: 10px 12px;
            font-weight: 700;
            border: 1px solid #10b981;
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
            background-color: #ecfdf5 !important;
            border-top: 2px solid #10b981;
          }
          .total-row td {
            color: #047857;
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
          <button onclick="window.print()" class="no-print" style="position: fixed; top: 20px; left: 20px; background-color: #10b981; color: #ffffff; font-family: 'Cairo', sans-serif; font-weight: 800; font-size: 12px; border: none; padding: 10px 20px; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); cursor: pointer; z-index: 99999;">
            🖨️ طباعة أو حفظ كـ PDF بالجوال
          </button>
        ` : ''}

        <div class="report-header">
          <div class="logo-box">
            <img class="logo-img" src="/logo.jpg" alt="Logo" onerror="this.style.display='none'" referrerPolicy="no-referrer" />
            <div>
              <h1 class="title">مدونة الحسابات المتقدمة</h1>
              <p class="subtitle">تقرير شؤون العمال والموظفين والرواتب</p>
            </div>
          </div>
          <div class="meta-info">
            <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>النطاق الزمني:</strong> ${rangeLabel}</p>
          </div>
        </div>

        <h3 style="color: #10b981; border-bottom: 2px solid #a7f3d0; padding-bottom: 5px; font-size: 14px;">جدول العمال والرواتب والمستحقات</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>المسمى الوظيفي</th>
              <th>الراتب الأساسي</th>
              <th>إجمالي المدفوع</th>
              <th>السلف والعهد</th>
              <th>المكافآت والبونص</th>
              <th>الرصيد المستحق</th>
            </tr>
          </thead>
          <tbody>
            ${employees.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:#888;">لا يوجد موظفون مسجلون حالياً</td></tr>' : 
              employees.map(emp => {
                const empTxs = filteredTxs.filter(t => t.employeeId === emp.id);
                const salariesPaid = empTxs.filter(t => t.type === 'salary_pay').reduce((s, t) => s + t.amount, 0);
                const advances = empTxs.filter(t => t.type === 'advance_pay').reduce((s, t) => s + t.amount, 0);
                const bonuses = empTxs.filter(t => t.type === 'bonus_pay').reduce((s, t) => s + t.amount, 0);
                const net = emp.salaryRate + bonuses - advances - salariesPaid;

                return `
                  <tr>
                    <td style="font-weight: bold;">${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.salaryRate.toLocaleString('ar-EG')} ريال</td>
                    <td>${salariesPaid.toLocaleString('ar-EG')} ريال</td>
                    <td>${advances.toLocaleString('ar-EG')} ريال</td>
                    <td>${bonuses.toLocaleString('ar-EG')} ريال</td>
                    <td style="font-weight: bold; color: ${net > 0 ? '#10b981' : '#c2410c'};">${net.toLocaleString('ar-EG')} ريال</td>
                  </tr>
                `;
              }).join('')}
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
      a.download = `تقرير_رواتب_العمال_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم تحميل كشف العمال وحفظه في تخزين الهاتف بنجاح!', 'success');
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
      showToast('جاري استدعاء شاشة الطباعة وحفظ الـ PDF...', 'success');
    }
    setIsOpenExport(false);
  };
  const [txNotes, setTxNotes] = useState('');

  const handleAddEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empRole.trim() || !empSalary || parseFloat(empSalary) <= 0) {
      showToast('الرجاء تعبئة الحقول الأساسية بشكل صحيح', 'error');
      return;
    }
    onAddEmployee({
      name: empName.trim(),
      role: empRole.trim(),
      phone: empPhone.trim() || undefined,
      salaryRate: parseFloat(empSalary),
      hiredAt: new Date().toISOString().split('T')[0]
    });
    setEmpName('');
    setEmpRole('');
    setEmpPhone('');
    setEmpSalary('');
    setIsOpenAddEmp(false);
    showToast('تم تسجيل العامل بنجاح', 'success');
  };

  const formatWhatsAppPhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, ''); // keep digits only
    if (cleaned.startsWith('05') && cleaned.length === 10) {
      cleaned = '966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5') && cleaned.length === 9) {
      cleaned = '966' + cleaned;
    }
    return cleaned;
  };

  const handlePrintReceipt = (tx: EmployeeTransaction) => {
    const emp = employees.find(e => e.id === tx.employeeId);
    if (!emp) return;

    const empTxs = employeeTransactions.filter(t => t.employeeId === tx.employeeId);
    const isTxInList = empTxs.some(t => t.id === tx.id);
    const finalTxs = isTxInList ? empTxs : [tx, ...empTxs];

    const salariesPaid = finalTxs.filter(t => t.type === 'salary_pay' && t.id !== tx.id).reduce((s, t) => s + t.amount, 0);
    const advances = finalTxs.filter(t => t.type === 'advance_pay' && t.id !== tx.id).reduce((s, t) => s + t.amount, 0);
    const bonuses = finalTxs.filter(t => t.type === 'bonus_pay' && t.id !== tx.id).reduce((s, t) => s + t.amount, 0);

    const baseSalary = emp.salaryRate;
    
    // Values after the current transaction is recorded:
    const finalSalariesPaid = salariesPaid + (tx.type === 'salary_pay' ? tx.amount : 0);
    const finalAdvances = advances + (tx.type === 'advance_pay' ? tx.amount : 0);
    const finalBonuses = bonuses + (tx.type === 'bonus_pay' ? tx.amount : 0);
    const netRemaining = baseSalary + finalBonuses - finalAdvances - finalSalariesPaid;

    const txLabel = tx.type === 'salary_pay' ? 'تسليم راتب شهري' :
                    tx.type === 'advance_pay' ? 'سلفة مالية (خصم)' :
                    'مكافأة وبونص مميز';

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند مالي - ${emp.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            margin: 0;
            padding: 40px;
            direction: rtl;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            border: 2px dashed #10b981;
            border-radius: 24px;
            padding: 30px;
            background-color: #fafafa;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 25px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .header h1 {
            color: #10b981;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
          }
          .header p {
            color: #64748b;
            margin: 5px 0 0 0;
            font-size: 13px;
            font-weight: 600;
          }
          .receipt-title {
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            background-color: #e6fbf4;
            color: #047857;
            padding: 8px 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            display: inline-block;
            width: auto;
          }
          .title-wrapper {
            text-align: center;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }
          .label {
            color: #64748b;
            font-weight: 600;
          }
          .value {
            color: #0f172a;
            font-weight: 700;
          }
          .highlight-value {
            color: #10b981;
            font-size: 18px;
            font-weight: 800;
          }
          .divider {
            border-top: 2px solid #e2e8f0;
            margin: 20px 0;
          }
          .dashed-divider {
            border-top: 2px dashed #cbd5e1;
            margin: 20px 0;
          }
          .section-title {
            color: #0f172a;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 35px;
            font-size: 12px;
            color: #94a3b8;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .sig-box {
            text-align: center;
            width: 45%;
          }
          .sig-line {
            border-top: 1px solid #94a3b8;
            margin-top: 40px;
            width: 150px;
            display: inline-block;
          }
          @media print {
            body { padding: 0; }
            .receipt-container {
              box-shadow: none;
              border: 2px dashed #000;
              background-color: #fff;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>مدونة الحسابات المتقدمة</h1>
            <p>نظام إدارة شؤون العمال والرواتب الذكي</p>
          </div>

          <div class="title-wrapper">
            <div class="receipt-title">سند مالي رسمي معتمد</div>
          </div>

          <div class="row">
            <span class="label">رقم السند المرجعي:</span>
            <span class="value">${tx.id}</span>
          </div>
          <div class="row">
            <span class="label">تاريخ الحركة:</span>
            <span class="value">${tx.date}</span>
          </div>

          <div class="divider"></div>

          <div class="section-title">بيانات الموظف المستلم</div>
          <div class="row">
            <span class="label">اسم الموظف الكامل:</span>
            <span class="value">${emp.name}</span>
          </div>
          <div class="row">
            <span class="label">المسمى الوظيفي:</span>
            <span class="value">${emp.role}</span>
          </div>
          ${emp.phone ? `
          <div class="row">
            <span class="label">رقم الجوال:</span>
            <span class="value">${emp.phone}</span>
          </div>
          ` : ''}

          <div class="divider"></div>

          <div class="section-title">تفاصيل القيد المالي والعملية</div>
          <div class="row">
            <span class="label">نوع العملية:</span>
            <span class="value">${txLabel}</span>
          </div>
          <div class="row">
            <span class="label">البيان / ملاحظات:</span>
            <span class="value">${tx.notes || 'معتمدة ومسجلة بالنظام الإلكتروني'}</span>
          </div>
          <div class="row" style="background-color: #f1f5f9; padding: 12px; border-radius: 12px; margin-top: 10px;">
            <span class="label" style="color: #0f172a; display: flex; align-items: center;">المبلغ المقيد:</span>
            <span class="highlight-value">${tx.amount.toLocaleString('ar-EG')} ريال سعودي</span>
          </div>

          <div class="dashed-divider"></div>

          <div class="section-title">الوضعية المالية الحالية بعد القيد</div>
          <div class="row">
            <span class="label">الراتب الأساسي الشهري:</span>
            <span class="value">${baseSalary.toLocaleString('ar-EG')} ريال</span>
          </div>
          <div class="row">
            <span class="label">إجمالي المكافآت والبونص المقيدة:</span>
            <span class="value" style="color: #10b981;">+${finalBonuses.toLocaleString('ar-EG')} ريال</span>
          </div>
          <div class="row">
            <span class="label">إجمالي السلف والمسحوبات والعهد:</span>
            <span class="value" style="color: #ef4444;">-${finalAdvances.toLocaleString('ar-EG')} ريال</span>
          </div>
          <div class="row">
            <span class="label">إجمالي الرواتب المستلمة سابقاً:</span>
            <span class="value">-${finalSalariesPaid.toLocaleString('ar-EG')} ريال</span>
          </div>
          <div class="row" style="background-color: #ecfdf5; padding: 14px; border-radius: 14px; margin-top: 10px; border: 1px solid #a7f3d0;">
            <span class="label" style="color: #047857; font-weight: 800;">الراتب المتبقي والمستحق حالياً:</span>
            <span class="value" style="color: #047857; font-size: 18px; font-weight: 800;">${netRemaining.toLocaleString('ar-EG')} ريال سعودي</span>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <span class="label">توقيع المستلم (العامل/الموظف)</span>
              <br><span class="sig-line"></span>
            </div>
            <div class="sig-box">
              <span class="label">توقيع وختم المنشأة والمسؤول</span>
              <br><span class="sig-line"></span>
            </div>
          </div>

          <div class="footer">
            <p>سند إلكتروني رسمي صادر من "مدونة الحسابات المتقدمة" - كافة الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  const triggerAutomaticWhatsAppSend = (tx: EmployeeTransaction, emp: Employee) => {
    const isEnabled = localStorage.getItem('ws_linked') === 'true';

    if (!isEnabled) {
      console.log('Automated WhatsApp is disabled or device is not linked in WhatsApp tab.');
      return;
    }

    if (!emp.phone) {
      showToast(`تم قيد المعاملة، ولكن لم يتم إرسال واتساب تلقائي لعدم توفر رقم هاتف للموظف ${emp.name}`, 'info');
      return;
    }

    // Calculate balances after this transaction
    const empTxs = employeeTransactions.filter(t => t.employeeId === emp.id);
    const isTxInList = empTxs.some(t => t.id === tx.id);
    const finalTxs = isTxInList ? empTxs : [tx, ...empTxs];

    const salariesPaid = finalTxs.filter(t => t.type === 'salary_pay' && t.id !== tx.id).reduce((s, t) => s + t.amount, 0);
    const advances = finalTxs.filter(t => t.type === 'advance_pay' && t.id !== tx.id).reduce((s, t) => s + t.amount, 0);
    const bonuses = finalTxs.filter(t => t.type === 'bonus_pay' && t.id !== tx.id).reduce((s, t) => s + t.amount, 0);

    const finalSalariesPaid = salariesPaid + (tx.type === 'salary_pay' ? tx.amount : 0);
    const finalAdvances = advances + (tx.type === 'advance_pay' ? tx.amount : 0);
    const finalBonuses = bonuses + (tx.type === 'bonus_pay' ? tx.amount : 0);
    
    const baseSalary = emp.salaryRate;
    const netRemaining = baseSalary + finalBonuses - finalAdvances - finalSalariesPaid;

    const txLabel = tx.type === 'salary_pay' ? 'تسليم راتب شهري' :
                    tx.type === 'advance_pay' ? 'سلفة مالية (خصم)' :
                    'مكافأة وبونص مميز';

    const receiptUrl = `${window.location.origin}/receipt?id=${tx.id}&name=${encodeURIComponent(emp.name)}&role=${encodeURIComponent(emp.role)}&type=${tx.type}&amount=${tx.amount}&date=${tx.date}&notes=${encodeURIComponent(tx.notes || '')}&remaining=${netRemaining}&salary=${baseSalary}`;

    const messageText = `*سند مالي رسمي - مدونة الحسابات المتقدمة* 📄✨
-----------------------------------------
👤 *الموظف:* ${emp.name}
💼 *الوظيفة:* ${emp.role}
-----------------------------------------
📝 *نوع العملية:* ${txLabel}
💰 *المبلغ المقيد:* ${tx.amount.toLocaleString('ar-EG')} ريال سعودي
📅 *التاريخ:* ${tx.date}
✍ *البيان:* ${tx.notes || 'سند رسمي مسجل بالنظام'}
-----------------------------------------
📊 *الملخص والوضعية المالية:*
💵 *الراتب الأساسي:* ${baseSalary.toLocaleString('ar-EG')} ريال
🎁 *إجمالي المكافآت:* ${finalBonuses.toLocaleString('ar-EG')} ريال
💸 *إجمالي السلف والمسحوبات:* ${finalAdvances.toLocaleString('ar-EG')} ريال
📥 *الرواتب المستلمة سابقاً:* ${finalSalariesPaid.toLocaleString('ar-EG')} ريال
-----------------------------------------
🚨 *صافي الراتب المتبقي والمستحق حالياً:* ${netRemaining.toLocaleString('ar-EG')} ريال سعودي
-----------------------------------------
🔗 *لمشاهدة وتحميل السند المالي كبطاقة رسمية:*
${receiptUrl}

تم إرسال هذا السند تلقائياً من نظام الحسابات الذكي 🤖💻`;

    // Clean phone
    let cleaned = emp.phone.trim();
    if (cleaned.startsWith('05')) {
      cleaned = '966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5')) {
      cleaned = '966' + cleaned;
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
    showToast(`تم فتح نافذة واتساب لتسليم السند للموظف ${emp.name}! 📲`, 'success');
  };

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    if (!txAmount || parseFloat(txAmount) <= 0) {
      showToast('الرجاء إدخال قيمة مالية صحيحة', 'error');
      return;
    }

    const txObj = {
      employeeId: selectedEmpId,
      type: txType,
      amount: parseFloat(txAmount),
      date: txDate,
      notes: txNotes.trim() || undefined
    };

    if (editingEmployeeTx) {
      if (onUpdateEmployeeTx) {
        onUpdateEmployeeTx(editingEmployeeTx.id, txObj);
        showToast('تم تعديل الحركة المالية للعامل بنجاح', 'success');
      }
    } else {
      onAddEmployeeTx(txObj);
      showToast('تم قيد الحركة المالية للعامل بنجاح', 'success');

      // Create a temporary transaction to pass immediately to the share modal
      const tempTx: EmployeeTransaction = {
        ...txObj,
        id: 'etx-' + Date.now()
      };
      
      const currentEmp = employees.find(e => e.id === selectedEmpId);
      
      setJustAddedTx(tempTx);
      setSharePhone(currentEmp?.phone || '');
      setSavePhoneToProfile(false);
      setIsOpenShareModal(true);
    }
    
    setTxAmount('');
    setTxNotes('');
    setEditingEmployeeTx(null);
    setIsOpenAddTx(false);
  };

  // Helper calculations for a single employee
  const getEmployeeStats = (empId: string) => {
    const txs = employeeTransactions.filter(t => t.employeeId === empId);
    const baseSalary = employees.find(e => e.id === empId)?.salaryRate || 0;
    
    const totalPaidSalary = txs.filter(t => t.type === 'salary_pay').reduce((sum, t) => sum + t.amount, 0);
    const totalAdvances = txs.filter(t => t.type === 'advance_pay').reduce((sum, t) => sum + t.amount, 0);
    const totalBonuses = txs.filter(t => t.type === 'bonus_pay').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalPaidSalary,
      totalAdvances,
      totalBonuses,
      txCount: txs.length
    };
  };

  const activeEmployee = employees.find(e => e.id === selectedEmpId) || null;
  const activeEmployeeTxs = selectedEmpId ? employeeTransactions.filter(t => t.employeeId === selectedEmpId) : [];
  const activeEmpStats = selectedEmpId ? getEmployeeStats(selectedEmpId) : null;

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {!activeEmployee ? (
        // Main view - List of employees
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  شؤون الموظفين والعمال والرواتب
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-2 flex items-center gap-1.5">
                  <Users className="text-emerald-400" size={20} />
                  <span>جدول حسابات العمال والمستحقات</span>
                </h3>
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
                  onClick={() => setIsOpenAddEmp(true)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-3 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <UserPlus size={16} />
                  <span>إضافة عامل جديد</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 py-3.5 pl-4 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="البحث عن اسم عامل، أو المسمى الوظيفي..."
            />
          </div>

          {/* Employees List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 text-slate-500">
                <Users size={40} className="text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-400 mb-1">لا يوجد عمال مضافين حالياً</h4>
                <p className="text-xs text-slate-500">أضف العاملين والمهنيين لتنظيم الرواتب والسلفيات.</p>
              </div>
            ) : (
              filteredEmployees.map(emp => {
                const stats = getEmployeeStats(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    className="rounded-2xl bg-slate-900 border border-slate-800/60 p-5 hover:border-slate-700/80 hover:bg-slate-850/50 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-100 text-base group-hover:text-emerald-400 transition-colors">{emp.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1">
                            <Briefcase size={12} className="text-slate-500" />
                            <span>{emp.role}</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded-lg">
                          راتب: {emp.salaryRate} ريال
                        </span>
                      </div>

                      {/* Brief financial totals */}
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-850">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-bold block">إجمالي السلف</span>
                          <span className="text-xs font-black text-amber-400">{stats.totalAdvances} ريال</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-bold block">المدفوع رواتب</span>
                          <span className="text-xs font-black text-emerald-400">{stats.totalPaidSalary} ريال</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-bold text-emerald-400 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-xl px-3 py-2 transition-all">
                      <span>عرض كشف الحساب والمدفوعات</span>
                      <ChevronLeft size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        // Detailed Employee View
        <div className="space-y-6">
          {/* Top navigation row */}
          <button
            onClick={() => setSelectedEmpId(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <span>← الرجوع لقائمة العمال</span>
          </button>

          {/* Profile overview card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-100">{activeEmployee.name}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1.5 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} className="text-emerald-400" />
                    {activeEmployee.role}
                  </span>
                  {activeEmployee.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-emerald-400" />
                      {activeEmployee.phone}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingEmployeeTx(null);
                    setTxAmount('');
                    setTxNotes('');
                    setTxType('salary_pay');
                    setTxDate(new Date().toISOString().split('T')[0]);
                    setIsOpenAddTx(true);
                  }}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-white transition-colors shadow-md"
                >
                  <Plus size={14} />
                  <span>قيد حركة مالية جديدة</span>
                </button>

                <button
                  onClick={() => {
                    onDeleteEmployee(activeEmployee.id);
                    setSelectedEmpId(null);
                    showToast('تم حذف العامل بالكامل', 'info');
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="حذف الموظف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-850">
              <div className="text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">الراتب الأساسي</span>
                <span className="text-base font-black text-slate-200">{activeEmployee.salaryRate} ريال</span>
              </div>
              <div className="text-center space-y-1 border-r border-l border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">إجمالي السلف</span>
                <span className="text-base font-black text-amber-400">{activeEmpStats?.totalAdvances} ريال</span>
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">إجمالي الرواتب والمنح</span>
                <span className="text-base font-black text-emerald-400">
                  {((activeEmpStats?.totalPaidSalary || 0) + (activeEmpStats?.totalBonuses || 0))} ريال
                </span>
              </div>
            </div>
          </div>

          {/* Transactions list */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-300">سجل دفعات الرواتب والسلف السابقة</h4>
            
            {activeEmployeeTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/20 text-slate-500">
                <FileText size={32} className="text-slate-700 mb-2" />
                <p className="text-xs">لم يتم تسجيل أي سلف أو تسليمات رواتب لهذا الموظف بعد.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeEmployeeTxs.map(tx => (
                  <div 
                    key={tx.id}
                    className="rounded-xl bg-slate-900 p-4 border border-slate-800/60 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tx.type === 'salary_pay' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.type === 'advance_pay' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {tx.type === 'salary_pay' ? 'تسليم راتب' :
                           tx.type === 'advance_pay' ? 'سلفة مالية' :
                           'مكافأة مميزة'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{tx.date}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 font-medium">{tx.notes || 'سداد أو تسليم مالي مسجل'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black ${
                        tx.type === 'salary_pay' ? 'text-emerald-400' :
                        tx.type === 'advance_pay' ? 'text-amber-400' :
                        'text-indigo-400'
                      }`}>
                        {tx.amount.toLocaleString('ar-EG')} ريال
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setJustAddedTx(tx);
                            setIsOpenShareModal(true);
                          }}
                          className="p-1 rounded text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors"
                          title="عرض ومعاينة السند المالي"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(tx)}
                          className="p-1 rounded text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                          title="طباعة السند الورقي"
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingEmployeeTx(tx);
                            setTxAmount(tx.amount.toString());
                            setTxType(tx.type);
                            setTxDate(tx.date);
                            setTxNotes(tx.notes || '');
                            setIsOpenAddTx(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="تعديل الحركة المالية"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            onDeleteEmployeeTx(tx.id);
                            showToast('تم حذف الحركة المالية الموظف بنجاح', 'info');
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="حذف الحركة المالية"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add Employee */}
      <AnimatePresence>
        {isOpenAddEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenAddEmp(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl z-10"
            >
              <div className="border-b border-slate-800 p-5 flex justify-between items-center">
                <h3 className="font-bold text-slate-200">إضافة عامل جديد 👷‍♂️</h3>
                <button onClick={() => setIsOpenAddEmp(false)} className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors">
                  إغلاق
                </button>
              </div>

              <form onSubmit={handleAddEmpSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: صالح محمد السليم"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">المسمى الوظيفي *</label>
                    <input
                      type="text"
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="مثال: كهربائي، محاسب"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">الراتب الشهري الأساسي *</label>
                    <input
                      type="number"
                      value={empSalary}
                      onChange={(e) => setEmpSalary(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="ريال سعودي"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">رقم الهاتف (اختياري)</label>
                  <input
                    type="tel"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="05XXXXXXXX"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenAddEmp(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-400 transition-colors"
                  >
                    حفظ بيانات الموظف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add Employee Transaction */}
      <AnimatePresence>
        {isOpenAddTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenAddTx(false)}
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
                  {editingEmployeeTx ? 'تعديل المعاملة المالية للعامل ✏️' : 'قيد معاملة مالية للعامل 💸'}
                </h3>
                <button onClick={() => {
                  setIsOpenAddTx(false);
                  setEditingEmployeeTx(null);
                }} className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors">
                  إغلاق
                </button>
              </div>

              <form onSubmit={handleAddTxSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">نوع الحركة المالية</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('salary_pay')}
                      className={`py-2 text-xs font-bold border rounded-xl transition-colors ${
                        txType === 'salary_pay' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      تسليم راتب
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('advance_pay')}
                      className={`py-2 text-xs font-bold border rounded-xl transition-colors ${
                        txType === 'advance_pay' ? 'border-amber-500 bg-amber-500/15 text-amber-400' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      سلفة مالية
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('bonus_pay')}
                      className={`py-2 text-xs font-bold border rounded-xl transition-colors ${
                        txType === 'bonus_pay' ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      مكافأة مميزة
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">قيمة المبلغ (ريال) *</label>
                    <input
                      type="number"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">تاريخ القيد</label>
                    <input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">البيان / ملاحظات المعاملة</label>
                  <input
                    type="text"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: تسليم الراتب كاملاً بشيك أو نقداً..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenAddTx(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-400 transition-colors"
                  >
                    تأكيد وتسجيل القيد
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
                  <FileText className="text-emerald-400" size={18} />
                  <h3 className="font-bold text-slate-200 text-xs">تصدير تقرير كشوفات العمال والرواتب 📊</h3>
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
                  <label className="block text-xs font-semibold text-slate-400">الفترة الزمنية المراد تصفيتها:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportDateRange('all')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'all' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الكل (كل الأوقات)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportDateRange('month')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'month' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      الشهر الحالي
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportDateRange('custom')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        exportDateRange === 'custom' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">إلى تاريخ:</span>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleExport(false)}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                  >
                    <Printer size={16} />
                    <span>طباعة وتصدير PDF مباشر</span>
                  </button>

                  <button
                    onClick={() => handleExport(true)}
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

      {/* MODAL: Visual Receipt Preview & Print */}
      <AnimatePresence>
        {isOpenShareModal && justAddedTx && (() => {
          const shareEmp = employees.find(e => e.id === justAddedTx.employeeId);
          if (!shareEmp) return null;

          const empTxs = employeeTransactions.filter(t => t.employeeId === justAddedTx.employeeId);
          const isTxInList = empTxs.some(t => t.id === justAddedTx.id);
          const finalTxs = isTxInList ? empTxs : [justAddedTx, ...empTxs];

          // We want the balances *after* this transaction is recorded.
          const salariesPaid = finalTxs.filter(t => t.type === 'salary_pay' && t.id !== justAddedTx.id).reduce((s, t) => s + t.amount, 0);
          const advances = finalTxs.filter(t => t.type === 'advance_pay' && t.id !== justAddedTx.id).reduce((s, t) => s + t.amount, 0);
          const bonuses = finalTxs.filter(t => t.type === 'bonus_pay' && t.id !== justAddedTx.id).reduce((s, t) => s + t.amount, 0);

          const finalSalariesPaid = salariesPaid + (justAddedTx.type === 'salary_pay' ? justAddedTx.amount : 0);
          const finalAdvances = advances + (justAddedTx.type === 'advance_pay' ? justAddedTx.amount : 0);
          const finalBonuses = bonuses + (justAddedTx.type === 'bonus_pay' ? justAddedTx.amount : 0);
          
          const baseSalary = shareEmp.salaryRate;
          const netRemaining = baseSalary + finalBonuses - finalAdvances - finalSalariesPaid;

          const txLabel = justAddedTx.type === 'salary_pay' ? 'تسليم راتب شهري' :
                          justAddedTx.type === 'advance_pay' ? 'سلفة مالية (خصم)' :
                          'مكافأة وبونص مميز';

          const handleSendWhatsAppReceipt = async () => {
            const isLinked = localStorage.getItem('ws_linked') === 'true';
            if (!isLinked) {
              showToast('يرجى ربط وتفعيل حساب واتساب أولاً من صفحة حسابي (بوابتي والاشتراك) لتنشيط ميزة الإرسال المباشر ⚠️', 'error');
              return;
            }

            const whatsappMessageText = `*سند مالي رسمي - مدونة الحسابات المتقدمة* 📄✨
------------------------------------------
👤 *الموظف:* ${shareEmp.name}
💼 *الوظيفة:* ${shareEmp.role}
------------------------------------------
📝 *نوع العملية:* ${txLabel}
💰 *مبلغ العملية:* ${justAddedTx.amount.toLocaleString('ar-EG')} ريال سعودي
📅 *تاريخ القيد:* ${justAddedTx.date}
✍ *البيان:* ${justAddedTx.notes || 'معتمدة ومسجلة بالنظام الإلكتروني'}
------------------------------------------
📊 *الخلاصة المالية لشهر الجاري:*
💵 *الراتب الأساسي:* ${baseSalary.toLocaleString('ar-EG')} ريال
🎁 *إجمالي المكافآت:* ${finalBonuses.toLocaleString('ar-EG')} ريال
💸 *إجمالي السلف والخصومات:* ${finalAdvances.toLocaleString('ar-EG')} ريال
📥 *الرواتب المستلمة سابقاً:* ${finalSalariesPaid.toLocaleString('ar-EG')} ريال
------------------------------------------
🚨 *صافي الراتب المتبقي والمستحق حالياً:* ${netRemaining.toLocaleString('ar-EG')} ريال سعودي
------------------------------------------
تم إرسال هذا السند تلقائياً من نظام الحسابات الذكي 🤖💻`;

            // Format phone
            let phone = shareEmp.phone || '';
            let cleaned = phone.replace(/[^\d+]/g, '');
            if (cleaned.startsWith('05')) {
              cleaned = '966' + cleaned.substring(1);
            } else if (cleaned.startsWith('5')) {
              cleaned = '966' + cleaned;
            } else if (cleaned.startsWith('+')) {
              cleaned = cleaned.substring(1);
            }

            if (!cleaned) {
              showToast('رقم هاتف الموظف غير مسجل أو غير صحيح في ملفه الشخصي ⚠️', 'error');
              return;
            }

            const method = localStorage.getItem('ws_method') || 'direct';
            
            if (method === 'direct') {
              const url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(whatsappMessageText)}`;
              window.open(url, '_blank');
              showToast('تم فتح محادثة الواتساب لإرسال السند الإلكتروني بنجاح! 🟢', 'success');
              return;
            }

            // Otherwise, background server-side post proxy call
            showToast('جاري إرسال السند المالي للموظف تلقائياً في الخلفية عبر البوابة السحابية...', 'info');
            try {
              const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  gatewayType: method,
                  apiUrl: method === 'ultramsg' ? '' : localStorage.getItem('ws_custom_url') || '',
                  token: localStorage.getItem('ws_token') || '',
                  instanceId: localStorage.getItem('ws_instance_id') || '',
                  phone: cleaned,
                  message: whatsappMessageText,
                }),
              });

              const data = await response.json();
              if (response.ok && data.success) {
                showToast(`تم إرسال السند المالي بنجاح للموظف عبر الواتساب السحابي! 🟢🚀`, 'success');
              } else {
                showToast(`فشل الإرسال التلقائي: ${data.error || 'يرجى التحقق من مفاتيح بوابة الإرسال'} ❌`, 'error');
              }
            } catch (err: any) {
              showToast(`خطأ أثناء الاتصال ببوابة الواتساب: ${err.message || 'خطأ في الشبكة'} ❌`, 'error');
            }
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsOpenShareModal(false);
                  setJustAddedTx(null);
                }}
                className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl z-10 flex flex-col my-8 max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="border-b border-slate-800 p-5 flex justify-between items-center bg-slate-900/50">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <FileText size={20} />
                    <h3 className="font-bold text-slate-200">معاينة وطباعة السند المالي</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setIsOpenShareModal(false);
                      setJustAddedTx(null);
                    }} 
                    className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-right">
                  {/* Visual Receipt Card representation */}
                  <div className="rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/[0.02] p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-md">
                      سند مالي إلكتروني
                    </div>
                    
                    <div className="text-center pb-2 border-b border-slate-800">
                      <h4 className="font-black text-slate-200 text-sm">مدونة الحسابات المتقدمة</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">سند معتمد ورسمي للموظف</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">الموظف المستلم:</span>
                        <span className="font-bold text-slate-200 text-xs">{shareEmp.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">نوع العملية والقيد:</span>
                        <span className="font-bold text-slate-200 text-xs">{txLabel}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">تاريخ السند:</span>
                        <span className="font-semibold text-slate-300 text-xs">{justAddedTx.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">ملاحظات:</span>
                        <span className="font-semibold text-slate-300 text-xs truncate max-w-[150px] block">{justAddedTx.notes || 'سند رسمي معتمد'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-3 flex justify-between items-center border border-slate-850">
                      <span className="text-xs font-black text-emerald-400">قيمة المبلغ المقيد:</span>
                      <span className="text-sm font-black text-emerald-400">{justAddedTx.amount.toLocaleString('ar-EG')} ريال سعودي</span>
                    </div>

                    {/* Salary breakdown details */}
                    <div className="pt-3 border-t border-slate-850 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold">
                        <span>الراتب الأساسي:</span>
                        <span className="text-slate-300">{baseSalary.toLocaleString('ar-EG')} ريال</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold">
                        <span>إجمالي المكافآت (+):</span>
                        <span className="text-emerald-400">+{finalBonuses.toLocaleString('ar-EG')} ريال</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold">
                        <span>إجمالي السلف والخصومات (-):</span>
                        <span className="text-amber-400">-{finalAdvances.toLocaleString('ar-EG')} ريال</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold">
                        <span>الرواتب المستلمة سابقاً (-):</span>
                        <span className="text-slate-400">-{finalSalariesPaid.toLocaleString('ar-EG')} ريال</span>
                      </div>
                      <div className="flex justify-between font-black text-xs pt-2.5 border-t border-slate-850 bg-emerald-500/5 -mx-5 px-5 py-2">
                        <span className="text-emerald-400">صافي المتبقي من الراتب:</span>
                        <span className="text-emerald-400">{netRemaining.toLocaleString('ar-EG')} ريال سعودي</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer actions */}
                <div className="border-t border-slate-800 p-5 bg-slate-900/50 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setIsOpenShareModal(false);
                      setJustAddedTx(null);
                    }}
                    className="flex-1 py-3 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                  >
                    <span>إغلاق المعاينة</span>
                  </button>

                  <button
                    onClick={() => {
                      handlePrintReceipt(justAddedTx);
                    }}
                    className="flex-1 py-3 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                  >
                    <Printer size={14} />
                    <span>طباعة وحفظ السند PDF</span>
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

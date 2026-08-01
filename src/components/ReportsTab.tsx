/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Download, Printer, Settings, Filter, 
  Calendar, Check, Copy, Palette, AlertCircle, 
  Sparkles, Wallet, Tag, Users, Home, ClipboardList
} from 'lucide-react';
import { Account, Transaction, DailyExpense, Employee, EmployeeTransaction, HomeNeed } from '../types';

interface ReportsTabProps {
  accounts: Account[];
  transactions: Transaction[];
  dailyExpenses: DailyExpense[];
  employees: Employee[];
  employeeTransactions: EmployeeTransaction[];
  homeNeeds: HomeNeed[];
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type ReportType = 'all' | 'debts' | 'expenses' | 'employees' | 'home';
type ColorTheme = 'gold' | 'emerald' | 'blue' | 'slate';

interface ThemeConfig {
  primary: string;
  secondary: string;
  border: string;
  bgLight: string;
  badge: string;
  accentText: string;
  fontFamily: string;
}

const THEME_PRESETS: Record<ColorTheme, ThemeConfig> = {
  gold: {
    primary: '#B45309', // amber-700
    secondary: '#F59E0B', // amber-500
    border: '#F59E0B',
    bgLight: '#FFFBEB', // amber-50
    badge: 'background-color: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;',
    accentText: '#78350F',
    fontFamily: '"Cairo", sans-serif'
  },
  emerald: {
    primary: '#047857', // emerald-700
    secondary: '#10B981', // emerald-500
    border: '#10B981',
    bgLight: '#ECFDF5', // emerald-50
    badge: 'background-color: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0;',
    accentText: '#064E3B',
    fontFamily: '"Cairo", sans-serif'
  },
  blue: {
    primary: '#1D4ED8', // blue-700
    secondary: '#3B82F6', // blue-500
    border: '#3B82F6',
    bgLight: '#EFF6FF', // blue-50
    badge: 'background-color: #DBEAFE; color: #1E40AF; border: 1px solid #BFDBFE;',
    accentText: '#1E3A8A',
    fontFamily: '"Cairo", sans-serif'
  },
  slate: {
    primary: '#334155', // slate-700
    secondary: '#64748B', // slate-500
    border: '#64748B',
    bgLight: '#F8FAFC', // slate-50
    badge: 'background-color: #F1F5F9; color: #334155; border: 1px solid #E2E8F0;',
    accentText: '#0F172A',
    fontFamily: '"Cairo", sans-serif'
  }
};

export default function ReportsTab({
  accounts,
  transactions,
  dailyExpenses,
  employees,
  employeeTransactions,
  homeNeeds,
  showToast
}: ReportsTabProps) {
  const [reportType, setReportType] = useState<ReportType>('all');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('gold');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First of this month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [reportNotes, setReportNotes] = useState('تقرير مالي رسمي مستخرج الكترونياً من مدونة الحسابات المتقدمة.');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper date formatter
  const formatDateArabic = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('ar-EG', options);
    } catch {
      return dateStr;
    }
  };

  // Filter lists based on date constraints
  const filterByDate = (dateStr: string) => {
    if (dateRange === 'all') return true;
    const targetTime = new Date(dateStr).getTime();
    if (dateRange === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      return targetTime >= startOfMonth.getTime();
    }
    const sTime = new Date(startDate).getTime();
    const eTime = new Date(endDate).getTime();
    return targetTime >= sTime && targetTime <= eTime;
  };

  const getFilteredTransactions = () => transactions.filter(t => filterByDate(t.date));
  const getFilteredExpenses = () => dailyExpenses.filter(e => filterByDate(e.date));
  const getFilteredEmployeeTxs = () => employeeTransactions.filter(et => filterByDate(et.date));

  // --- HTML generation for the PDF Report ---
  const buildReportHtml = (isDownload: boolean) => {
    const theme = THEME_PRESETS[colorTheme];
    const filteredTxs = getFilteredTransactions();
    const filteredExpenses = getFilteredExpenses();
    const filteredEmpTxs = getFilteredEmployeeTxs();

    // Calculate dynamic totals for the summary block
    const debtsTotal = accounts.reduce((sum, acc) => {
      const accTxs = filteredTxs.filter(t => t.accountId === acc.id);
      const debts = accTxs.filter(t => t.type === 'debt').reduce((s, t) => s + t.amount, 0);
      const obs = accTxs.filter(t => t.type === 'obligation').reduce((s, t) => s + t.amount, 0);
      const net = debts - obs;
      return sum + (net > 0 ? net : 0);
    }, 0);

    const obligationsTotal = accounts.reduce((sum, acc) => {
      const accTxs = filteredTxs.filter(t => t.accountId === acc.id);
      const debts = accTxs.filter(t => t.type === 'debt').reduce((s, t) => s + t.amount, 0);
      const obs = accTxs.filter(t => t.type === 'obligation').reduce((s, t) => s + t.amount, 0);
      const net = debts - obs;
      return sum + (net < 0 ? Math.abs(net) : 0);
    }, 0);

    const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Employee payouts details
    const totalSalaryPaid = filteredEmpTxs.filter(t => t.type === 'salary_pay').reduce((sum, t) => sum + t.amount, 0);
    const totalAdvances = filteredEmpTxs.filter(t => t.type === 'advance_pay').reduce((sum, t) => sum + t.amount, 0);
    const totalBonuses = filteredEmpTxs.filter(t => t.type === 'bonus_pay').reduce((sum, t) => sum + t.amount, 0);

    const totalPurchasedHomePrice = homeNeeds.filter(n => n.isPurchased).reduce((sum, n) => sum + (n.expectedPrice || 0), 0);
    const totalPendingHomePrice = homeNeeds.filter(n => !n.isPurchased).reduce((sum, n) => sum + (n.expectedPrice || 0), 0);

    // Build parts of the PDF based on reportType
    let reportContentHtml = '';

    // Section 1: Debts & Obligations Table
    if (reportType === 'all' || reportType === 'debts') {
      reportContentHtml += `
        <div class="section-container">
          <h3 class="section-title">
            <svg style="width:16px;height:16px;fill:${theme.primary};margin-left:5px;vertical-align:middle" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            دفتر ديون والتزامات الأشخاص والجهات
          </h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>الاسم والجهة</th>
                <th>رقم الهاتف</th>
                <th>إجمالي الديون (لك)</th>
                <th>إجمالي المدفوعات (عليك)</th>
                <th>صافي الرصيد الحالي</th>
                <th>الحالة المالية</th>
              </tr>
            </thead>
            <tbody>
              ${accounts.map(acc => {
                const accTxs = filteredTxs.filter(t => t.accountId === acc.id);
                const debts = accTxs.filter(t => t.type === 'debt').reduce((s, t) => s + t.amount, 0);
                const obs = accTxs.filter(t => t.type === 'obligation').reduce((s, t) => s + t.amount, 0);
                const net = debts - obs;
                const statusLabel = net > 0 ? 'مستحق لك' : net < 0 ? 'التزام عليك' : 'متعادل ومستقر';
                const statusStyle = net > 0 ? 'color:#047857; font-weight:bold;' : net < 0 ? 'color:#C2410C; font-weight:bold;' : 'color:#64748B;';
                const rowBg = net !== 0 ? '' : 'style="background-color: #fafafa"';

                return `
                  <tr ${rowBg}>
                    <td class="font-bold">${acc.name}</td>
                    <td>${acc.phone || '—'}</td>
                    <td>${debts.toLocaleString('ar-EG')} ريال</td>
                    <td>${obs.toLocaleString('ar-EG')} ريال</td>
                    <td style="${statusStyle}">${Math.abs(net).toLocaleString('ar-EG')} ريال</td>
                    <td><span style="${statusStyle}">${statusLabel}</span></td>
                  </tr>
                `;
              }).join('')}
              <tr class="table-total-row">
                <td colspan="2">إجمالي ملخص الدفتر</td>
                <td>${debtsTotal.toLocaleString('ar-EG')} ريال</td>
                <td>${obligationsTotal.toLocaleString('ar-EG')} ريال</td>
                <td colspan="2" style="color: ${theme.accentText}">
                  الصافي: ${(debtsTotal - obligationsTotal).toLocaleString('ar-EG')} ريال 
                  (${debtsTotal >= obligationsTotal ? 'مستحق فائض لك' : 'عجز والتزام'})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Section 2: Daily Expenses Table
    if (reportType === 'all' || reportType === 'expenses') {
      reportContentHtml += `
        <div class="section-container" style="page-break-before: auto;">
          <h3 class="section-title">
            <svg style="width:16px;height:16px;fill:${theme.primary};margin-left:5px;vertical-align:middle" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 6.8c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3z"/></svg>
            صرفياتي اليومية والميزانية التشغيلية
          </h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>التصنيف</th>
                <th>الملاحظات والتفاصيل</th>
                <th>قيمة المصروف اليومي</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#888;">لا توجد مصاريف مسجلة في هذه الفترة</td></tr>' : 
                filteredExpenses.map(e => `
                  <tr>
                    <td>${formatDateArabic(e.date)}</td>
                    <td><span class="report-badge">${e.category}</span></td>
                    <td>${e.notes || '—'}</td>
                    <td class="font-bold">${e.amount.toLocaleString('ar-EG')} ريال</td>
                  </tr>
                `).join('')}
              <tr class="table-total-row">
                <td colspan="3">مجموع الصرفيات المجدولة بالفترة</td>
                <td colspan="1" style="color: ${theme.primary}; font-size: 14px;">${totalSpent.toLocaleString('ar-EG')} ريال</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Section 3: Employee Management & Payroll
    if (reportType === 'all' || reportType === 'employees') {
      reportContentHtml += `
        <div class="section-container" style="page-break-before: auto;">
          <h3 class="section-title">
            <svg style="width:16px;height:16px;fill:${theme.primary};margin-left:5px;vertical-align:middle" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            دفتر حسابات ورواتب وبونص العمال والمهندسين
          </h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>اسم العامل</th>
                <th>المسمى الوظيفي</th>
                <th>الراتب الأساسي</th>
                <th>إجمالي المدفوعات (رواتب/مكافآت)</th>
                <th>إجمالي السلف المخصومة</th>
                <th>المستحق المتبقي للعامل</th>
              </tr>
            </thead>
            <tbody>
              ${employees.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#888;">لا يوجد موظفون مضافون حالياً</td></tr>' : 
                employees.map(emp => {
                  const empTxs = filteredEmpTxs.filter(t => t.employeeId === emp.id);
                  const salariesPaid = empTxs.filter(t => t.type === 'salary_pay').reduce((s, t) => s + t.amount, 0);
                  const advances = empTxs.filter(t => t.type === 'advance_pay').reduce((s, t) => s + t.amount, 0);
                  const bonuses = empTxs.filter(t => t.type === 'bonus_pay').reduce((s, t) => s + t.amount, 0);
                  const totalPaidAndBonus = salariesPaid + bonuses;

                  // Let's compute a simple balance: basic salary rate + bonus - advances - salariesPaid
                  const balance = emp.salaryRate + bonuses - advances - salariesPaid;
                  const balanceStyle = balance > 0 ? 'color:#1D4ED8;' : balance < 0 ? 'color:#C2410C;' : 'color:#475569;';

                  return `
                    <tr>
                      <td class="font-bold">${emp.name}</td>
                      <td>${emp.role}</td>
                      <td>${emp.salaryRate.toLocaleString('ar-EG')} ريال</td>
                      <td>${totalPaidAndBonus.toLocaleString('ar-EG')} ريال <span style="font-size: 9px; color:#666;">(مكافأة: ${bonuses})</span></td>
                      <td>${advances.toLocaleString('ar-EG')} ريال</td>
                      <td style="${balanceStyle}; font-weight:bold;">${balance.toLocaleString('ar-EG')} ريال</td>
                    </tr>
                  `;
                }).join('')}
              <tr class="table-total-row">
                <td colspan="2">إجمالي نفقات الموظفين بالفترة</td>
                <td>${employees.reduce((s, e) => s + e.salaryRate, 0).toLocaleString('ar-EG')} ريال</td>
                <td>${(totalSalaryPaid + totalBonuses).toLocaleString('ar-EG')} ريال</td>
                <td>${totalAdvances.toLocaleString('ar-EG')} ريال</td>
                <td style="color: ${theme.primary}">الرواتب والعهد مغطاة بالكامل</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Section 4: Home Essentials Inventory Checklist
    if (reportType === 'all' || reportType === 'home') {
      reportContentHtml += `
        <div class="section-container" style="page-break-before: auto;">
          <h3 class="section-title">
            <svg style="width:16px;height:16px;fill:${theme.primary};margin-left:5px;vertical-align:middle" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            دفتر مستلزمات واحتياجات المنزل والمكتب
          </h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>اسم الغرض والمستلزم</th>
                <th>القسم والتصنيف</th>
                <th>التكلفة المتوقعة</th>
                <th>حالة التوفر والشراء</th>
              </tr>
            </thead>
            <tbody>
              ${homeNeeds.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#888;">لا توجد مستلزمات مضافة</td></tr>' : 
                homeNeeds.map(n => `
                  <tr>
                    <td class="font-bold">${n.name}</td>
                    <td><span class="report-badge">${n.category}</span></td>
                    <td>${(n.expectedPrice || 0).toLocaleString('ar-EG')} ريال</td>
                    <td>
                      <span style="${n.isPurchased ? 'color:#047857;background-color:#EBFDF5;padding:2px 8px;border-radius:12px;font-size:10px;' : 'color:#B45309;background-color:#FFFBEB;padding:2px 8px;border-radius:12px;font-size:10px;'}">
                        ${n.isPurchased ? 'تم شراؤه وتجهيزه ✓' : 'مطلوب وقيد الانتظار ⏳'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              <tr class="table-total-row">
                <td colspan="2">إجمالي نفقات المنزل المخططة والمنفذة</td>
                <td>المشترى: ${totalPurchasedHomePrice.toLocaleString('ar-EG')} ريال</td>
                <td>المتبقي: ${totalPendingHomePrice.toLocaleString('ar-EG')} ريال</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Full layout builder with print styling overrides
    const fullHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير مالي رسمي - مدونة الحسابات المتقدمة</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: ${theme.fontFamily};
            color: #1e293b;
            background-color: #ffffff;
            margin: 0;
            padding: 30px;
            direction: rtl;
            font-size: 12px;
            line-height: 1.6;
          }
          
          /* Header Banner styled elegantly */
          .report-header {
            border-bottom: 3px double ${theme.primary};
            padding-bottom: 20px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .report-logo-text {
            font-size: 24px;
            font-weight: 800;
            color: ${theme.primary};
            margin: 0;
            display: flex;
            align-items: center;
            letter-spacing: -0.5px;
          }
          
          .report-logo-img {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            object-fit: cover;
            margin-left: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          
          .report-subtitle {
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

          /* Consolidated executive preview summary block */
          .executive-summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }

          .summary-card {
            background-color: ${theme.bgLight};
            border: 1px solid ${theme.border}40;
            border-right: 5px solid ${theme.primary};
            border-radius: 12px;
            padding: 12px 15px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .summary-card h4 {
            margin: 0 0 5px 0;
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: bold;
          }

          .summary-card .value {
            font-size: 16px;
            font-weight: 800;
            color: ${theme.accentText};
          }

          /* Outstanding styling for tables */
          .section-container {
            margin-bottom: 35px;
          }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: ${theme.primary};
            margin-bottom: 12px;
            border-bottom: 2px solid ${theme.primary}20;
            padding-bottom: 6px;
            display: flex;
            align-items: center;
          }

          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }

          .report-table th {
            background-color: ${theme.primary};
            color: #ffffff;
            text-align: right;
            padding: 10px 12px;
            font-weight: 600;
            border: 1px solid ${theme.primary};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .report-table td {
            padding: 9px 12px;
            border-bottom: 1px solid #e2e8f0;
            border-left: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
            color: #334155;
          }

          .report-table tr:nth-child(even) {
            background-color: #fafbfc;
          }

          .report-table tr:hover {
            background-color: #f8fafc;
          }

          .table-total-row {
            background-color: ${theme.bgLight} !important;
            font-weight: bold;
            border-top: 2px solid ${theme.primary};
            border-bottom: 2px solid ${theme.primary};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .table-total-row td {
            color: ${theme.accentText};
            font-size: 12px;
            padding: 12px;
          }

          .font-bold {
            font-weight: 700;
          }

          .report-badge {
            display: inline-block;
            background-color: #f1f5f9;
            color: #475569;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 9px;
            font-weight: bold;
          }

          /* Custom user report notes */
          .report-notes-box {
            background-color: #f8fafc;
            border-right: 4px solid #94a3b8;
            padding: 12px 15px;
            border-radius: 8px;
            margin: 25px 0;
            font-size: 11px;
            color: #475569;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Beautiful signature box at bottom */
          .signatures-container {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }

          .signature-block {
            width: 45%;
            text-align: center;
          }

          .signature-title {
            font-weight: bold;
            font-size: 11px;
            color: #334155;
          }

          .signature-line {
            margin-top: 40px;
            border-top: 1px dashed #cbd5e1;
            width: 150px;
            display: inline-block;
          }

          /* Print overrides to guarantee exact high-contrast and table rendering */
          @media print {
            body {
              padding: 0;
              margin: 15mm;
              font-size: 11px;
            }
            .no-print {
              display: none !important;
            }
            .summary-card {
              border-right: 5px solid ${theme.primary} !important;
              background-color: ${theme.bgLight} !important;
            }
            .report-table th {
              background-color: ${theme.primary} !important;
              color: white !important;
            }
            .table-total-row {
              background-color: ${theme.bgLight} !important;
            }
            .section-container {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${isDownload ? `
          <button onclick="window.print()" class="no-print" style="position: fixed; top: 20px; left: 20px; background-color: ${theme.secondary}; color: #000000; font-family: 'Cairo', sans-serif; font-weight: 800; font-size: 12px; border: none; padding: 10px 20px; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); cursor: pointer; display: flex; align-items: center; gap: 6px; z-index: 99999;">
            🖨️ طباعة أو حفظ التقرير كـ PDF بالجوال
          </button>
        ` : ''}

        <div class="report-header">
          <div style="display: flex; align-items: center;">
            <img class="report-logo-img" src="/logo.jpg" alt="شعار" onerror="this.style.display='none'" referrerPolicy="no-referrer" />
            <div>
              <h1 class="report-logo-text">
                مدونة الحسابات المتقدمة
              </h1>
              <p class="report-subtitle">التقارير التحليلية والميزانية المتكاملة</p>
            </div>
          </div>
          <div class="meta-info">
            <p><strong>تاريخ الإصدار:</strong> ${formatDateArabic(new Date().toISOString())}</p>
            <p><strong>فترة التقرير:</strong> ${dateRange === 'all' ? 'جميع البيانات' : dateRange === 'month' ? 'الشهر الحالي فقط' : `من ${formatDateArabic(startDate)} إلى ${formatDateArabic(endDate)}`}</p>
            <p><strong>حالة الترخيص:</strong> نسخة سحابية موثقة</p>
          </div>
        </div>

        <!-- Executive Summaries -->
        <div class="executive-summary-grid">
          <div class="summary-card">
            <h4>إجمالي الديون لك</h4>
            <div class="value">${debtsTotal.toLocaleString('ar-EG')} ريال</div>
          </div>
          <div class="summary-card">
            <h4>إجمالي الالتزامات عليك</h4>
            <div class="value">${obligationsTotal.toLocaleString('ar-EG')} ريال</div>
          </div>
          <div class="summary-card">
            <h4>نفقاتك التشغيلية بالفترة</h4>
            <div class="value">${totalSpent.toLocaleString('ar-EG')} ريال</div>
          </div>
          <div class="summary-card">
            <h4>الصافي المالي العام</h4>
            <div class="value" style="color: ${debtsTotal >= obligationsTotal ? '#047857' : '#B45309'}">
              ${(debtsTotal - obligationsTotal).toLocaleString('ar-EG')} ريال
            </div>
          </div>
        </div>

        <!-- Main Dynamic Tables -->
        ${reportContentHtml}

        <!-- Custom Report Notes -->
        ${reportNotes ? `
          <div class="report-notes-box">
            <strong>ملاحظات التدقيق والمراجعة:</strong>
            <p style="margin:5px 0 0 0">${reportNotes}</p>
          </div>
        ` : ''}

        <!-- Signatures Row -->
        ${includeSignatures ? `
          <div class="signatures-container">
            <div class="signature-block">
              <span class="signature-title">المحاسب المسؤول / مدقق الحسابات</span>
              <br />
              <div class="signature-line"></div>
            </div>
            <div class="signature-block">
              <span class="signature-title">اعتماد الإدارة والمالك</span>
              <br />
              <div class="signature-line"></div>
            </div>
          </div>
        ` : ''}

        ${!isDownload ? `
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        ` : ''}
      </body>
      </html>
    `;
    return fullHtml;
  };

  const handlePrintPdf = () => {
    const printableIframe = iframeRef.current;
    if (!printableIframe) return;

    const doc = printableIframe.contentDocument || printableIframe.contentWindow?.document;
    if (!doc) return;

    const fullHtml = buildReportHtml(false);

    doc.open();
    doc.write(fullHtml);
    doc.close();

    showToast('تم إعداد التقرير بنجاح، جاري فتح نافذة الطباعة وحفظ الـ PDF...', 'success');
  };

  const handleDownloadHtmlFile = () => {
    try {
      const fullHtml = buildReportHtml(true);
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `تقرير_الحسابات_${reportType}_${new Date().toISOString().split('T')[0]}.html`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('تم تحميل مستند التقرير وتخزينه بالجوال بنجاح! يمكنك فتحه ومشاركته الآن.', 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تحميل الملف، يرجى المحاولة لاحقاً', 'error');
    }
  };

  return (
    <div className="space-y-6 text-slate-100" id="pdf-export-tab-container">
      {/* Tab Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              تقارير PDF متميزة واحترافية
            </span>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-1.5 pt-1">
              <FileText className="text-amber-400" size={22} />
              <span>مصمم تقارير مدونة الحسابات المتقدمة</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              يمكنك هنا فلترة وتخصيص مستنداتك المالية وتوليد جداول متميزة للغاية بألوان فخمة، ثم استخراجها مباشرة كملف <span className="font-bold text-amber-400">PDF</span> رسمي جاهز للطباعة أو مشاركته مع عملائك وشركائك.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-850 min-w-[130px]">
            <Sparkles className="text-amber-400" size={28} />
            <span className="text-[10px] font-bold text-slate-500 mt-2">جودة التصدير</span>
            <span className="text-xs font-black text-slate-300 mt-1">متجاوب A4 / PDF</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Controls Column */}
        <div className="md:col-span-1 space-y-5">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2.5">
              <Filter size={14} className="text-emerald-400" />
              <span>إعدادات ونطاق التقرير</span>
            </h4>

            {/* 1. Report Type Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 block">التصنيف المراد تصديره:</label>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => setReportType('all')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-right flex items-center gap-2 border ${
                    reportType === 'all' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <ClipboardList size={14} />
                  <span>التقرير المالي الشامل (كل التصانيف)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('debts')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-right flex items-center gap-2 border ${
                    reportType === 'debts' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Wallet size={14} />
                  <span>ديون والتزامات الأشخاص</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('expenses')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-right flex items-center gap-2 border ${
                    reportType === 'expenses' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Tag size={14} />
                  <span>الصرفيات والمصاريف اليومية</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('employees')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-right flex items-center gap-2 border ${
                    reportType === 'employees' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Users size={14} />
                  <span>نفقات ورواتب العمال</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('home')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-right flex items-center gap-2 border ${
                    reportType === 'home' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Home size={14} />
                  <span>مستلزمات واحتياجات المنزل</span>
                </button>
              </div>
            </div>

            {/* 2. Date Filter Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <label className="text-[11px] font-bold text-slate-400 block">النطاق الزمني للعمليات:</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setDateRange('all')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all ${
                    dateRange === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange('month')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all ${
                    dateRange === 'month' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  الشهر الحالي
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange('custom')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all ${
                    dateRange === 'custom' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  مخصص
                </button>
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-2 animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold">من تاريخ:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[10px] text-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold">إلى تاريخ:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[10px] text-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Aesthetic Color Themes Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <label className="text-[11px] font-bold text-slate-400 block flex items-center gap-1">
                <Palette size={12} className="text-amber-400" />
                <span>طابع التصميم والألوان للتقرير:</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setColorTheme('gold')}
                  className={`py-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    colorTheme === 'gold' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-850 bg-slate-950/50 hover:bg-slate-900'
                  }`}
                  title="الذهبي الملكي"
                >
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-bold text-amber-400">ذهبي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setColorTheme('emerald')}
                  className={`py-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    colorTheme === 'emerald' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-850 bg-slate-950/50 hover:bg-slate-900'
                  }`}
                  title="الأخضر المالي"
                >
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-400">زمردي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setColorTheme('blue')}
                  className={`py-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    colorTheme === 'blue' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-850 bg-slate-950/50 hover:bg-slate-900'
                  }`}
                  title="الأزرق الكلاسيكي"
                >
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-[9px] font-bold text-blue-400">ملكـي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setColorTheme('slate')}
                  className={`py-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    colorTheme === 'slate' ? 'border-slate-400 bg-slate-500/10' : 'border-slate-850 bg-slate-950/50 hover:bg-slate-900'
                  }`}
                  title="الرمادي الهادئ"
                >
                  <span className="h-3 w-3 rounded-full bg-slate-500" />
                  <span className="text-[9px] font-bold text-slate-400">بسيط</span>
                </button>
              </div>
            </div>

            {/* Extra formatting options */}
            <div className="space-y-3 pt-2 border-t border-slate-850">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span className="text-[11px] font-bold text-slate-300">إدراج خانة الاعتماد والتوقيع بالأسفل</span>
              </label>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">ملاحظة أسفل التقرير (اختياري):</span>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500 h-16 resize-none"
                  placeholder="أضف ملاحظة أو شروط لمراجعة الحسابات..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handlePrintPdf}
                className="group w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center justify-center bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow shadow-red-600/30 group-hover:scale-110 transition-transform">
                  PDF
                </span>
                <span>طباعة أو تصدير PDF مباشر</span>
              </button>

              <button
                onClick={handleDownloadHtmlFile}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>تحميل وحفظ نسخة لتخزين الهاتف (HTML/PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings size={14} className="text-amber-400" />
                <span>معاينة حية لشكل المستند والجدول قبل الطباعة</span>
              </h4>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/10">
                جاهز للتصدير
              </span>
            </div>

            {/* Live mockup/preview matching selected style */}
            <div className="flex-1 bg-white text-slate-850 rounded-xl p-5 border border-slate-300 space-y-5 text-right font-sans overflow-y-auto max-h-[500px]">
              {/* Fake header mimicking print layout */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-3">
                <div>
                  <h5 className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                    <span className="bg-slate-900 text-white rounded px-1.5 py-0.5 text-xs font-black">م</span>
                    مدونة الحسابات المتقدمة
                  </h5>
                  <p className="text-[10px] text-slate-500">التقارير المالية والميزانية الشاملة</p>
                </div>
                <div className="text-left text-[9px] text-slate-500">
                  <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                  <p>الحالة: نسخة معاينة معتمدة</p>
                </div>
              </div>

              {/* Sample Quick Summary Cards inside Preview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 border-r-4 border-amber-600">
                  <span className="text-[9px] text-slate-400 block font-bold">إجمالي ديونك</span>
                  <span className="text-xs font-black text-slate-800">
                    {accounts.length > 0 ? 'مستند نشط' : 'فارغ'}
                  </span>
                </div>
                <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 border-r-4 border-emerald-600">
                  <span className="text-[9px] text-slate-400 block font-bold">إجمالي نفقاتك</span>
                  <span className="text-xs font-black text-slate-800">
                    {dailyExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('ar-EG')} ريال
                  </span>
                </div>
                <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 border-r-4 border-blue-600">
                  <span className="text-[9px] text-slate-400 block font-bold">المرؤوسين والعمال</span>
                  <span className="text-xs font-black text-slate-800">
                    {employees.length} عمال نشطين
                  </span>
                </div>
              </div>

              {/* Outstanding Table design mock */}
              <div className="space-y-2">
                <h6 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <span>جدول البيانات المستخرجة بالفئة المحددة</span>
                </h6>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-[10px]">
                    <thead className="bg-slate-900 text-white text-[10px]">
                      <tr>
                        <th className="p-2 border border-slate-700">البند / الاسم</th>
                        <th className="p-2 border border-slate-700">التصنيف</th>
                        <th className="p-2 border border-slate-700">التفاصيل أو الهاتف</th>
                        <th className="p-2 border border-slate-700">القيمة والعملة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {reportType === 'all' || reportType === 'debts' ? (
                        <>
                          <tr>
                            <td className="p-2 font-bold">محمد أحمد الحربي</td>
                            <td className="p-2"><span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px]">ذاتي</span></td>
                            <td className="p-2">0551234567</td>
                            <td className="p-2 text-emerald-600 font-bold">+15,000 ريال</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold">مؤسسة مواد البناء الدولية</td>
                            <td className="p-2"><span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px]">شركة</span></td>
                            <td className="p-2">مشتريات حديد أساسي</td>
                            <td className="p-2 text-rose-600 font-bold">-8,500 ريال</td>
                          </tr>
                        </>
                      ) : null}

                      {reportType === 'expenses' ? (
                        <>
                          <tr>
                            <td className="p-2 font-bold">تجهيز غداء عمل للشركاء</td>
                            <td className="p-2"><span className="bg-rose-100 text-rose-850 px-1.5 py-0.5 rounded text-[9px]">طعام ومشروبات</span></td>
                            <td className="p-2">مطاعم ريفية بجدة</td>
                            <td className="p-2 font-bold">450 ريال</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold">صيانة مروحة المكتب الإداري</td>
                            <td className="p-2"><span className="bg-indigo-100 text-indigo-850 px-1.5 py-0.5 rounded text-[9px]">صيانة عامة</span></td>
                            <td className="p-2">شراء قطع غيار وتغيير مكثف</td>
                            <td className="p-2 font-bold">180 ريال</td>
                          </tr>
                        </>
                      ) : null}

                      {reportType === 'employees' ? (
                        <>
                          <tr>
                            <td className="p-2 font-bold">المهندس عبدالرحمن العتيبي</td>
                            <td className="p-2"><span className="bg-emerald-100 text-emerald-850 px-1.5 py-0.5 rounded text-[9px]">مدير موقع</span></td>
                            <td className="p-2">راتب شهر يوليو المستحق</td>
                            <td className="p-2 font-bold">9,500 ريال</td>
                          </tr>
                        </>
                      ) : null}

                      {reportType === 'home' ? (
                        <>
                          <tr>
                            <td className="p-2 font-bold">شراء منظفات ومعقمات للبيت</td>
                            <td className="p-2"><span className="bg-indigo-100 text-indigo-850 px-1.5 py-0.5 rounded text-[9px]">بقالة</span></td>
                            <td className="p-2">هايبر بنده - مستلزم عاجل</td>
                            <td className="p-2 font-bold">120 ريال</td>
                          </tr>
                        </>
                      ) : null}

                      {/* Fallback if no specific preview row fits */}
                      {reportType === 'all' ? (
                        <tr>
                          <td className="p-2 text-center text-slate-400 italic" colSpan={4}>
                            جداول الفئات الأخرى ستدمج تباعاً في مستند PDF الشامل...
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures preview */}
              {includeSignatures && (
                <div className="flex justify-between items-center pt-8 border-t border-dashed border-slate-200">
                  <div className="text-center w-1/2">
                    <span className="text-[9px] font-bold text-slate-500 block">توقيع مدقق الحسابات</span>
                    <span className="inline-block border-b border-dashed border-slate-300 w-24 mt-4" />
                  </div>
                  <div className="text-center w-1/2">
                    <span className="text-[9px] font-bold text-slate-500 block">اعتماد واعتماد الإدارة</span>
                    <span className="inline-block border-b border-dashed border-slate-300 w-24 mt-4" />
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              💡 <span className="font-bold text-amber-400">نصيحة ذكية:</span> عند فتح نافذة الطباعة، تأكد من تفعيل خيار <span className="text-slate-200 font-bold">"طباعة رسومات الخلفية" (Background Graphics)</span> في المتصفح لتظهر الألوان الفاخرة للتقرير في ملف الـ PDF الخاص بك!
            </p>
          </div>
        </div>
      </div>

      {/* Hidden iframe dedicated for printing to PDF cleanly */}
      <iframe 
        ref={iframeRef} 
        style={{ display: 'none', position: 'absolute', width: 0, height: 0 }} 
        title="PDF Report Generation Target"
      />
    </div>
  );
}

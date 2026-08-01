/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Phone, Calendar, Trash2, Edit2, Plus, 
  ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2,
  Trash, Save
} from 'lucide-react';
import { Account, Transaction } from '../types';
import { CATEGORIES } from '../initialData';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  transactions: Transaction[];
  onAddTransaction: (accountId: string) => void;
  onDeleteTransaction: (txId: string) => void;
  onDeleteAccount: (accountId: string) => void;
  onUpdateAccount: (accountId: string, newName: string, newPhone?: string, newCurrency?: 'USD' | 'YER' | 'SAR') => void;
  onEditTransaction: (tx: Transaction) => void;
}

export default function AccountDetailsModal({
  isOpen,
  onClose,
  account,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onDeleteAccount,
  onUpdateAccount,
  onEditTransaction,
}: AccountDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCurrency, setEditCurrency] = useState<'USD' | 'YER' | 'SAR'>('SAR');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Initialize edit fields when editing is triggered
  const startEditing = () => {
    if (account) {
      setEditName(account.name);
      setEditPhone(account.phone || '');
      setEditCurrency(account.currency || 'SAR');
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    if (account) {
      onUpdateAccount(account.id, editName.trim(), editPhone.trim() || undefined, editCurrency);
      setIsEditing(false);
    }
  };

  if (!isOpen || !account) return null;

  // Calculate stats for this specific account
  const accountTxs = transactions.filter((t) => t.accountId === account.id);
  
  const totalDebts = accountTxs
    .filter((t) => t.type === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalObligations = accountTxs
    .filter((t) => t.type === 'obligation')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalDebts - totalObligations;
  const currencySymbol = account.currency === 'USD' ? '$' : account.currency === 'YER' ? 'ر.ي' : 'ر.س';

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('ar-EG', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        id="account-details-backdrop"
      />

      {/* Main Container */}
      <motion.div
        initial={{ x: '100%', opacity: 0.9 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.9 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-2xl h-full overflow-hidden border-l border-slate-800 bg-slate-900 text-slate-100 shadow-2xl flex flex-col z-10"
        id="account-details-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6 bg-slate-950/50 flex-none">
          <div>
            {isEditing ? (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-base text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="اسم الحساب"
                  id="edit-account-name-input"
                />
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="رقم الهاتف (مثال: 050XXXXXXX)"
                  id="edit-account-phone-input"
                />
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value as 'USD' | 'YER' | 'SAR')}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  id="edit-account-currency-input"
                >
                  <option value="SAR">ريال سعودي (ر.س)</option>
                  <option value="YER">ريال يمني (ر.ي)</option>
                  <option value="USD">دولار أمريكي ($)</option>
                </select>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                  <span>{account.name}</span>
                  <span className="text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {account.currency === 'USD' ? 'دولار ($)' : account.currency === 'YER' ? 'ريال يمني (ر.ي)' : 'ريال سعودي (ر.س)'}
                  </span>
                  <button
                    onClick={startEditing}
                    className="text-slate-500 hover:text-emerald-400 p-1 rounded-lg hover:bg-slate-800 transition-all flex-none"
                    title="تعديل الحساب"
                    id="btn-edit-account-trigger"
                  >
                    <Edit2 size={16} />
                  </button>
                </h2>
                {account.phone && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1.5">
                    <Phone size={14} className="text-slate-500" />
                    <a href={`tel:${account.phone}`} className="hover:text-emerald-400 hover:underline">
                      {account.phone}
                    </a>
                    <span className="text-slate-600">•</span>
                    <a
                      href={`https://wa.me/${account.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:text-emerald-400 hover:underline text-xs"
                    >
                      مراسلة واتساب 💬
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 p-2 text-white transition-colors flex items-center gap-1 text-sm px-3 py-1.5 font-bold"
                  id="btn-save-account-edit"
                >
                  <Save size={16} />
                  <span>حفظ</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 p-2 text-slate-300 transition-colors text-sm px-3 py-1.5"
                  id="btn-cancel-account-edit"
                >
                  إلغاء
                </button>
              </div>
            ) : null}

            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              id="close-account-details-modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Quick Balance Status Summary Card */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
            {/* Total receivable from this person */}
            <div className="text-center p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs text-slate-400">لك (ديون)</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                {totalDebts.toLocaleString('ar-EG')} <span className="text-xs">{currencySymbol}</span>
              </p>
            </div>

            {/* Total payable to this person */}
            <div className="text-center p-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <p className="text-xs text-slate-400">عليك (التزامات)</p>
              <p className="text-lg font-bold text-orange-400 mt-1">
                {totalObligations.toLocaleString('ar-EG')} <span className="text-xs">{currencySymbol}</span>
              </p>
            </div>

            {/* Net Status */}
            <div className={`text-center p-2 rounded-xl border ${
              netBalance > 0 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : netBalance < 0
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                  : 'bg-slate-800/30 border-slate-800 text-slate-400'
            }`}>
              <p className="text-xs text-slate-400">صافي الموقف</p>
              <p className="text-lg font-extrabold mt-1">
                {Math.abs(netBalance).toLocaleString('ar-EG')} <span className="text-xs">{currencySymbol}</span>
              </p>
              <p className="text-[10px] font-semibold mt-0.5">
                {netBalance > 0 ? 'لك عنده' : netBalance < 0 ? 'عليك له' : 'خالص ومتعادل'}
              </p>
            </div>
          </div>

          {/* Action trigger: Add new movement for this account */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200">سجل المعاملات ({accountTxs.length})</h3>
            <button
              onClick={() => onAddTransaction(account.id)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/15 transition-all"
              id="btn-add-tx-for-account"
            >
              <Plus size={14} />
              <span>تسجيل حركة مالية</span>
            </button>
          </div>

          {/* List of transactions */}
          <div className="space-y-3">
            {accountTxs.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/30 text-slate-500">
                <FileText size={40} className="mx-auto mb-2 text-slate-600" />
                <p>لا توجد أي معاملات مسجلة لهذا الحساب</p>
                <button
                  onClick={() => onAddTransaction(account.id)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm mt-2 underline"
                >
                  سجل أول معاملة الآن
                </button>
              </div>
            ) : (
              accountTxs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((tx) => {
                  const categoryInfo = CATEGORIES.find((c) => c.id === tx.category);
                  return (
                    <div
                      key={tx.id}
                      className="group relative rounded-xl bg-slate-950 p-4 border border-slate-800 hover:border-slate-700 transition-all flex justify-between items-start"
                    >
                      <div className="flex gap-3">
                        {/* Status Icon Indicator */}
                        <div className={`mt-0.5 rounded-lg p-1.5 ${
                          tx.type === 'debt' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {tx.type === 'debt' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-bold ${
                              tx.type === 'debt' ? 'text-emerald-400' : 'text-orange-400'
                            }`}>
                              {tx.type === 'debt' ? '+' : '-'}{tx.amount.toLocaleString('ar-EG')} {currencySymbol}
                            </span>
                            
                            {/* Category tag */}
                            {categoryInfo && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${categoryInfo.color}`}>
                                {categoryInfo.label}
                              </span>
                            )}
                          </div>

                          {/* Notes */}
                          {tx.notes && (
                            <p className="text-slate-300 text-sm mt-1.5 leading-relaxed font-medium">
                              {tx.notes}
                            </p>
                          )}

                          {/* Date and details */}
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-2">
                            <Calendar size={12} />
                            <span>{formatDate(tx.date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Edit and Delete action buttons */}
                      <div className="flex items-center gap-1 self-center shrink-0">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          title="تعديل المعاملة"
                          id={`btn-edit-tx-${tx.id}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            onDeleteTransaction(tx.id);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="حذف المعاملة"
                          id={`btn-delete-tx-${tx.id}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Footer Area with Delete Entire Account Button */}
        <div className="border-t border-slate-800 p-6 bg-slate-950/20 flex justify-between items-center flex-none">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar size={12} />
            <span>تاريخ إنشاء الحساب: {formatDate(account.createdAt)}</span>
          </div>

          {showConfirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 font-bold ml-1">تأكيد الحذف النهائي؟</span>
              <button
                onClick={() => {
                  onDeleteAccount(account.id);
                  onClose();
                }}
                className="rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-3 py-1.5 flex items-center gap-1 shadow-lg shadow-red-600/15"
                id="btn-confirm-delete-account"
              >
                <Trash size={12} />
                <span>نعم، احذف الحساب</span>
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5"
                id="btn-cancel-delete-account"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold text-xs px-4 py-2 flex items-center gap-1.5 transition-all"
              id="btn-trigger-delete-account"
            >
              <Trash2 size={14} />
              <span>حذف هذا الحساب بالكامل ⚠️</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

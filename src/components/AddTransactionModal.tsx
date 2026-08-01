/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, User, Coins, Calendar, FileText } from 'lucide-react';
import { Account, Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../initialData';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  preselectedAccountId?: string;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction?: Transaction | null;
  onEdit?: (transaction: Transaction) => void;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  accounts,
  preselectedAccountId,
  onAdd,
  editTransaction,
  onEdit,
}: AddTransactionModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [txType, setTxType] = useState<TransactionType>('debt');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('شخصي');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ accountId?: string; amount?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setSelectedAccountId(editTransaction.accountId);
        setTxType(editTransaction.type);
        setAmount(editTransaction.amount.toString());
        setCategory(editTransaction.category);
        setDate(editTransaction.date);
        setNotes(editTransaction.notes || '');
      } else {
        if (preselectedAccountId) {
          setSelectedAccountId(preselectedAccountId);
        } else if (accounts.length > 0) {
          setSelectedAccountId(accounts[0].id);
        }
        setTxType('debt');
        setAmount('');
        setCategory('شخصي');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
      setErrors({});
    }
  }, [editTransaction, preselectedAccountId, accounts, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { accountId?: string; amount?: string } = {};

    if (!selectedAccountId) {
      newErrors.accountId = 'الرجاء اختيار الحساب المعني';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'الرجاء إدخال مبلغ صحيح أكبر من صفر';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editTransaction && onEdit) {
      onEdit({
        id: editTransaction.id,
        accountId: selectedAccountId,
        type: txType,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      onAdd({
        accountId: selectedAccountId,
        type: txType,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        category,
        notes: notes.trim() || undefined,
      });
    }

    // Reset state
    setAmount('');
    setNotes('');
    setCategory('شخصي');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        id="add-tx-backdrop"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl"
        id="add-tx-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-100">
            {editTransaction ? 'تعديل المعاملة المالية ✏️' : 'تسجيل حركة مالية جديدة 💸'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            id="close-add-tx-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Account Picker */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">الحساب المعني *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                <User size={18} />
              </span>
              <select
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  if (errors.accountId) setErrors({ ...errors, accountId: undefined });
                }}
                disabled={!!preselectedAccountId}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
              >
                {accounts.length === 0 ? (
                  <option value="">لا توجد حسابات مسجلة حالياً</option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            {errors.accountId && <p className="text-xs text-red-400 mt-1">{errors.accountId}</p>}
          </div>

          {/* Transaction Type Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">نوع المعاملة</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTxType('debt')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 border font-semibold transition-all ${
                  txType === 'debt'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                لك (دين على الحساب)
              </button>
              <button
                type="button"
                onClick={() => setTxType('obligation')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 border font-semibold transition-all ${
                  txType === 'obligation'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                عليك (التزام للحساب)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">المبلغ (ريال) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 font-bold">
                <Coins size={18} />
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: undefined });
                }}
                className={`w-full rounded-xl border ${
                  errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'
                } bg-slate-950 py-3 pl-4 pr-10 text-slate-100 placeholder-slate-500 outline-none focus:ring-2`}
                placeholder="0.00"
                min="0"
                step="any"
                id="tx-amount-input"
              />
            </div>
            {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category select */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">ملاحظات المعاملة / التفاصيل (اختياري)</label>
            <div className="relative">
              <span className="absolute top-3 right-3 text-slate-500">
                <FileText size={18} />
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="أدخل تفاصيل إضافية مثل رقم الفاتورة أو سبب السداد..."
                id="tx-notes-input"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              id="cancel-add-tx"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
              id="submit-add-tx"
            >
              حفظ المعاملة
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

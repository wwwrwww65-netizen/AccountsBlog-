/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Coins, Calendar, FileText } from 'lucide-react';
import { Account, Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../initialData';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (account: Account, initialTx?: Omit<Transaction, 'id' | 'accountId'>) => void;
}

export default function AddAccountModal({ isOpen, onClose, onAdd }: AddAccountModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'YER' | 'SAR'>('SAR');
  
  // Initial Balance state
  const [hasInitialBalance, setHasInitialBalance] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('debt');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('شخصي');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; amount?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'الرجاء إدخال اسم الحساب';
    }

    if (hasInitialBalance) {
      if (!amount || parseFloat(amount) <= 0) {
        newErrors.amount = 'الرجاء إدخال مبلغ صحيح أكبر من صفر';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare Account
    const accountId = 'acc-' + Date.now();
    const newAccount: Account = {
      id: accountId,
      name: name.trim(),
      phone: phone.trim() || undefined,
      createdAt: new Date().toISOString(),
      currency,
    };

    // Prepare Initial Transaction if selected
    let initialTx: Omit<Transaction, 'id' | 'accountId'> | undefined;
    if (hasInitialBalance) {
      initialTx = {
        type: txType,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        category,
        notes: notes.trim() || undefined,
      };
    }

    onAdd(newAccount, initialTx);
    
    // Reset fields
    setName('');
    setPhone('');
    setCurrency('SAR');
    setHasInitialBalance(false);
    setTxType('debt');
    setAmount('');
    setCategory('شخصي');
    setNotes('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        id="add-account-backdrop"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl"
        id="add-account-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-100">إضافة حساب جديد 👤</h2>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            id="close-add-account-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          {/* Account Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">اسم الشخص أو الجهة *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={`w-full rounded-xl border ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'
                } bg-slate-950 py-3 pl-4 pr-10 text-slate-100 placeholder-slate-500 outline-none focus:ring-2`}
                placeholder="مثال: أحمد محمد، بقالة النخبة"
                id="input-account-name"
              />
            </div>
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Currency Selection */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">عملة الحساب 🪙</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'SAR', label: 'ريال سعودي', symbol: 'ر.س' },
                { id: 'YER', label: 'ريال يمني', symbol: 'ر.ي' },
                { id: 'USD', label: 'دولار أمريكي', symbol: '$' },
              ].map((curr) => (
                <button
                  type="button"
                  key={curr.id}
                  onClick={() => setCurrency(curr.id as 'USD' | 'YER' | 'SAR')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all ${
                    currency === curr.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-md shadow-emerald-500/5'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-black">{curr.symbol}</span>
                  <span className="text-[10px] font-semibold">{curr.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">رقم الهاتف (اختياري)</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                <Phone size={18} />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="مثال: 050XXXXXXX"
                id="input-account-phone"
              />
            </div>
          </div>

          {/* Toggle for initial transaction */}
          <div className="flex items-center space-x-3 space-x-reverse py-2 border-t border-b border-slate-800">
            <input
              type="checkbox"
              id="toggle-initial-balance"
              checked={hasInitialBalance}
              onChange={(e) => setHasInitialBalance(e.target.checked)}
              className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 outline-none accent-emerald-500"
            />
            <label htmlFor="toggle-initial-balance" className="text-sm font-semibold text-emerald-400 cursor-pointer select-none">
              تسجيل معاملة مالية أولية (رصيد افتتاحي) لهذا الحساب؟
            </label>
          </div>

          {/* Initial Balance Fields */}
          <AnimatePresence>
            {hasInitialBalance && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4"
              >
                {/* Transaction Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">طبيعة المعاملة</label>
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
                      لك (دين على الشخص)
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
                      عليك (التزام للشخص)
                    </button>
                  </div>
                </div>

                 {/* Amount */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">
                    المبلغ ({currency === 'USD' ? 'دولار' : currency === 'YER' ? 'ريال يمني' : 'ريال سعودي'}) *
                  </label>
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
                      placeholder={`أدخل قيمة المبلغ بـ ${currency === 'USD' ? 'الدولار' : currency === 'YER' ? 'الريال اليمني' : 'الريال السعودي'}`}
                      id="input-initial-amount"
                      min="0"
                      step="any"
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
                </div>

                {/* Category & Date Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
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

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300">التاريخ</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">البيان / ملاحظات المعاملة</label>
                  <div className="relative">
                    <span className="absolute top-3 right-3 text-slate-500">
                      <FileText size={18} />
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-10 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="مثال: دفعة متبقية من فاتورة التوريد..."
                      id="input-initial-notes"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              id="cancel-add-account"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
              id="submit-add-account"
            >
              <span>حفظ الحساب الجديد</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

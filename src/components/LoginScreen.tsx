import React, { useState } from 'react';
import { Mail, Lock, User, Phone, LogIn, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLogin: (email: string, name: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح ✉️');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون ٦ خانات على الأقل 🔒');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('يرجى كتابة الاسم بالكامل 👤');
      return;
    }

    setIsLoading(true);

    // Simulate database/API delay
    setTimeout(() => {
      setIsLoading(false);
      const displayName = isRegister ? name.trim() : 'المستخدم الذكي';
      onLogin(email.trim(), displayName);
    }, 1200);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin('guest@smartledger.com', 'مستثمر تجريبي');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-[radial-gradient(circle_at_center,_#2e1a47_0%,_#0d0d2b_100%)] p-4 font-sans select-none">
      {/* Subtle Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#9b59b6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#3a7bd5]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-[400px] bg-white/5 backdrop-blur-[15px] border border-white/10 rounded-[24px] p-8 md:p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] my-8"
        id="login-screen-card"
      >
        {/* Animated App Logo Area */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mx-auto w-20 h-20 bg-gradient-to-tr from-[#3a7bd5] to-[#9b59b6] rounded-2xl flex items-center justify-center shadow-lg shadow-[#9b59b6]/30 mb-6"
        >
          <span className="text-3xl font-black text-white select-none">م</span>
        </motion.div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
          {isRegister ? 'إنشاء حساب جديد' : 'مرحباً بك مجدداً'}
        </h2>
        <p className="text-xs text-slate-300/80 mb-8 font-medium">
          {isRegister ? 'سجل معنا للتحكم الفوري بمستنداتك المالية' : 'سجل الدخول للمنصة الذكية لإدارة الديون والصرفيات'}
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-300 text-right font-semibold"
            id="login-error-alert"
          >
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {isRegister && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 mr-1">الاسم الكامل</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-transparent hover:bg-white/[0.12] focus:bg-slate-950/80 focus:border-[#9b59b6]/40 py-3.5 pl-4 pr-10 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#9b59b6]/20 transition-all text-right"
                  placeholder="مثال: أحمد محمد"
                  id="login-name-input"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300 mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-transparent hover:bg-white/[0.12] focus:bg-slate-950/80 focus:border-[#9b59b6]/40 py-3.5 pl-4 pr-10 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#9b59b6]/20 transition-all text-left dir-ltr"
                placeholder="yourname@example.com"
                id="login-email-input"
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 mr-1">رقم الهاتف (اختياري)</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-transparent hover:bg-white/[0.12] focus:bg-slate-950/80 focus:border-[#9b59b6]/40 py-3.5 pl-4 pr-10 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#9b59b6]/20 transition-all text-left dir-ltr"
                  placeholder="050XXXXXXX"
                  id="login-phone-input"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300 mr-1">كلمة المرور</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <Lock size={16} />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 hover:text-white transition-all cursor-pointer"
                id="login-toggle-password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-transparent hover:bg-white/[0.12] focus:bg-slate-950/80 focus:border-[#9b59b6]/40 py-3.5 pl-10 pr-10 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#9b59b6]/20 transition-all text-right"
                placeholder="******"
                id="login-password-input"
              />
            </div>
          </div>

          {!isRegister && (
            <div className="text-left">
              <a href="#" className="text-xs text-[#9b59b6] hover:underline hover:text-[#9b59b6]/80 transition-colors">
                نسيت كلمة المرور؟
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#3a7bd5] to-[#9b59b6] hover:opacity-90 active:scale-[0.98] text-white font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#9b59b6]/20 disabled:opacity-50"
            id="login-submit-button"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>{isRegister ? 'سجل الآن' : 'تسجيل الدخول'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
          <p className="text-xs text-slate-300 font-medium">
            {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-[#9b59b6] font-bold hover:underline cursor-pointer"
              id="login-switch-mode"
            >
              {isRegister ? 'سجل دخولك' : 'سجل حساب جديد'}
            </button>
          </p>

          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            id="login-guest-button"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>الدخول السريع كـ مستثمر تجريبي</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

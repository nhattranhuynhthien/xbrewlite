'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/menu';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="p-6 min-h-[85vh] flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brew-600 to-brew-400 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <Coffee className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Đăng nhập BrewLite</h1>
        <p className="text-xs text-slate-500 mt-1">
          Nhập thông tin tài khoản để đặt món và theo dõi đơn
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl p-3.5 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brew-500"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brew-500"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brew-600 hover:bg-brew-700 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
        >
          {loading ? (
            <span>Đang xác thực...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Presets (TV2: S2-42) */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
          Tài khoản Demo (1-Click điền thử)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('customer@brewlite.vn')}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold text-center transition"
          >
            Khách hàng mẫu
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('staff@brewlite.vn')}
            className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[11px] font-semibold text-center transition"
          >
            Nhân viên Barista
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link href="/auth/register" className="font-bold text-brew-600 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

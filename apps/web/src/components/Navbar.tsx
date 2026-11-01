'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
      <Link href="/menu" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brew-600 to-brew-400 flex items-center justify-center text-white shadow-sm">
          <Coffee className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-slate-800">BrewLite</span>
          <span className="text-[10px] block font-semibold text-brew-600 -mt-1 tracking-wider uppercase">Coffee &amp; Tea</span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-full py-1 px-2.5">
            <span className="text-xs font-medium text-slate-700 max-w-[90px] truncate">
              {user?.fullName?.split(' ').pop() || user?.email}
            </span>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="text-slate-400 hover:text-red-500 transition ml-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-brew-600 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </Link>
        )}

        <Link
          href="/cart"
          className="relative w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-brew-50 hover:text-brew-600 transition"
          aria-label="Giỏ hàng"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brew-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-scale">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

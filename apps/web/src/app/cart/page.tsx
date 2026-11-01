'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, Tag, Check, Coffee } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api-client';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalAmount, isHydrated } = useCart();
  const { isAuthenticated } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalTotal: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await apiRequest<{
        valid: boolean;
        code: string;
        discountPercent: number;
        discountAmount: number;
        finalTotal: number;
      }>(`/promotions/validate?code=${encodeURIComponent(promoCode.trim())}&amount=${totalAmount}`);

      setDiscountInfo(res);
    } catch (err: any) {
      setPromoError(err.message || 'Mã khuyến mãi không hợp lệ');
      setDiscountInfo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (!isHydrated) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-brew-50 text-brew-600 flex items-center justify-center mb-4">
          <Coffee className="w-10 h-10" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-6">
          Hãy khám phá menu đồ uống tươi ngon của BrewLite và chọn món bạn yêu thích nhé!
        </p>
        <Link
          href="/menu"
          className="px-6 py-2.5 bg-brew-600 text-white rounded-2xl text-xs font-bold hover:bg-brew-700 transition shadow-sm"
        >
          Xem thực đơn ngay
        </Link>
      </div>
    );
  }

  const finalAmount = discountInfo ? discountInfo.finalTotal : totalAmount;

  return (
    <div className="p-4 pb-20">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-extrabold text-slate-800">Giỏ hàng của bạn</h1>
          <span className="text-[11px] text-slate-400 font-medium">({items.length} loại món)</span>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-red-500 font-medium flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex gap-3"
          >
            {/* Image */}
            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brew-50 text-brew-600 text-xs font-bold">
                  BL
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-300 hover:text-red-500 p-0.5"
                    title="Xóa món"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-1">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-600">
                    Size {item.sizeName}
                  </span>
                  {item.toppings?.map((t) => (
                    <span key={t.id} className="bg-brew-50 text-brew-700 px-1.5 py-0.5 rounded">
                      +{t.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                <span className="font-extrabold text-xs text-brew-700">
                  {item.subtotal.toLocaleString('vi-VN')} đ
                </span>

                {/* Counter */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-700 active:scale-90"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-3 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-700 active:scale-90"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promotion Code Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
          <Tag className="w-4 h-4 text-brew-600" /> Mã khuyến mãi / Giảm giá
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã (VD: BREW10)"
            className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs uppercase font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brew-500"
          />
          <button
            type="button"
            onClick={handleApplyPromo}
            disabled={promoLoading || !promoCode.trim()}
            className="px-4 py-2 bg-brew-600 text-white rounded-xl text-xs font-bold hover:bg-brew-700 disabled:opacity-50 transition"
          >
            {promoLoading ? 'Kiểm tra...' : 'Áp dụng'}
          </button>
        </div>

        {promoError && <p className="text-[11px] text-red-500 mt-2 font-medium">{promoError}</p>}

        {discountInfo && (
          <div className="mt-2.5 bg-green-50 text-green-700 rounded-xl p-2 text-xs flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4 text-green-600" />
            Đã áp dụng mã <b>{discountInfo.code}</b> (-{discountInfo.discountAmount.toLocaleString('vi-VN')} đ)
          </div>
        )}
      </div>

      {/* Bill Summary */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Tổng tiền món</span>
          <span className="font-semibold text-slate-700">
            {totalAmount.toLocaleString('vi-VN')} đ
          </span>
        </div>
        {discountInfo && (
          <div className="flex justify-between text-xs text-green-600">
            <span>Chiết khấu ({discountInfo.discountPercent}%)</span>
            <span className="font-semibold">
              -{discountInfo.discountAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        )}
        <div className="flex justify-between text-xs text-slate-500">
          <span>Phí phục vụ / Bao bì</span>
          <span className="font-semibold text-green-600">Miễn phí</span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">Thành tiền thanh toán</span>
          <span className="text-base font-black text-brew-700">
            {finalAmount.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Checkout Action Button */}
      <button
        onClick={handleProceedToCheckout}
        className="w-full py-3.5 px-4 bg-brew-600 hover:bg-brew-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brew-600/20 active:scale-98 transition"
      >
        <span>Xác nhận thông tin &amp; Đặt hàng</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

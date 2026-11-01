'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api-client';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'E-WALLET' | 'CARD'>('E-WALLET');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
    if (user) {
      setCustomerName(user.fullName || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user, isAuthenticated, isLoading, router]);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleCheckoutAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      router.push('/menu');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let orderId = createdOrderId;

      // Bước 1: Nếu chưa tạo Order, gọi POST /orders trong Transaction (TV4: S2-10)
      if (!orderId) {
        const orderPayload = {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          note: note.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            sizeCode: i.sizeCode,
            quantity: i.quantity,
            toppingIds: i.toppings?.map((t) => t.id) || [],
          })),
        };

        const newOrder = await apiRequest<{ id: string; orderCode: string }>('/orders', {
          method: 'POST',
          body: JSON.stringify(orderPayload),
        });

        orderId = newOrder.id;
        setCreatedOrderId(orderId);
      }

      // Bước 2: Sinh Idempotency-Key và gọi POST /payments (TV4: S2-12, S2-13)
      const idempotencyKey = generateUUID();

      const paymentPayload = {
        orderId,
        method: paymentMethod,
        amount: totalAmount,
        simulateFailure,
      };

      const paymentRes = await apiRequest<{ success: boolean; paymentStatus: string }>(
        '/payments',
        {
          method: 'POST',
          idempotencyKey,
          body: JSON.stringify(paymentPayload),
        },
      );

      // Bước 3: Thanh toán thành công -> Dọn giỏ hàng & chuyển sang trang theo dõi đơn
      clearCart();
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Thanh toán không thành công. Vui lòng kiểm tra lại số dư hoặc thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-20">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
      </button>

      <h1 className="text-base font-extrabold text-slate-800 mb-4">Xác nhận đơn &amp; Thanh toán</h1>

      <form onSubmit={handleCheckoutAndPay} className="space-y-4">
        {/* Recipient Details */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Thông tin người nhận
          </h2>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Họ và tên *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brew-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Số điện thoại *
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Ví dụ: 0901234567"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brew-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Ghi chú phục vụ (Số bàn / Tùy chọn đá, đường)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Bàn 04 lầu 1, ít ngọt"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brew-500"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Phương thức thanh toán mô phỏng
          </h2>

          <div className="space-y-2">
            <label
              onClick={() => setPaymentMethod('E-WALLET')}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                paymentMethod === 'E-WALLET'
                  ? 'border-brew-600 bg-brew-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Ví điện tử mô phỏng</span>
                  <span className="text-[10px] text-slate-400">Momo / ZaloPay Gateway Mock</span>
                </div>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'E-WALLET'}
                onChange={() => setPaymentMethod('E-WALLET')}
                className="text-brew-600 focus:ring-brew-500"
              />
            </label>

            <label
              onClick={() => setPaymentMethod('CARD')}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                paymentMethod === 'CARD'
                  ? 'border-brew-600 bg-brew-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Thẻ ngân hàng mô phỏng</span>
                  <span className="text-[10px] text-slate-400">Visa / Mastercard / Napas Mock</span>
                </div>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'CARD'}
                onChange={() => setPaymentMethod('CARD')}
                className="text-brew-600 focus:ring-brew-500"
              />
            </label>
          </div>

          {/* Test toggle for grading demonstration */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-[11px] text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="font-medium text-amber-700">
                [Demo Test] Giả lập thẻ lỗi / ví không đủ tiền (Kiểm thử nhánh thất bại &amp; thử lại)
              </span>
            </label>
          </div>
        </div>

        {/* Security / Idempotency Notice */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-brew-600 flex-shrink-0" />
          <span>Giao dịch được bảo vệ bằng cơ chế <b>Idempotency-Key</b> chống trừ tiền trùng lặp.</span>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Giao dịch chưa hoàn tất</p>
              <p className="text-[11px] text-red-600 mt-0.5">{errorMessage}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Đơn hàng của bạn vẫn được lưu lại an toàn. Bạn có thể bấm nút thử lại hoặc đổi phương thức thanh toán.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Tổng thanh toán</span>
            <span className="text-base font-black text-brew-700">
              {totalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-6 bg-brew-600 hover:bg-brew-700 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : errorMessage ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại thanh toán</span>
              </>
            ) : (
              <span>Thanh toán ngay</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { apiRequest } from '../../../lib/api-client';

interface OrderItemDetail {
  id: string;
  productName: string;
  sizeCode: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  toppings: Array<{ id: string; toppingName: string; price: number }>;
}

interface OrderDetail {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  note?: string;
  createdAt: string;
  items: OrderItemDetail[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOrderDetail = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiRequest<OrderDetail>(`/orders/${orderId}`);
      setOrder(data);
      setLastRefreshed(new Date());
    } catch (err: any) {
      if (!silent) setError(err.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetail();

    // Auto-polling every 5 seconds (TV6: S2-24, NFR-14)
    const interval = setInterval(() => {
      fetchOrderDetail(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const steps = [
    { key: 'PAID', label: 'Đã thanh toán', desc: 'Đơn đã tiếp nhận' },
    { key: 'PREPARING', label: 'Đang pha chế', desc: 'Barista đang chuẩn bị' },
    { key: 'READY', label: 'Đã sẵn sàng', desc: 'Mời bạn nhận tại quầy' },
    { key: 'COMPLETED', label: 'Hoàn tất', desc: 'Chúc bạn ngon miệng!' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'PAID':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 1;

  return (
    <div className="p-4 pb-20">
      {/* Back button */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Danh sách đơn
        </button>
        <button
          onClick={() => fetchOrderDetail(false)}
          className="text-xs text-brew-600 hover:text-brew-700 flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-brew-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Đang tải trạng thái đơn hàng...</p>
        </div>
      ) : error || !order ? (
        <div className="bg-red-50 p-4 rounded-2xl text-xs text-red-600 text-center">
          {error || 'Không tìm thấy đơn hàng'}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Header Box */}
          <div className="bg-gradient-to-br from-brew-800 to-brew-600 rounded-3xl p-5 text-white shadow-lg text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 text-white shadow-inner">
              <Coffee className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-brew-200">
              Mã đơn hàng: #{order.orderCode}
            </span>
            <h1 className="text-lg font-black tracking-tight mt-0.5">
              {order.status === 'READY'
                ? 'Đồ uống của bạn đã sẵn sàng!'
                : order.status === 'PREPARING'
                ? 'Barista đang pha chế món...'
                : order.status === 'COMPLETED'
                ? 'Đơn hàng đã hoàn tất'
                : 'Đã thanh toán thành công'}
            </h1>
            <p className="text-xs text-brew-100 mt-1 max-w-xs mx-auto">
              Tự động cập nhật theo thời gian thực (Lần cuối:{' '}
              {lastRefreshed.toLocaleTimeString('vi-VN')})
            </p>
          </div>

          {/* 4-Step Timeline Progress Bar (TV6: S2-24) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Tiến trình đơn hàng
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {steps.map((st, idx) => {
                const isPassed = currentStepIdx >= idx + 1;
                const isCurrent = currentStepIdx === idx + 1;

                return (
                  <div key={st.key} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 transition ${
                        isPassed
                          ? 'bg-brew-600 border-brew-600 text-white'
                          : 'bg-white border-slate-300 text-slate-300'
                      }`}
                    >
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <h3
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-brew-700 font-extrabold'
                            : isPassed
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {st.label}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-brew-600" /> Chi tiết món đã đặt
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items.map((it) => (
                <div key={it.id} className="py-2.5 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{it.productName}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        Size {it.sizeCode}
                      </span>
                    </div>

                    {it.toppings && it.toppings.length > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Topping: {it.toppings.map((t) => t.toppingName).join(', ')}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      SL: {it.quantity} x {Number(it.unitPrice).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <span className="text-xs font-black text-slate-700">
                    {Number(it.subtotal).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Tổng thanh toán</span>
              <span className="text-base font-black text-brew-700">
                {Number(order.totalAmount).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p>
              <b>Người nhận:</b> {order.customerName} ({order.customerPhone})
            </p>
            {order.note && (
              <p>
                <b>Ghi chú:</b> {order.note}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

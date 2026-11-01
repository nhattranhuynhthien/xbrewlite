'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ChevronRight, CheckCircle2, AlertCircle, Coffee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api-client';
import EmptyState from '../../components/EmptyState';
import ErrorAlert from '../../components/ErrorAlert';

interface OrderSummary {
  id: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    sizeCode: string;
  }>;
}

export default function OrdersHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<OrderSummary[]>('/orders');
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/orders');
      } else {
        fetchOrders();
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Chờ thanh toán</span>;
      case 'PAID':
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Đã thanh toán</span>;
      case 'PREPARING':
        return <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">Đang pha chế</span>;
      case 'READY':
        return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Đã sẵn sàng</span>;
      case 'COMPLETED':
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Đã hoàn thành</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Đã hủy</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-extrabold text-slate-800">Lịch sử đơn hàng</h1>
          <p className="text-[11px] text-slate-400">Theo dõi và xem lại các món đã đặt</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Chưa có đơn hàng nào"
          description="Bạn chưa đặt món nào tại BrewLite. Hãy mở menu và chọn đồ uống nhé!"
          actionText="Khám phá Menu"
          onAction={() => router.push('/menu')}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => (
            <Link
              key={ord.id}
              href={`/orders/${ord.id}`}
              className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-brew-300 hover:shadow-md transition active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs text-slate-800 tracking-wider">
                  #{ord.orderCode}
                </span>
                {getStatusBadge(ord.status)}
              </div>

              <div className="text-xs text-slate-600 mb-2">
                {ord.items?.map((it, idx) => (
                  <span key={it.id}>
                    {it.quantity}x {it.productName} ({it.sizeCode})
                    {idx < ord.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ord.createdAt).toLocaleDateString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
                <span className="font-black text-xs text-brew-700">
                  {Number(ord.totalAmount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

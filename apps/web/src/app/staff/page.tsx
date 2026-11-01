'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Coffee, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api-client';

interface StaffOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  note?: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    sizeCode: string;
    quantity: number;
    toppings?: Array<{ toppingName: string }>;
  }>;
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, isStaff, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStaffOrders = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<StaffOrder[]>('/orders');
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isStaff) {
        router.push('/auth/login?redirect=/staff');
      } else {
        fetchStaffOrders();
      }
    }
  }, [isAuthenticated, isStaff, isLoading, router]);

  const updateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      await fetchStaffOrders();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
            Chế độ Barista / Quầy
          </span>
          <h1 className="text-base font-extrabold text-slate-800">Quản lý Đơn hàng Quầy</h1>
        </div>
        <button
          onClick={fetchStaffOrders}
          className="text-xs text-brew-600 hover:text-brew-700 flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse h-28" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-8 text-xs text-slate-400">
          Hiện tại không có đơn hàng nào cần xử lý.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => {
            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800">
                    #{ord.orderCode} - {ord.customerName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {ord.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                  {ord.items?.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        <b>{it.quantity}x</b> {it.productName} ({it.sizeCode})
                        {it.toppings && it.toppings.length > 0 && (
                          <span className="text-slate-400 text-[10px] block">
                            Topping: {it.toppings.map((t) => t.toppingName).join(', ')}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  {ord.note && (
                    <p className="text-[10px] text-amber-700 font-semibold pt-1 border-t border-slate-200">
                      Ghi chú: {ord.note}
                    </p>
                  )}
                </div>

                {/* State Machine Transition Buttons (TV3: S2-09, TV5: S2-43) */}
                <div className="flex items-center gap-2 pt-1">
                  {ord.status === 'PAID' && (
                    <button
                      onClick={() => updateStatus(ord.id, 'PREPARING')}
                      disabled={updatingId === ord.id}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Bắt đầu pha chế (PREPARING)
                    </button>
                  )}

                  {ord.status === 'PREPARING' && (
                    <button
                      onClick={() => updateStatus(ord.id, 'READY')}
                      disabled={updatingId === ord.id}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Pha chế xong / Sẵn sàng (READY)
                    </button>
                  )}

                  {ord.status === 'READY' && (
                    <button
                      onClick={() => updateStatus(ord.id, 'COMPLETED')}
                      disabled={updatingId === ord.id}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Khách đã nhận (COMPLETED)
                    </button>
                  )}

                  {ord.status === 'COMPLETED' && (
                    <span className="text-[11px] text-slate-400 font-medium italic">
                      Đơn đã hoàn tất
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

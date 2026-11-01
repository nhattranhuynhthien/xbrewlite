'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { useCart, CartItemTopping } from '../context/CartContext';
import { apiRequest } from '../lib/api-client';

interface SizeOption {
  id: string;
  code: string;
  name: string;
  extraPrice: number;
}

interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  description?: string;
  stock: number;
  isAvailable: boolean;
  sizes: SizeOption[];
  availableToppings: ToppingOption[];
}

interface ProductDetailModalProps {
  productId: string | null;
  onClose: () => void;
}

export default function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (!productId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    apiRequest<ProductDetail>(`/products/${productId}`)
      .then((data) => {
        if (mounted) {
          setProduct(data);
          // Default to Medium or first size
          const defaultSize = data.sizes?.find((s) => s.code === 'M') || data.sizes?.[0] || null;
          setSelectedSize(defaultSize);
          setSelectedToppings([]);
          setQuantity(1);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Lỗi khi tải chi tiết sản phẩm');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [productId]);

  if (!productId) return null;

  const toggleTopping = (topping: ToppingOption) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  // Tính giá động (Reactive Price Update - TV5: S2-17)
  const basePrice = Number(product?.basePrice || 0);
  const sizeExtra = Number(selectedSize?.extraPrice || 0);
  const toppingsExtra = selectedToppings.reduce((sum, t) => sum + Number(t.price), 0);
  const unitPrice = basePrice + sizeExtra + toppingsExtra;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      sizeCode: selectedSize?.code || 'M',
      sizeName: selectedSize?.name || 'Vừa (M)',
      toppings: selectedToppings.map((t) => ({
        id: t.id,
        name: t.name,
        price: Number(t.price),
      })),
      unitPrice,
      quantity,
    });

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-brew-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Đang tải tùy chọn món...</p>
          </div>
        ) : error || !product ? (
          <div className="p-6 text-center text-red-500 text-sm">
            {error || 'Không tìm thấy sản phẩm'}
          </div>
        ) : (
          <>
            {/* Banner Image */}
            <div className="h-48 w-full bg-slate-100 relative overflow-hidden flex-shrink-0">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Info Body */}
            <div className="p-5 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brew-600 bg-brew-50 px-2 py-0.5 rounded-full inline-block mb-1">
                {product.category}
              </span>
              <h2 className="text-lg font-extrabold text-slate-800">{product.name}</h2>
              {product.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Sizes Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Chọn Size ly (Bắt buộc)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {product.sizes.map((s) => {
                      const isSelected = selectedSize?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            isSelected
                              ? 'border-brew-600 bg-brew-50/80 text-brew-900 font-bold shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs">{s.name}</div>
                          <div className="text-[10px] text-brew-600 mt-0.5 font-semibold">
                            {Number(s.extraPrice) > 0
                              ? `+${Number(s.extraPrice).toLocaleString('vi-VN')} đ`
                              : 'Tiêu chuẩn'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toppings Selection */}
              {product.availableToppings && product.availableToppings.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Thêm Topping yêu thích
                  </label>
                  <div className="space-y-1.5">
                    {product.availableToppings.map((top) => {
                      const isChecked = selectedToppings.some((t) => t.id === top.id);
                      return (
                        <div
                          key={top.id}
                          onClick={() => toggleTopping(top)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? 'border-brew-600 bg-brew-50/60'
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                isChecked
                                  ? 'bg-brew-600 border-brew-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-medium text-slate-700">{top.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-600">
                            +{Number(top.price).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Số lượng
                </span>
                <div className="flex items-center gap-3 bg-slate-100 rounded-full px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-xs active:scale-90"
                    aria-label="Giảm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-4 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-7 h-7 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-xs active:scale-90"
                    aria-label="Tăng"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Tạm tính ({quantity} món)</span>
                <span className="text-base font-black text-brew-700">
                  {totalPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 bg-brew-600 hover:bg-brew-700 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <ShoppingBag className="w-4 h-4" />
                {addedToast ? 'Đã thêm thành công!' : 'Thêm vào giỏ hàng'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

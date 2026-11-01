'use client';

import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  description?: string;
  stock: number;
  isAvailable: boolean;
  onSelect: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  category,
  basePrice,
  imageUrl,
  description,
  stock,
  isAvailable,
  onSelect,
}: ProductCardProps) {
  const isOutOfStock = !isAvailable || stock <= 0;

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(id)}
      className={`bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-3 transition relative overflow-hidden ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:border-brew-300 hover:shadow-md active:scale-[0.99]'
      }`}
    >
      {/* Product Image */}
      <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brew-50 text-brew-600 font-bold text-lg">
            BL
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
            Hết hàng
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brew-600 bg-brew-50 px-2 py-0.5 rounded-full inline-block mb-1">
            {category}
          </span>
          <h3 className="font-bold text-sm text-slate-800 line-clamp-1 leading-snug">{name}</h3>
          {description && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-sm text-brew-700">
            {Number(basePrice).toLocaleString('vi-VN')} đ
          </span>

          {isOutOfStock ? (
            <span className="text-[11px] font-medium text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Hết
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
              }}
              className="w-7 h-7 rounded-full bg-brew-600 text-white flex items-center justify-center hover:bg-brew-700 active:scale-90 transition shadow-sm"
              aria-label={`Chọn món ${name}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
